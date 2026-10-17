#!/usr/bin/env python3
"""VesiculoScope user flows, animations, references, touch and Pages paths."""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
from http.server import ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
from threading import Thread

from playwright.sync_api import sync_playwright
from browser_qa import SiteServer, ROOT

VIEWPORTS = [(1440,1000),(1366,900),(1194,834),(1024,768),(834,1194),(768,1024),(390,844),(320,800)]


def scrub(page, value):
    page.locator('#step-progress').evaluate('(el,value)=>{el.value=value;el.dispatchEvent(new Event("input",{bubbles:true}));}', str(value))


def state(page):
    return page.evaluate('VESICULOSCOPE.snapshot()')


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--output-dir', default=str(ROOT / 'test-results/vesiculoscope'))
    args.add_argument('--pdf', type=Path)
    opts = args.parse_args()
    output = Path(opts.output_dir); output.mkdir(parents=True, exist_ok=True)
    report_path = output / 'vesiculoscope-report.json'
    files = [p for p in (ROOT / 'biologie-cellulaire/vesiculoscope').iterdir() if p.is_file()]
    files += [ROOT/'index.html', ROOT/'biologie-cellulaire/index.html', Path(__file__).resolve(), ROOT/'scripts/check_vesiculoscope.cjs']
    report = {'status':'running','started_at_utc':datetime.now(timezone.utc).isoformat(),'project_base':'/femur-3d/',
              'input_sha256':{str(p.relative_to(ROOT)):sha256(p.read_bytes()).hexdigest() for p in sorted(files)},'viewports':[]}
    report_path.write_text(json.dumps(report,indent=2)+'\n', encoding='utf-8')
    server=ThreadingHTTPServer(('127.0.0.1',0),SiteServer)
    server.baseline=subprocess.check_output(['git','show','696c28c2386d58a0341391888e2c1ad2664b3300:index.html'],cwd=ROOT)
    server.files={}
    for file in sorted({p for ext in ('*.html','*.js','*.css','*.svg') for p in ROOT.rglob(ext) if '.git' not in p.parts}):
        rel=file.relative_to(ROOT).as_posix();server.files['/femur-3d/'+rel]=file
        if file.name=='index.html':server.files['/femur-3d/'+rel.removesuffix('index.html')]=file
    Thread(target=server.serve_forever,daemon=True).start()
    host=f'http://127.0.0.1:{server.server_port}';base=host+'/femur-3d/';url=base+'biologie-cellulaire/vesiculoscope/'
    errors=[];responses=[];requests=[]
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=shutil.which('chromium') or p.chromium.executable_path,headless=True,args=['--no-sandbox'])
            report['browser_version']=browser.version
            context=browser.new_context(viewport={'width':1440,'height':1000},has_touch=True,reduced_motion='reduce')
            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('response',lambda r:responses.append((r.url,r.status)));page.on('request',lambda r:requests.append(r.url))
            for w,h in VIEWPORTS:
                page.set_viewport_size({'width':w,'height':h});response=page.goto(url,wait_until='networkidle')
                assert response.status==200
                page.wait_for_function('document.querySelector("#simulator").dataset.ready === "true"')
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),f'Overflow at {w}'
                assert page.locator('.cargo-card').count()==4
                assert page.locator('.organelle').count()==13
                controls=page.locator('.cargo-card, .topbar a, .topbar button, .map-toolbar button, .player button, .viewer-heading button')
                assert controls.evaluate_all('els=>els.filter(el=>el.getBoundingClientRect().height>0).every(el=>el.getBoundingClientRect().height>=44)'),f'Touch targets at {w}'
                if w>=760:
                    box=page.locator('.player').bounding_box();assert box['y']+box['height']<=h+2,f'Clipped player at {w}'
                if w in (1440,1024,834,390):page.screenshot(path=str(output/f'vesiculoscope-{w}.png'),full_page=True)
                report['viewports'].append({'width':w,'height':h,'horizontal_overflow':False,'main_controls_min_height':44})
            print('PASS eight responsive layouts, real project subpath and touch controls',flush=True)
            page.set_viewport_size({'width':1440,'height':1000});page.goto(url,wait_until='networkidle')
            data=page.evaluate('VESICULO_DATA.scenarios');checked=[];moving=0;recycling=[]
            for sc in data:
                page.locator(f'.cargo-card[data-scenario="{sc["id"]}"]').tap()
                assert state(page)['scenario']==sc['id']
                assert state(page)['step']==0 and not state(page)['playing']
                for index,step in enumerate(sc['steps']):
                    assert state(page)['step']==index
                    assert page.locator('#step-title').inner_text()==step['title']
                    assert page.locator('#step-body').inner_text()==step['body']
                    refs=page.locator('#step-sources button').evaluate_all('els=>els.map(el=>Number(el.dataset.page))')
                    assert refs==step['pages'],step['id']
                    for key in ('why','trap'):
                        button=page.locator(f'#{key}-toggle')
                        if button.get_attribute('aria-expanded')=='false':button.tap()
                        assert page.locator(f'#{key}-content').is_visible()
                    assert page.locator('#step-why').inner_text()==step['why']
                    assert page.locator('#step-trap').inner_text()==step['trap']
                    scrub(page,0)
                    start=page.locator('#cargo-marker').evaluate('el=>[Number(el.dataset.x),Number(el.dataset.y)]')
                    scrub(page,100)
                    end=page.locator('#cargo-marker').evaluate('el=>[Number(el.dataset.x),Number(el.dataset.y)]')
                    if step.get('range'):
                        assert abs(start[0]-end[0])+abs(start[1]-end[1])>3,step['id'];moving+=1
                    if step['phase']=='uncoat':assert float(page.locator('#coat-shell').evaluate('el=>el.style.opacity'))==0
                    if step['phase']=='fusion':assert float(page.locator('#carrier').evaluate('el=>el.style.opacity'))==0
                    if step.get('actor')=='receptor':
                        assert page.locator('#receptor-diamond').is_visible()
                        assert page.locator('#stationary-cargo').is_visible()
                        node=page.evaluate('(id)=>VESICULO_DATA.nodes[id]',step['cargoHold'])
                        assert page.locator('#stationary-cargo').get_attribute('transform')==f'translate({node["x"]} {node["y"]})'
                        recycling.append(sc['id'])
                    if step.get('external'):
                        assert page.locator('#external-note').is_visible()
                        assert page.locator('#external-links a').count()==len(step['external']['refs'])
                    checked.append(sc['id']+':'+step['id'])
                    if index<len(sc['steps'])-1:page.locator('#next').tap()
                assert page.locator('#next').is_disabled()
            report.update({'steps_checked':checked,'animated_routes_checked':moving,'receptor_cargo_separation':recycling,'all_step_pdf_references_match':True,'coat_removal_and_fusion_visuals':True})
            print(f'PASS {len(checked)} steps, {moving} moving segments, all references and three receptor returns',flush=True)
            # Native player actions: pause is stable, playback advances and speed is applied.
            page.locator('.cargo-card[data-scenario="secretion"]').tap()
            page.locator('#next').tap();page.locator('#speed').select_option('2');page.locator('#play').tap()
            page.wait_for_function('VESICULOSCOPE.snapshot().fraction > .1')
            page.locator('#play').tap();paused=state(page)['fraction'];page.wait_for_timeout(180)
            assert state(page)['fraction']==paused and state(page)['speed']==2
            scrub(page,97);page.locator('#play').tap()
            page.wait_for_function('VESICULOSCOPE.snapshot().step === 2')
            page.locator('#play').tap();page.locator('#previous').tap();assert state(page)['step']==1
            page.locator('#restart').tap();assert state(page)['step']==0 and state(page)['fraction']==0
            page.locator('#speed').select_option('0.5');assert state(page)['speed']==.5
            report['play_pause_speed_previous_next_restart']=True
            # A different coat filter must reveal the corresponding routes across the whole map.
            page.locator('[data-map="all"]').tap()
            assert page.locator('.traffic-route').evaluate_all('els=>els.every(el=>el.style.display!=="none")')
            page.locator('.map-toolbar [data-coat="copi"]').tap()
            assert page.locator('#route-golgiEr').is_visible()
            assert page.locator('#route-erGolgi').evaluate('el=>el.style.display')=='none'
            page.locator('[data-map="selected"]').tap()
            report['route_map_and_coat_filters']=True
            # Scene picking and all accessible compartment selectors.
            page.locator('.organelle-label[data-label="cis"]').tap()
            assert state(page)['selected']=='cis' and state(page)['tab']=='organelle'
            for node in page.evaluate('Object.keys(VESICULO_DATA.nodes)'):
                if not page.locator('#display-menu').evaluate('el=>el.open'):page.locator('#display-menu summary').tap()
                page.locator('#compartment-select').select_option(node)
                page.locator('#display-menu summary').tap()
                assert state(page)['selected']==node
                assert page.locator('#organelle-title').inner_text()==page.evaluate('(id)=>VESICULO_DATA.nodes[id].name',node)
                page.locator('#organelle-visible').uncheck()
                assert page.locator(f'.organelle[data-node="{node}"]').evaluate('el=>el.style.display')=='none'
                page.locator('#organelle-visible').check()
                page.locator('#organelle-opacity').evaluate('el=>{el.value=35;el.dispatchEvent(new Event("input",{bubbles:true}));}')
                assert float(page.locator(f'.organelle[data-node="{node}"]').evaluate('el=>el.style.opacity'))==.35
            page.locator('#display-menu summary').tap();page.locator('#labels-toggle').uncheck()
            assert page.locator('.organelle-label').evaluate_all('els=>els.every(el=>el.style.display==="none")')
            page.locator('#display-reset').tap();assert state(page)['labels'] and not state(page)['hidden']
            page.locator('#display-menu summary').tap();page.locator('#tab-step').tap()
            report['all_structures_selection_visibility_opacity_labels']=13
            # Real mouse and touch events, scoped to the scene.
            page.locator('#zoom-in').tap();assert state(page)['camera']['zoom']>1
            page.locator('#camera-reset').tap();box=page.locator('#cell-scene').bounding_box()
            cx=box['x']+box['width']*.42;cy=box['y']+box['height']*.4
            page.mouse.move(cx,cy);page.mouse.down();page.mouse.move(cx+45,cy+15,steps=5);page.mouse.up()
            assert abs(state(page)['camera']['x'])>0
            page.locator('#camera-reset').tap()
            cdp=context.new_cdp_session(page)
            def touch(kind,points):cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':x,'y':y,'id':i,'radiusX':5,'radiusY':5,'force':1} for i,x,y in points]})
            touch('touchStart',[(1,cx,cy)]);touch('touchMove',[(1,cx+35,cy+10)]);touch('touchEnd',[])
            assert abs(state(page)['camera']['x'])>0
            touch('touchStart',[(2,cx-30,cy),(3,cx+30,cy)]);touch('touchMove',[(2,cx-60,cy),(3,cx+60,cy)]);touch('touchEnd',[])
            assert state(page)['camera']['zoom']>1.5;cdp.detach();page.locator('#camera-reset').tap()
            assert state(page)['camera']=={'x':0,'y':0,'zoom':1}
            page.locator('#cell-scene').focus();page.keyboard.press('+');assert state(page)['camera']['zoom']>1
            page.keyboard.press('r');assert state(page)['camera']['zoom']==1
            report['mouse_touch_pinch_and_keyboard_camera']=True
            # Expanded stage really increases usable scene height on landscape iPad.
            page.set_viewport_size({'width':1024,'height':768});before=page.locator('#scene-wrap').bounding_box()['height']
            page.locator('#viewer-expand').tap();after=page.locator('#scene-wrap').bounding_box()['height']
            assert after>before+70
            page.screenshot(path=str(output/'vesiculoscope-ipad-expanded.png'))
            page.locator('#viewer-expand').tap();report['expanded_landscape_scene']=True
            page.set_viewport_size({'width':1440,'height':1000});page.locator('#play').tap();page.locator('#sources-open').tap()
            assert not state(page)['playing'] and page.locator('#sources-dialog').is_visible()
            assert page.locator('#reference-list a').count()==len(page.evaluate('Object.keys(VESICULO_DATA.sources)'))-1
            assert page.locator('#roadmap button, #roadmap a').count()==0
            if opts.pdf:
                page.locator('#cm5-file').set_input_files(str(opts.pdf))
                page.wait_for_function('document.querySelector("#pdf-status").textContent.startsWith("Fiche vérifiée")')
                assert page.locator('#pdf-page-link').is_visible()
                assert page.locator('#pdf-page-link').get_attribute('href').startswith('blob:')
                page.locator('#cm5-file').set_input_files({'name':'autre.pdf','mimeType':'application/pdf','buffer':b'%PDF-1.3\nwrong version'})
                page.wait_for_function('document.querySelector("#pdf-status").textContent.includes("ne correspond pas")')
                assert page.locator('#pdf-page-link').is_hidden()
                report['local_cm5_verified_and_wrong_version_rejected']=True
            else:
                report['local_cm5_import_test']='not_run: provide --pdf to check the supplied private document'
            page.locator('#sources-close').tap()
            page.locator('#step-sources button').first.tap()
            assert 'page 1' in page.locator('#source-page-note').inner_text()
            page.keyboard.press('Escape');assert not page.locator('#sources-dialog').is_visible()
            report['sources_per_page_and_roadmap_truthful']=True
            page.locator('.topbar nav a').filter(has_text='Biologie cellulaire').tap();page.wait_for_url(base+'biologie-cellulaire/')
            page.get_by_role('link',name='Lancer le VésiculoScope').tap();page.wait_for_url(url)
            page.get_by_role('link',name='Accueil',exact=True).tap();page.wait_for_url(base)
            assert page.locator('h1').inner_text()=='PASS Lyon Sud'
            report['platform_navigation']=True
            assert not errors,errors
            bad=[(u,s) for u,s in responses if s>=400];assert not bad,bad
            assert all(u.startswith(host) for u in requests),'Unexpected network request'
            report.update({'javascript_errors':errors,'http_errors':bad,'external_requests':[],'status':'passed'})
            browser.close()
    except Exception as error:
        report['status']='failed';report['failure']={'type':type(error).__name__,'message':str(error)}
        try:page.screenshot(path=str(output/'failure.png'),full_page=True)
        except Exception:pass
        raise
    finally:
        report['finished_at_utc']=datetime.now(timezone.utc).isoformat()
        report_path.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');server.shutdown();server.server_close()
    print('PASS player, map, 13 structure controls, camera gestures, references and navigation; no JS/HTTP errors',flush=True)


if __name__=='__main__':main()
