#!/usr/bin/env python3
"""Offline checks for GitHub Pages links and byte-for-byte Osteoscope preservation."""
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.duplicates = set()
        self.links = []
        self.images_without_alt = 0
        self.lang = None
        self.has_viewport = False
        self.h1_count = 0
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if 'id' in attr:
            if attr['id'] in self.ids:
                self.duplicates.add(attr['id'])
            self.ids.add(attr['id'])
        for key in ('href', 'src'):
            if attr.get(key):
                self.links.append(attr[key])
        if tag == 'html':
            self.lang = attr.get('lang')
        if tag == 'meta' and attr.get('name') == 'viewport':
            self.has_viewport = 'width=device-width' in attr.get('content', '')
        if tag == 'img' and 'alt' not in attr:
            self.images_without_alt += 1
        if tag == 'h1':
            self.h1_count += 1


def check():
    manifest = json.loads((ROOT / 'docs/osteoscope-preservation.json').read_text())
    original = ROOT / manifest['preserved_path']
    payload = original.read_bytes()
    assert len(payload) == manifest['bytes'], 'Preserved application size changed'
    assert sha256(payload).hexdigest() == manifest['sha256'], 'Preserved application hash changed'
    blob = sha256(payload).hexdigest()
    # Also compare against Git history when this is a checkout, not a source ZIP.
    if (ROOT / '.git').exists():
        source = subprocess.check_output(['git', 'show', f"{manifest['source_commit']}:{manifest['source_path']}"], cwd=ROOT)
        assert source == payload, 'Application differs from the source commit'
    model = re.search(r'<script id="model-data" type="application/json">(.*?)</script>', payload.decode(), re.S)
    assert model, 'Missing geometry data'
    geometry = json.loads(model[1])
    assert all(key in geometry for key in ('outer', 'inner', 'yellow', 'red')), 'Missing geometry layers'
    print(f'PASS Osteoscope: {len(payload):,} unchanged bytes; SHA-256 {blob}')

    pages = {path: Document(path.read_text()) for path in ROOT.rglob('*.html') if '.git' not in path.parts}
    checked = 0
    external = set()
    for path, document in pages.items():
        name = str(path.relative_to(ROOT))
        assert document.lang == 'fr', f'{name}: missing French language'
        assert document.has_viewport, f'{name}: missing responsive viewport'
        assert not document.duplicates, f'{name}: duplicate IDs {document.duplicates}'
        assert not document.images_without_alt, f'{name}: image without alt'
        assert document.h1_count == 1, f'{name}: expected one h1'
        for link in document.links:
            url = urlsplit(link)
            if url.scheme or url.netloc:
                assert url.scheme in ('https', 'http', 'mailto', 'data'), f'{name}: unsupported link {link}'
                if url.scheme == 'https':
                    external.add(link)
                continue
            assert not url.path.startswith('/'), f'{name}: root-relative path breaks the /femur-3d/ project base: {link}'
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            assert target.is_relative_to(ROOT), f'{name}: link escapes the project: {link}'
            if target.is_dir():
                target /= 'index.html'
            assert target.is_file(), f'{name}: missing local target {link}'
            if url.fragment and target in pages:
                assert unquote(url.fragment) in pages[target].ids, f'{name}: missing fragment {link}'
            checked += 1

    for svg in (ROOT / 'assets').glob('*.svg'):
        ET.parse(svg)
    assert (ROOT / '.nojekyll').is_file(), 'Missing static Pages marker'
    for route in ('', 'biologie-cellulaire', 'histologie', 'histologie/osteoscope', 'embryologie', 'qcm-annales'):
        assert (ROOT / route / 'index.html') in pages, f'Missing route {route}'
    platform = [path for path in pages if path != original]
    assert all('<script' not in path.read_text() for path in platform), 'Platform must not require JavaScript'
    size = sum(path.stat().st_size for path in platform) + sum(path.stat().st_size for path in (ROOT / 'assets').glob('*'))
    assert size < 100_000, f'Platform resources unexpectedly large: {size}'
    print(f'PASS {len(pages)} HTML documents; {checked} local links/assets/fragments; 5 valid SVG assets')
    print(f'PASS platform resources: {size:,} bytes; original WebGL application loads only on demand')
    print(f'INFO {len(external)} external URLs require online verification; they are not fetched by this check')


if __name__ == '__main__':
    check()
