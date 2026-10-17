#!/usr/bin/env python3
"""Exercise the static site under a GitHub Pages subpath and compare the original.

Requires Playwright and a browser. No site dependencies or production build.
"""
import argparse
from datetime import datetime, timezone
from hashlib import sha256
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import shutil
import subprocess
from threading import Thread
from urllib.parse import urlsplit, unquote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'docs/osteoscope-preservation.json').read_text(encoding='utf-8'))
PAGES = ['', 'biologie-cellulaire/', 'histologie/', 'embryologie/', 'qcm-annales/']
VIEWPORTS = [(1366, 900), (1194, 834), (1024, 768), (834, 1194), (768, 1024), (390, 844), (320, 800)]


class SiteServer(BaseHTTPRequestHandler):
    """Serve only HTML/assets, with a real project prefix; never expose .git or siblings."""
    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        if path == '/_baseline/index.html':
            payload = self.server.baseline
            mime = 'text/html'
        else:
            target = self.server.files.get(path)
            if target is None:
                self.send_error(404)
                return
            payload = target.read_bytes()
            mime = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *_):
        pass


def wait_for_application(frame):
    frame.wait_for_function("window.OSTEOSCOPE && getComputedStyle(document.querySelector('#loading')).display === 'none'", timeout=30000)
    assert frame.evaluate("!!document.querySelector('#gl').getContext('webgl')"), 'WebGL unavailable'


def snapshot(frame):
    state = frame.evaluate('JSON.parse(JSON.stringify(OSTEOSCOPE.state))')
    image = frame.evaluate("() => {OSTEOSCOPE.draw(); return document.querySelector('#gl').toDataURL();}")
    return {'state': state, 'pixels_sha256': sha256(image.encode()).hexdigest()}


def range_value(frame, selector, value):
    frame.locator(selector).evaluate('(el, value) => { el.value = value; el.dispatchEvent(new Event("input", { bubbles: true })); }', str(value))


