#!/usr/bin/env python3
"""Exercise the real WebGL NeuroScope under /femur-3d/ with touch and UI controls.

Requires Playwright and Chromium. Results describe automated Chromium/SwiftShader,
not a hardware iPad or Safari test. Only allowlisted static files are served.
"""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import shutil
from threading import Thread
import time

from playwright.sync_api import sync_playwright
from browser_qa import SiteServer

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / 'histologie/neuroscope'
VIEWPORTS = [(1440, 1000), (1366, 900), (1194, 834), (1024, 768), (834, 1194), (768, 1024), (390, 844), (320, 800)]


def snapshot(page):
    return page.evaluate('NEUROSCOPE.snapshot()')


def range_value(page, selector, value):
    page.locator(selector).evaluate('(el,value)=>{el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));}', str(value))


def select(page, id):
    frame=snapshot(page)['scene']['frameCount']
    page.locator('#structure-select').select_option(id)
    page.wait_for_function('([id,frame])=>{const s=NEUROSCOPE.snapshot();return s.selected===id && s.scene.viewId===s.model && s.scene.renderedViewId===s.model && s.scene.meshCount>0 && s.scene.renderCalls>0 && s.scene.frameCount>frame && !s.scene.error;}', arg=[id,frame])
    page.wait_for_timeout(70)


def scene_image(page):
    return sha256(page.locator('#scene canvas').screenshot()).hexdigest()


def changed(a, b, tolerance=.001):
    return any(abs(x-y) > tolerance for x,y in zip(a,b))


