#!/usr/bin/env python3
"""Optional real WebKit UI checks. Runtime libraries are never installed here.

Serves a restricted local preview unless --url selects an existing server.
Playwright's standard WebKit installation is used unless
NEURO_WEBKIT_EXECUTABLE overrides it.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import traceback
from datetime import datetime, timezone
from http.server import ThreadingHTTPServer
from threading import Thread
from browser_qa import SiteServer

from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url')
parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
parser.add_argument('--output', type=Path, default=Path('test-results/neuroscope-webkit'))
parser.add_argument('--pdf', type=Path)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
module = args.repo / 'histologie/neuroscope'
assert module.is_dir(), f'Module missing: {module}'
server = None
if not args.url:
    server = ThreadingHTTPServer(('127.0.0.1', 0), SiteServer)
    server.baseline = b''
    server.files = {}
    for extension in ('*.html', '*.js', '*.css', '*.svg'):
        for file in args.repo.rglob(extension):
            if '.git' in file.parts:
                continue
            relative = file.relative_to(args.repo).as_posix()
            server.files['/femur-3d/' + relative] = file
            if file.name == 'index.html':
                server.files['/femur-3d/' + relative.removesuffix('index.html')] = file
    Thread(target=server.serve_forever, daemon=True).start()
    args.url = f'http://127.0.0.1:{server.server_port}/femur-3d/histologie/neuroscope/'


def inputs():
    return {str(path.relative_to(args.repo)): hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(module.rglob('*')) if path.is_file()}


report = {'engine': 'Playwright WebKit', 'status': 'running', 'hardware_ipad_test': 'not_run',
          'started_at_utc': datetime.now(timezone.utc).isoformat(),
          'script_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'url': args.url, 'viewports': [], 'errors': [], 'console_errors': [],
          'bad_requests': [], 'post_requests': [], 'input_sha256_before': inputs()}


def checkpoint():
    (args.output / 'report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))


with sync_playwright() as playwright:
    launch = {'headless': True}
    if os.environ.get('NEURO_WEBKIT_EXECUTABLE'):
        launch['executable_path'] = os.environ['NEURO_WEBKIT_EXECUTABLE']
    checkpoint()
    try:
        browser = playwright.webkit.launch(**launch)
    except Exception as error:
        report.update(status='failed', exception=str(error), finished_at_utc=datetime.now(timezone.utc).isoformat())
        checkpoint()
        if server:
            server.shutdown()
        raise
    report['browser_version'] = browser.version
    try:
        for width, height in [(1024, 768), (834, 1194)]:
            context = browser.new_context(viewport={'width': width, 'height': height},
                                          has_touch=True, device_scale_factor=1, reduced_motion='reduce')
            page = context.new_page()
            page.set_default_timeout(30000)
            page.on('pageerror', lambda error: report['errors'].append(str(error)))
            page.on('console', lambda message: report['console_errors'].append(message.text)
                    if message.type == 'error' else None)
            page.on('response', lambda response: report['bad_requests'].append(
                {'url': response.url, 'status': response.status}) if response.status >= 400 else None)
            page.on('request', lambda request: report['post_requests'].append(
                {'url': request.url, 'method': request.method}) if request.method not in ['GET', 'HEAD'] else None)
            served = {}
            for filename in ['index.html', 'app.js', 'scene.js', 'anatomy-data.js', 'content.js',
                             'models-anatomy.js', 'models-micro.js', 'styles.css']:
                response = context.request.get(args.url + filename)
                assert response.status == 200, (filename, response.status)
                digest = hashlib.sha256(response.body()).hexdigest()
                assert digest == report['input_sha256_before']['histologie/neuroscope/' + filename], filename
                served[filename] = digest
            response = page.goto(args.url, wait_until='networkidle')
            page.wait_for_function("window.NEUROSCOPE && document.querySelector('#explorer').dataset.ready==='true'")
            prefix = f'{width}x{height}'
            result = {'width': width, 'height': height, 'http_status': response.status,
                      'ua': page.evaluate('navigator.userAgent'), 'checks': [], 'models': [],
                      'served_sha256': served, 'canvas_sha256': {}}

            def frame(view):
                page.locator('#scene canvas').scroll_into_view_if_needed()
                page.wait_for_function('(view)=>NEUROSCOPE.snapshot().scene.renderedViewId===view', arg=view)
                # Permit WebKit's compositor to present the freshly rendered GL
                # buffer; viewId alone proves model loading, not its pixels.
                page.wait_for_timeout(350)
                snapshot = page.evaluate('NEUROSCOPE.snapshot().scene')
                assert snapshot['viewId'] == view and snapshot['meshCount'] > 0 and not snapshot['error']
                image = page.locator('#scene canvas').screenshot(path=str(args.output / f'{prefix}-{view}-canvas.png'))
                result['canvas_sha256'][view] = hashlib.sha256(image).hexdigest()
                result['models'].append({'view': view, 'meshes': snapshot['meshCount'],
                                         'rendered': snapshot['renderedViewId'], 'frames': snapshot['frameCount']})
                page.screenshot(path=str(args.output / f'{prefix}-{view}.png'), full_page=True)
                return snapshot

            first = frame('body')
            assert len(first['labels']) <= 9
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            before = first['cameraPosition']
            page.locator('#zoom-in').tap()
            page.wait_for_timeout(120)
            assert page.evaluate('NEUROSCOPE.snapshot().scene.cameraPosition') != before
            result['checks'].append('touch_zoom_button')
            for view in ['meninges', 'csf', 'microglia', 'neuron']:
                page.locator('#structure-select').select_option(view)
                page.wait_for_function('(view)=>NEUROSCOPE.snapshot().selected===view', arg=view)
                if view == 'meninges':
                    page.locator('#explode').fill('70')
                    page.locator('#explode').dispatch_event('input')
                    assert page.evaluate('NEUROSCOPE.snapshot().scene.explode') == .7
                    result['checks'].append('meningeal_explosion')
                if view == 'csf':
                    page.locator('#flow-play').tap()
                    page.wait_for_timeout(500)
                    playing = page.evaluate('NEUROSCOPE.snapshot().scene')
                    assert playing['flowPlaying'] and playing['flowTime'] > 0 and len(playing['flowPaths']) == 4
                    page.locator('#flow-play').tap()
                    page.wait_for_timeout(100)
                    paused = page.evaluate('NEUROSCOPE.snapshot().scene.flowTime')
                    page.wait_for_timeout(150)
                    assert page.evaluate('NEUROSCOPE.snapshot().scene.flowTime') == paused
                    result['checks'].append('csf_real_play_pause')
                if view == 'microglia':
                    page.locator('#microglia-active').check()
                    assert page.evaluate('NEUROSCOPE.snapshot().scene.microgliaActive')
                    result['checks'].append('microglia_activation')
                frame(view)
            assert len(set(result['canvas_sha256'].values())) == 5, result['canvas_sha256']
            result['checks'].append('five_distinct_rendered_canvas_images')
            page.locator('[data-mode="quiz"]').tap()
            page.wait_for_function("NEUROSCOPE.snapshot().mode==='quiz'")
            assert page.locator('#question-options input[type=checkbox]').count() == 5
            page.locator('#question-options input[type=checkbox]').nth(0).check()
            page.locator('#quiz-validate').tap()
            page.wait_for_function('NEUROSCOPE.snapshot().validated===true')
            assert page.locator('.option-explanation').count() == 5
            assert page.locator('#quiz-result').inner_text().strip()
            result['checks'].append('qrm_five_options_and_five_explanations')
            page.screenshot(path=str(args.output / f'{prefix}-qcm.png'), full_page=True)
            page.locator('#sources-open').tap()
            assert page.locator('#sources-dialog').evaluate('(dialog)=>dialog.open')
            if args.pdf:
                page.locator('#tn1-file').set_input_files(args.pdf)
                page.wait_for_function('NEUROSCOPE.snapshot().pdfVerified===true')
                assert page.locator('#pdf-page-link').get_attribute('href').startswith('blob:')
                result['checks'].append('source_dialog_and_local_sha256_pdf_binding')
            else:
                result['checks'].append('source_dialog_only_pdf_not_provided')
            page.screenshot(path=str(args.output / f'{prefix}-source.png'), full_page=True)
            page.locator('#sources-close').tap()
            assert not page.locator('#sources-dialog').evaluate('(dialog)=>dialog.open')
            report['viewports'].append(result)
            checkpoint()
            context.close()
        assert not report['errors'], report['errors']
        assert not report['console_errors'], report['console_errors']
        assert not report['bad_requests'], report['bad_requests']
        assert not report['post_requests'], report['post_requests']
        report['input_sha256_after'] = inputs()
        assert report['input_sha256_after'] == report['input_sha256_before'], 'Inputs changed during testing'
        report['status'] = 'passed'
    except Exception as error:
        report['status'] = 'failed'
        report['exception'] = str(error)
        report['traceback'] = traceback.format_exc()
    finally:
        report['finished_at_utc'] = datetime.now(timezone.utc).isoformat()
        checkpoint()
        browser.close()
        if server:
            server.shutdown()
print(json.dumps({'status': report['status'], 'browser': report['browser_version'],
                  'viewports': len(report['viewports']), 'report': str(args.output / 'report.json'),
                  'exception': report.get('exception')}, ensure_ascii=False))
raise SystemExit(0 if report['status'] == 'passed' else 1)