def run_application_sequence(frame):
    results = {}
    results['initial'] = snapshot(frame)
    for cut, title in [('trans', 'Coupe transversale'), ('sag', 'Coupe sagittale'), ('cor', 'Coupe frontale')]:
        frame.locator(f'[data-cut="{cut}"]').click()
        assert frame.locator('#scene-title').inner_text() == title
        range_value(frame, '#cut-slider', 36)
        assert frame.locator('#cut-value').inner_text() == '36 %'
        frame.locator('#flip').click()
        assert frame.evaluate('OSTEOSCOPE.state.flip') == -1
        results[cut] = snapshot(frame)
    frame.locator('[data-cut="none"]').click()
    range_value(frame, '#opacity', 67)
    assert frame.locator('#opacity-label').inner_text() == '67 %'
    results['transparency'] = snapshot(frame)
    frame.locator('#xray').click()
    assert frame.evaluate('OSTEOSCOPE.state.transparency') == 85
    layer = frame.locator('#layers input').first
    before = layer.is_checked()
    layer.click()
    assert layer.is_checked() != before
    results['layer'] = snapshot(frame)
    layer.click()
    frame.locator('#labels-toggle').uncheck()
    assert frame.evaluate('OSTEOSCOPE.state.labels') is False
    frame.locator('#labels-toggle').check()
    frame.locator('#autozoom').uncheck()
    assert frame.evaluate('OSTEOSCOPE.state.auto') is False
    frame.locator('#autozoom').check()

    for tissue in ['cortex', 'trabecular', 'periosteum', 'endosteum', 'cartilage', 'redmarrow', 'yellowmarrow']:
        frame.locator('[data-level="0"]').click()
        frame.locator('#tissue-select').select_option(tissue)
        frame.locator('#open-tissue').click()
        assert frame.evaluate('OSTEOSCOPE.state.level') == 1
        assert frame.evaluate('OSTEOSCOPE.state.tissue') == tissue
        results['tissue_' + tissue] = snapshot(frame)

    # Public pedagogical API covers every cell and the matrix, alongside UI tests.
    frame.evaluate("OSTEOSCOPE.goLevel(0); OSTEOSCOPE.selectKey('cortex')")
    for cell in ['osteocyte', 'osteoblast', 'osteoclast', 'lining', 'progenitor', 'fibroblast', 'adipocyte', 'megakaryocyte', 'hematopoietic', 'endothelial', 'chondrocyte']:
        frame.evaluate('(cell) => OSTEOSCOPE.goLevel(2, cell)', cell)
        assert frame.evaluate('OSTEOSCOPE.state.cell') == cell
        results['cell_' + cell] = snapshot(frame)
    frame.evaluate("OSTEOSCOPE.goLevel(0); OSTEOSCOPE.selectKey('cortex'); OSTEOSCOPE.goLevel(3)")
    assert frame.evaluate('OSTEOSCOPE.state.level') == 3
    results['matrix'] = snapshot(frame)

    frame.locator('#help').click()
    assert frame.locator('#modal').evaluate("el => el.classList.contains('open')")
    assert 'Comment explorer' in frame.locator('#modal-title').inner_text()
    frame.locator('#close-modal').click()
    frame.locator('#source-btn').click()
    assert frame.locator('#modal').evaluate("el => el.classList.contains('open')")
    assert frame.locator('#modal-content a').count() >= 16
    frame.locator('#close-modal').click()
    frame.evaluate('OSTEOSCOPE.goLevel(0)')
    before = frame.evaluate('OSTEOSCOPE.state.cam.d')
    frame.evaluate('OSTEOSCOPE.zoom(.8)')
    assert frame.evaluate('OSTEOSCOPE.state.cam.d') < before
    assert frame.evaluate("document.querySelector('#gl').getContext('webgl').getError()") == 0
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', choices=['chromium', 'webkit'], default='chromium')
    parser.add_argument('--executable', default=None)
    parser.add_argument('--output-dir', default=str(ROOT / 'test-results'))
    args = parser.parse_args()
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    baseline = subprocess.check_output(['git', 'show', f"{MANIFEST['source_commit']}:{MANIFEST['source_path']}"], cwd=ROOT)
    server = ThreadingHTTPServer(('127.0.0.1', 0), SiteServer)
    server.baseline = baseline
    server.files = {}
    for file in list(ROOT.rglob('*.html')) + list((ROOT / 'assets').glob('*')):
        rel = file.relative_to(ROOT).as_posix()
        server.files['/femur-3d/' + rel] = file
        if file.name == 'index.html':
            route = rel.removesuffix('index.html')
            server.files['/femur-3d/' + route] = file
    Thread(target=server.serve_forever, daemon=True).start()
    host = f'http://127.0.0.1:{server.server_port}'
    base = host + '/femur-3d/'
    errors, responses = [], []
    report_path = output / f'{args.browser}-report.json'
    report = {
        'status': 'running',
        'started_at_utc': datetime.now(timezone.utc).isoformat(),
        'browser': args.browser,
        'viewports': [],
        'routes': PAGES,
        'project_base': '/femur-3d/',
        'input_sha256': {
            str(path.relative_to(ROOT)): sha256(path.read_bytes()).hexdigest()
            for path in sorted(set(server.files.values()) | {Path(__file__).resolve(), ROOT / 'scripts/check_site.py'})
        },
    }
    # Replace any previous result immediately, including when a browser fails to launch.
    report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    try:
        with sync_playwright() as p:
            options = {'headless': True}
            if args.browser == 'chromium':
                options['executable_path'] = args.executable or shutil.which('chromium') or p.chromium.executable_path
                options['args'] = ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader']
            elif args.executable:
                options['executable_path'] = args.executable
            browser = getattr(p, args.browser).launch(**options)
            report['browser_version'] = browser.version
            context = browser.new_context(viewport={'width': 1366, 'height': 900}, device_scale_factor=1, has_touch=True, reduced_motion='reduce')
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('response', lambda response: responses.append((response.url, response.status)))
            for width, height in VIEWPORTS:
                page.set_viewport_size({'width': width, 'height': height})
                for route in PAGES:
                    response = page.goto(base + route, wait_until='networkidle')
                    assert response.status == 200, route
                    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), f'Overflow {route} at {width}'
                    assert page.locator('h1').count() == 1
                    assert page.locator('img').evaluate_all('items => items.every(el => el.complete && el.naturalWidth > 0)')
                    targets = page.locator('.main-nav a, .brand, .text-link, .button, .subject-card')
                    assert targets.evaluate_all('items => items.every(el => el.getBoundingClientRect().height >= 44)'), f'Touch targets {route} at {width}'
                    if route:
                        assert page.locator('.main-nav [aria-current="page"]').count() == 1
                    if width in (1366, 834, 390) and route in ('', 'histologie/', 'qcm-annales/'):
                        page.screenshot(path=str(output / f'{args.browser}-{route.strip("/") or "accueil"}-{width}.png'), full_page=True)
                report['viewports'].append({'width': width, 'height': height, 'pages': len(PAGES), 'overflow': False, 'touch_targets_min': 44})
            assert not any('/application.html' in url for url, _ in responses), 'Homepage/module pages eagerly loaded 3D application'
            # Core navigation needs no JavaScript at all.
            plain = browser.new_context(java_script_enabled=False, viewport={'width': 834, 'height': 1194}, has_touch=True)
            plain_page = plain.new_page()
            plain_page.goto(base)
            for i, route in enumerate(PAGES[1:]):
                plain_page.locator('.subject-card').nth(i).tap()
                plain_page.wait_for_url(base + route)
                plain_page.locator('.brand').tap()
                plain_page.wait_for_url(base)
            plain.close()
            report['navigation_without_javascript'] = True
            page.goto(base)
            page.keyboard.press('Tab')
            assert page.locator('.skip-link').evaluate('el => el === document.activeElement')
            assert 0 <= page.locator('.skip-link').bounding_box()['y'] <= 20
            page.keyboard.press('Enter')
            page.wait_for_url(base + '#contenu')
            report['keyboard_skip_link'] = True
            print('PASS 35 responsive page views, touch targets, images and navigation without JavaScript', flush=True)

            # Compare identical source running directly vs through the new wrapper.
            page.set_viewport_size({'width': 1194, 'height': 834})
            page.goto(base + 'histologie/')
            page.locator('.button').tap()
            page.wait_for_url(base + 'histologie/osteoscope/')
            frame = page.frames[1]
            wait_for_application(frame)
            frame_size = frame.evaluate('({width: innerWidth, height: innerHeight})')
            original = context.new_page()
            original.on('pageerror', lambda error: errors.append(str(error)))
            original.set_viewport_size(frame_size)
            original.goto(host + '/_baseline/index.html')
            wait_for_application(original)
            before = run_application_sequence(original)
            after = run_application_sequence(frame)
            assert before.keys() == after.keys()
            for key in before:
                assert before[key] == after[key], f'Original/wrapped mismatch at {key}: states match={before[key]["state"] == after[key]["state"]}, pixels match={before[key]["pixels_sha256"] == after[key]["pixels_sha256"]}'
            report['osteoscope_equivalent_scenarios'] = list(before)
            report['canvas_pixel_hashes_match'] = True
            report['osteoscope_canvas_sha256'] = {key: value['pixels_sha256'] for key, value in after.items()}
            print(f'PASS {len(before)} original/integrated scenarios: identical state and rendered canvas pixels', flush=True)
            original.close()

            # Real mouse dragging through the iframe, not a synthetic state assignment.
            stage = frame.locator('#gl').bounding_box()
            yaw = frame.evaluate('OSTEOSCOPE.state.cam.yaw')
            page.mouse.move(stage['x'] + stage['width'] * .5, stage['y'] + stage['height'] * .5)
            page.mouse.down()
            page.mouse.move(stage['x'] + stage['width'] * .5 + 60, stage['y'] + stage['height'] * .5 + 20, steps=5)
            page.mouse.up()
            assert frame.evaluate('OSTEOSCOPE.state.cam.yaw') != yaw
            if args.browser == 'chromium':
                cdp = context.new_cdp_session(page)
                cx, cy = stage['x'] + stage['width'] * .35, stage['y'] + stage['height'] * .6
                def touch(kind, points):
                    cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': [{'x': x, 'y': y, 'id': i, 'radiusX': 5, 'radiusY': 5, 'force': 1} for i, x, y in points]})
                yaw = frame.evaluate('OSTEOSCOPE.state.cam.yaw')
                touch('touchStart', [(11, cx, cy)])
                touch('touchMove', [(11, cx + 45, cy + 15)])
                touch('touchEnd', [])
                assert frame.evaluate('OSTEOSCOPE.state.cam.yaw') != yaw, 'One-finger rotation failed'
                distance = frame.evaluate('OSTEOSCOPE.state.cam.d')
                touch('touchStart', [(21, cx - 25, cy), (22, cx + 25, cy)])
                touch('touchMove', [(21, cx - 50, cy), (22, cx + 50, cy)])
                touch('touchEnd', [])
                assert frame.evaluate('OSTEOSCOPE.state.cam.d') < distance, 'Two-finger pinch failed'
                report['emulated_touch_rotation_and_pinch'] = True
                cdp.detach()
            page.get_by_role('link', name='Agrandir').tap()
            page.wait_for_url(base + 'histologie/osteoscope/application.html')
            wait_for_application(page)
            page.go_back()
            wait_for_application(page.frames[1])
            page.get_by_role('link', name='Histologie', exact=False).tap()
            page.wait_for_url(base + 'histologie/')
            page.locator('.brand').tap()
            page.wait_for_url(base)
            report['navigation_to_and_from_osteoscope'] = True

            for width, height in [(1024, 768), (834, 1194), (768, 1024), (390, 844)]:
                page.set_viewport_size({'width': width, 'height': height})
                page.goto(base + 'histologie/osteoscope/')
                frame = page.frames[1]
                wait_for_application(frame)
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
                assert frame.evaluate('innerHeight') > 500
                if width <= 820:
                    frame.locator('#toggle-controls').tap()
                    assert frame.locator('#controls').evaluate('el => el.classList.contains("open")')
                if width == 834:
                    page.screenshot(path=str(output / f'{args.browser}-osteoscope-portrait.png'))
                if width == 1024:
                    page.screenshot(path=str(output / f'{args.browser}-osteoscope-landscape.png'))
            report['osteoscope_tablet_and_phone_layouts'] = 4
            assert not errors, errors
            bad = [(url, status) for url, status in responses if status >= 400]
            assert not bad, bad
            report['page_errors'] = errors
            report['http_errors'] = bad
            browser.close()
        report['status'] = 'passed'
        print('PASS viewer resize, drag rotation, controls and full-page fallback; no JS/HTTP errors', flush=True)
    except Exception as error:
        report['status'] = 'failed'
        report['failure'] = {'type': type(error).__name__, 'message': str(error)}
        raise
    finally:
        if report['status'] == 'running':
            report['status'] = 'interrupted'
        report['finished_at_utc'] = datetime.now(timezone.utc).isoformat()
        report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