def touch_sequence(cdp, points):
    for index, positions in enumerate(points):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart' if index == 0 else 'touchMove', 'touchPoints': [{'x': x,'y':y,'id':i+1} for i,(x,y) in enumerate(positions)]})
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--executable',default=None)
    parser.add_argument('--output-dir',required=True)
    parser.add_argument('--pdf',default=None,help='Optional local source, never served or copied into the site')
    args=parser.parse_args()
    output=Path(args.output_dir);output.mkdir(parents=True,exist_ok=True)
    report_path=output/'chromium-report.json'
    server=ThreadingHTTPServer(('127.0.0.1',0),SiteServer);server.baseline=b'';server.files={}
    for file in sorted({p for extension in ('*.html','*.js','*.css','*.svg') for p in ROOT.rglob(extension) if '.git' not in p.parts}):
        rel=file.relative_to(ROOT).as_posix();server.files['/femur-3d/'+rel]=file
        if file.name=='index.html':server.files['/femur-3d/'+rel.removesuffix('index.html')]=file
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/femur-3d/'
    url=base+'histologie/neuroscope/'
    errors=[];responses=[];requests=[]
    report={'status':'running','started_at_utc':datetime.now(timezone.utc).isoformat(),'engine':'Chromium / SwiftShader','safari_or_real_ipad_tested':False,'project_base':'/femur-3d/','checks':{},'input_sha256':{str(p.relative_to(ROOT)):sha256(p.read_bytes()).hexdigest() for p in sorted(set(MODULE.rglob('*.js'))|set(MODULE.rglob('*.html'))|set(MODULE.rglob('*.css'))|{Path(__file__).resolve()})}}
    report_path.write_text(json.dumps(report,indent=2)+'\n')
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,executable_path=args.executable or shutil.which('chromium') or p.chromium.executable_path,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'])
            report['browser_version']=browser.version
            context=browser.new_context(viewport={'width':1366,'height':900},has_touch=True,device_scale_factor=1,reduced_motion='reduce')
            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:responses.append((r.url,r.status)));page.on('request',lambda r:requests.append((r.url,r.method)))
            response=page.goto(url,wait_until='networkidle');assert response.status==200
            page.wait_for_function('window.NEUROSCOPE && NEUROSCOPE.snapshot().scene.meshCount>0 && NEUROSCOPE.snapshot().scene.renderCalls>0')
            data=page.evaluate("async()=>{const a=await import('./anatomy-data.js');const c=await import('./content.js');return {structures:a.structures,questions:c.questions,source:c.source};}")
            before=snapshot(page);assert before['scene']['renderCalls']>0;assert before['scene']['reducedMotion']
            assert not any('/models-micro.js' in r[0] for r in responses),'Microstructures should load on demand'
            page.wait_for_timeout(350);frame=snapshot(page)['scene']['frameCount'];page.wait_for_timeout(180);assert snapshot(page)['scene']['frameCount']-frame<=2,'Reduced motion should leave idle renderer still after settling frames'
            report['checks']['progressive_loading_and_reduced_motion']=True
            # Every selectable structure renders actual meshes; context remains on selected ID.
            views=[];report['checks']['views']=views
            for id,s in data['structures'].items():
                select(page,id);state=snapshot(page)
                assert page.locator('#structure-name').inner_text()==s['name'],id
                assert state['scene']['meshCount']>0 and state['scene']['geometryCount']>0 and state['scene']['renderCalls']>0,id
                assert state['scene']['error'] is None,id
                assert len(state['scene']['labels'])>0,id
                assert page.locator('#structure-content').inner_text().strip(),id
                assert page.locator('#structure-trap').inner_text().strip(),id
                views.append({'id':id,'model':state['model'],'meshes':state['scene']['meshCount'],'geometries':state['scene']['geometryCount'],'labels':len(state['scene']['labels'])})
            report['checks']['views']=views;print(f'PASS {len(views)} structures et modèles 3D',flush=True)
            select(page,'body');path=['head','meninges','cortex','gray-matter','neuropil','neuron','synapse']
            for target in path:
                page.locator('#micro-zoom').click();page.wait_for_function('(id)=>NEUROSCOPE.snapshot().selected===id && NEUROSCOPE.snapshot().scene.viewId===NEUROSCOPE.snapshot().model',arg=target)
                assert page.locator('#breadcrumbs button').count()>1,target
            page.locator('#breadcrumbs button').first.click();page.wait_for_function('NEUROSCOPE.snapshot().selected==="body"');report['checks']['hierarchy_and_breadcrumbs']=path
            # Real camera controls: buttons, mouse drag, right-button pan, two-touch pinch/pan.
            select(page,'body');page.locator('#camera-reset').click();before=snapshot(page)['scene'];page.locator('#zoom-in').click();after=snapshot(page)['scene']
            distance=lambda s:sum((x-y)**2 for x,y in zip(s['cameraPosition'],s['cameraTarget']))
            assert distance(after)<distance(before),'Zoom + must move toward the model'
            page.locator('#camera-reset').click();page.locator('#labels-toggle').uncheck()
            box=page.locator('#scene canvas').bounding_box();x=box['x']+box['width']*.5;y=box['y']+box['height']*.55
            before=snapshot(page)['scene'];page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+90,y+30,steps=8);page.mouse.up();after=snapshot(page)['scene'];assert changed(before['cameraPosition'],after['cameraPosition']),'Drag rotation'
            before=after;page.mouse.move(x,y);page.mouse.down(button='right');page.mouse.move(x+35,y+30,steps=6);page.mouse.up(button='right');after=snapshot(page)['scene'];assert changed(before['cameraTarget'],after['cameraTarget']),'Drag pan'
            cdp=context.new_cdp_session(page);before=after
            touch_sequence(cdp,[[[x-35,y],[x+35,y]],[[x-55,y],[x+55,y]],[[x-80,y],[x+80,y]]]);page.wait_for_timeout(80);after=snapshot(page)['scene'];assert abs(distance(after)-distance(before))>.01,'Two-finger pinch'
            before=after;touch_sequence(cdp,[[[x-35,y],[x+35,y]],[[x-15,y+20],[x+55,y+20]],[[x+5,y+40],[x+75,y+40]]]);page.wait_for_timeout(80);after=snapshot(page)['scene'];assert changed(before['cameraTarget'],after['cameraTarget']),'Two-finger pan'
            report['checks']['camera_buttons_rotation_mouse_pan_touch_pinch_pan']=True
            page.locator('#camera-reset').click();page.locator('#labels-toggle').check();page.wait_for_timeout(80)
            visible=page.locator('#scene .scene-label:visible').first;label_id=visible.get_attribute('data-structure');visible.tap();page.wait_for_function('(id)=>NEUROSCOPE.snapshot().selected===id',arg=label_id);assert snapshot(page)['selected']==label_id
            page.locator('#labels-toggle').uncheck();page.wait_for_timeout(80);assert page.locator('#scene .scene-label:visible').count()==0
            select(page,'body');page.locator('#scene canvas').scroll_into_view_if_needed()
            head=next(h for h in snapshot(page)['scene']['hotspots'] if h['id']=='head')
            rect=page.locator('#scene canvas').bounding_box();page.touchscreen.tap(rect['x']+head['x'],rect['y']+head['y'])
            page.wait_for_function('NEUROSCOPE.snapshot().selected!=="body"');assert snapshot(page)['selected'] in data['structures']
            page.locator('#labels-toggle').check();report['checks']['touch_label_selection_and_toggle']=True;report['checks']['touch_mesh_raycast_selection']=True
            # Changing each anatomical plane changes the real render and clipping normal.
            select(page,'brain');page.locator('#section-menu').evaluate('el=>el.open=true');page.locator('#section-enabled').check()
            cuts={}
            for axis,normal in [('sagittal',[-1,0,0]),('coronal',[0,0,-1]),('axial',[0,-1,0])]:
                page.locator('#section-axis').select_option(axis);range_value(page,'#section-position',-50);page.wait_for_timeout(80);a=snapshot(page)['scene'];image=scene_image(page)
                range_value(page,'#section-position',50);page.wait_for_timeout(80);b=snapshot(page)['scene'];assert a['sectionPlane']['normal']==normal,axis;assert a['sectionPlane']['constant']!=b['sectionPlane']['constant'],axis;assert scene_image(page)!=image,axis
                cuts[axis]={'normal':normal,'positions':[-50,50]}
            page.locator('#section-enabled').uncheck();report['checks']['actual_clipping_planes']=cuts
            # Body layers and isolation must affect rendered geometry.
            select(page,'body');page.locator('#layers-menu').evaluate('el=>el.open=true');initial=scene_image(page)
            for layer in ['skin','muscles','bones','nervous']:
                control=page.locator(f'input[data-layer="{layer}"]');control.uncheck();assert next(l for l in snapshot(page)['scene']['layers'] if l['id']==layer)['visible'] is False;control.check();range_value(page,f'input[data-opacity="{layer}"]',17);assert next(l for l in snapshot(page)['scene']['layers'] if l['id']==layer)['opacity']==.17
            assert scene_image(page)!=initial;page.locator('#layers-reset').click();page.locator('#isolate').click();assert snapshot(page)['scene']['nervousOnly'];assert scene_image(page)!=initial;page.locator('#layers-reset').click()
            report['checks']['layers_opacity_isolation']=True
            select(page,'meninges');range_value(page,'#explode',0);a=scene_image(page);range_value(page,'#explode',100);page.wait_for_timeout(80);assert snapshot(page)['scene']['explode']==1;assert scene_image(page)!=a
            page.locator('#traverse').click();assert page.locator('#traverse').get_attribute('aria-pressed')=='true';page.wait_for_timeout(1550);assert '2/9' in page.locator('#traverse-step').inner_text();assert any(l['opacity']==.07 for l in snapshot(page)['scene']['layers']);page.locator('#traverse').click()
            report['checks']['meninges_explosion_and_traversal']=True
            # CSF: actual particle coordinates, pause, speed, central canal exclusion.
            select(page,'csf');before=snapshot(page)['scene'];assert before['flowAvailable'];assert not before['flowPlaying'];page.locator('#flow-play').click();page.wait_for_timeout(300);a=snapshot(page)['scene'];assert a['flowTime']>before['flowTime'];assert a['particlePositions']!=before['particlePositions']
            page.locator('#flow-play').click();a=snapshot(page)['scene'];page.wait_for_timeout(160);assert snapshot(page)['scene']['particlePositions']==a['particlePositions']
            page.locator('#flow-speed').select_option('2');page.locator('#flow-play').click();page.wait_for_timeout(300);b=snapshot(page)['scene'];assert b['flowSpeed']==2;assert b['flowTime']>a['flowTime'];page.locator('#flow-play').click();assert all('canal central' not in p.lower() for p in b['flowPaths'])
            report['checks']['csf_particle_motion_pause_speed']=True
            select(page,'gray-matter');stains={}
            for stain in ['natural','hes','toluidine','luxol','masson']:
                page.locator('#stain').select_option(stain);page.wait_for_timeout(60);assert snapshot(page)['scene']['stain']==stain;stains[stain]=scene_image(page)
            assert len(set(stains.values()))==5,'Stains must change the visible render';report['checks']['stain_render_hashes']=stains
            select(page,'microglia');page.locator('#microglia-active').check();assert snapshot(page)['scene']['microgliaActive'];report['checks']['microglia_morphology_control']=True
            page.locator('[data-mode="compare"]').click();pairs=['graywhite','arrangement','myelin','ganglia','barriers','envelopes'];comparisons=[]
            right_models={'graywhite':'white-matter','arrangement':'spinal-cord','myelin':'schwann','ganglia':'autonomic-ganglion','barriers':'blood-csf','envelopes':'spinal-meninges'}
            left_models={'graywhite':'gray-matter','arrangement':'cortex','myelin':'oligodendrocyte','ganglia':'sensory-ganglion','barriers':'bbb','envelopes':'meninges'}
            for key in pairs:
                page.locator('#comparison-select').select_option(key);page.wait_for_function('(id)=>{const c=NEUROSCOPE.snapshot().comparison;return c && c.viewId===id && c.meshCount>0 && c.renderCalls>0;}',arg=right_models[key]);page.wait_for_timeout(130)
                assert snapshot(page)['scene']['viewId']==left_models[key],key
                assert page.locator('.viewer-column canvas').count()==2;assert page.locator('#comparison-table tbody tr').count()>=2,key
                comparisons.append({'id':key,'model':snapshot(page)['comparison']['viewId']})
                if key=='ganglia':page.locator('#differences-reveal').click();assert page.locator('#differences-answer').is_visible()
            side_by_side=[]
            for width,height in [(1440,1000),(1024,768),(834,1194)]:
                page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(100)
                left=page.locator('#scene canvas').bounding_box();right=page.locator('#comparison-scene canvas').bounding_box()
                assert abs(left['y']-right['y'])<=2,f'Comparison canvases not vertically aligned at {width}'
                assert right['x']>=left['x']+left['width'],f'Comparison canvases not side by side at {width}'
                assert left['width']>=250 and right['width']>=250,f'Comparison too narrow at {width}'
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'Comparison overflow at {width}'
                assert snapshot(page)['scene']['viewId']=='meninges' and snapshot(page)['comparison']['viewId']=='spinal-meninges'
                side_by_side.append({'width':width,'height':height,'left':left,'right':right})
                if width==1024:page.screenshot(path=str(output/'neuroscope-comparison-ipad.png'),full_page=True)
            report['checks']['comparison_side_by_side_geometry']=side_by_side
            page.set_viewport_size({'width':1366,'height':900})
            page.locator('#comparison-close').click();assert page.locator('#comparison-scene canvas').count()==0;report['checks']['comparisons']=comparisons
            page.locator('[data-mode="quiz"]').click();quiz_results=[]
            page.locator('#question-select').select_option('0');page.locator('#quiz-validate').click();assert not snapshot(page)['validated'];assert 'au moins une proposition' in page.locator('#quiz-result').inner_text();assert page.locator('#question-options input:disabled').count()==0
            wrong_index=next(i for i,o in enumerate(data['questions'][0]['options']) if not o['correct'])
            page.locator('#question-options input').nth(wrong_index).check();page.locator('#quiz-validate').click();assert snapshot(page)['validated'];assert 'à revoir' in page.locator('#quiz-result').inner_text();assert page.locator('.quiz-option.incorrect').count()>0;assert page.locator('.option-explanation').count()==5
            report['checks']['quiz_empty_validation_guard_and_wrong_answer_correction']=True
            for index,q in enumerate(data['questions']):
                page.locator('#question-select').select_option(str(index));assert page.locator('#question-options input').count()==5
                for i,option in enumerate(q['options']):
                    if option['correct']:page.locator('#question-options input').nth(i).check()
                page.locator('#quiz-validate').click();assert 'Réponse exacte' in page.locator('#quiz-result').inner_text(),q['id'];assert page.locator('.option-explanation').count()==5
                links=page.locator('.option-explanation button');assert links.count()>0,q['id'];target=links.first.inner_text();links.first.click();assert page.locator('#structure-name').inner_text() in target
                assert page.locator('#quiz-result [data-page]').count()==0 or page.locator('#quiz-result button').count()>0
                quiz_results.append(q['id'])
            report['checks']['original_qrm_correct_ui_and_structure_links']=quiz_results
            page.locator('#quiz-next').click();assert not snapshot(page)['validated'];page.locator('[data-mode="explore"]').click()
            # Source document remains on-device; wrong files never activate page links.
            select(page,'neuron');source_page=page.locator('#structure-sources button').first.get_attribute('data-page');page.locator('#structure-sources button').first.click();assert page.locator('#sources-dialog').evaluate('el=>el.open');assert snapshot(page)['sourcePage']==int(source_page)
            page.locator('#tn1-file').set_input_files({'name':'wrong.pdf','mimeType':'application/pdf','buffer':b'%PDF-wrong'});assert 'ne correspond pas' in page.locator('#pdf-status').inner_text();assert page.locator('#pdf-page-link').is_hidden()
            if args.pdf:
                local=Path(args.pdf);assert local.is_file();assert sha256(local.read_bytes()).hexdigest()==data['source']['sha256']
                requests_before=len(requests);page.locator('#tn1-file').set_input_files(str(local));page.wait_for_function('NEUROSCOPE.snapshot().pdfVerified');href=page.locator('#pdf-page-link').get_attribute('href');assert href.startswith('blob:') and href.endswith('#page='+source_page);assert not [r for r in requests[requests_before:] if r[1]!='GET'];report['checks']['local_pdf_verification']='passed'
                wrong=bytearray(local.read_bytes());wrong[-1]^=1
                page.locator('#tn1-file').set_input_files({'name':'wrong-same-size.pdf','mimeType':'application/pdf','buffer':bytes(wrong)})
                page.wait_for_function('document.querySelector("#pdf-status").textContent.includes("empreinte non conforme")');assert not snapshot(page)['pdfVerified'];assert page.locator('#pdf-page-link').is_hidden()
                report['checks']['same_size_pdf_hash_rejection']=True
            else:report['checks']['local_pdf_verification']='not_run: use --pdf for the private attachment'
            page.locator('#sources-close').click();report['checks']['invalid_pdf_rejection']=True
            # Responsive layout, expanded iPad view, and actual platform return links.
            select(page,'body');responsive=[]
            for width,height in VIEWPORTS:
                page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(80);assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'Overflow {width}x{height}'
                assert page.locator('#scene canvas').bounding_box()['width']>100
                responsive.append({'width':width,'height':height,'overflow':False})
                if width in [1024,834,390]:page.screenshot(path=str(output/f'neuroscope-{width}.png'),full_page=True)
            page.set_viewport_size({'width':1024,'height':768});page.locator('#expand-view').click();page.wait_for_timeout(80);assert page.locator('#expand-view').get_attribute('aria-pressed')=='true';assert not page.evaluate('document.documentElement.scrollWidth>innerWidth');page.screenshot(path=str(output/'neuroscope-ipad-expanded.png'),full_page=True);page.locator('#expand-view').click()
            report['checks']['responsive_views']=responsive
            page.locator('header nav a[href="../"]').tap();page.wait_for_url(base+'histologie/');assert page.locator('a[href*="neuroscope"]').count()>0
            page.locator('a[href*="neuroscope"]').first.tap();page.wait_for_url(url);page.wait_for_function('window.NEUROSCOPE && NEUROSCOPE.snapshot().scene.meshCount>0');page.locator('header nav a[href="../../"]').tap();page.wait_for_url(base);report['checks']['platform_navigation']=True
            # WebGL failure is a documented fallback, not an unhandled exception.
            fallback=context.new_page();fallback_errors=[];fallback.on('pageerror',lambda e:fallback_errors.append(str(e)))
            fallback.add_init_script("(() => {const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/i.test(type))return null;return original.call(this,type,...args);};})();")
            fallback.goto(url);fallback.wait_for_function('window.NEUROSCOPE');assert fallback.locator('.scene-fallback').is_visible();fallback.locator('#structure-select').select_option('neuron');assert fallback.locator('#structure-name').inner_text()==data['structures']['neuron']['name'];assert not fallback_errors;fallback.close();report['checks']['graceful_without_webgl']=True
            assert not errors,errors
            assert not [(u,s) for u,s in responses if s>=400],responses
            assert not [r for r in requests if not r[0].startswith(base)],'Runtime requested remote assets'
            report['checks']['no_javascript_errors_no_http_errors_no_remote_runtime']=True
            context.close();browser.close()
        report['status']='passed';print('PASS NeuroScope UI, gestes tactiles, 3D réelle, coupes, LCS, comparaisons, QRM et chemins GitHub Pages',flush=True)
    except Exception as error:
        report['status']='failed';report['failure']=f'{type(error).__name__}: {error}'
        raise
    finally:
        report['finished_at_utc']=datetime.now(timezone.utc).isoformat();report['javascript_errors']=errors;report['http_errors']=[{'url':u,'status':s} for u,s in responses if s>=400]
        report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n');server.shutdown();server.server_close()


if __name__=='__main__':main()
