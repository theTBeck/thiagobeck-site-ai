"""Validate public portfolio data and generate plain-text CVs. Standard library only."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABELS = {
    'pt': ('TRABALHOS SELECIONADOS', 'EXPERIÊNCIA EM LONGAS — OPERAÇÃO DE CÂMERA', 'FERRAMENTAS', 'CONTATO'),
    'en': ('SELECTED WORK', 'FEATURE FILM EXPERIENCE — CAMERA OPERATION', 'TOOLS', 'CONTACT'),
    'it': ('LAVORI SELEZIONATI', 'LUNGOMETRAGGI — OPERATORE DI CAMERA', 'STRUMENTI', 'CONTATTI'),
}

def prepare(check_only=False):
    data = json.loads((ROOT / '.build/catalog.json').read_text(encoding='utf-8'))
    assert set(data['languages']) == {'pt', 'en', 'it'}, 'Three languages required'
    assert len(data['archive']) == 30, 'Expected 30 eligible archive works'
    assert not any('serasa' in (p['title'] + p['url']).lower() for p in data['archive']), 'Excluded project found'
    for locale, content in data['languages'].items():
        projects = content['projects']
        assert len(projects) == len({p['id'] for p in projects}) == 6, 'Project IDs must be unique'
        for p in projects:
            assert p['role'] and p['description'] and p['technique'], f'Missing translation: {locale}/{p["id"]}'
            for kind in ('image', 'video'):
                path = (ROOT / 'public' / p[kind].lstrip('/')).resolve()
                assert path.is_relative_to((ROOT / 'public').resolve()), 'Asset escapes public directory'
                assert path.is_file() and path.stat().st_size > 0, f'Missing asset: {p[kind]}'
        assert len(content['services']) == 16, 'Expected 16 service categories'
        sections = LABELS[locale]
        lines = [content['name'].upper(), content['role'], '', content['bio'], '', content['education'], '', sections[0], '']
        for p in projects:
            lines.extend([p['title'], p['role'] + ' | ' + p['technique'], p['description']])
            if p['status']:
                lines.append(p['status'])
            lines.append('')
        lines.extend([sections[1], ''])
        lines.extend(f'{film} — {content["assistant"]}' for film in content['featureCredits'])
        lines.extend(['', sections[2], ', '.join(content['tools']), '', sections[3]])
        lines.extend(f'{k}: {v}' for k, v in content['contact'].items())
        if not check_only:
            cv = ROOT / 'public' / 'cv'
            cv.mkdir(exist_ok=True)
            (cv / f'thiago-beck-{locale}.txt').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('Validated: translations, 6 project credits, 12 media files, 30 archive entries and 16 service categories.')
    if not check_only:
        print('Generated 3 localized CV files.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    prepare(parser.parse_args().check)
