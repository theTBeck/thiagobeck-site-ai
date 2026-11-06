"""Exercise production routes and byte-range behavior against the actual build."""
import threading
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from serve import Handler, ROOT, ThreadingHTTPServer

class QuietHandler(Handler):
    def log_message(self, *_args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

def read(path, headers=None):
    try:
        with urlopen(Request(base + path, headers=headers or {}), timeout=5) as response:
            return response.status, response.headers, response.read()
    except HTTPError as error:
        return error.code, error.headers, error.read()

try:
    for locale, tag in [('pt', 'pt-BR'), ('en', 'en'), ('it', 'it')]:
        status, headers, body = read(f'/{locale}/')
        assert status == 200 and f'lang="{tag}"'.encode() in body
        assert read(f'/cv/thiago-beck-{locale}.txt')[0] == 200
    assert b'thiago-beck-portfolio' in read('/health')[2]
    video = ROOT / 'media/jetour.mp4'
    size = video.stat().st_size
    for value, start, end in [('bytes=0-1023', 0, 1023), ('bytes=1024-2047', 1024, 2047), ('bytes=-512', size-512, size-1)]:
        status, headers, body = read('/media/jetour.mp4', {'Range': value})
        assert status == 206 and headers['Content-Range'] == f'bytes {start}-{end}/{size}'
        with video.open('rb') as stream:
            stream.seek(start)
            assert body == stream.read(end-start+1)
    assert read('/media/jetour.mp4', {'Range': f'bytes={size}-'})[0] == 416
    assert read('/media/')[0] == 404
    assert read('/%2e%2e/README.md')[0] == 404
    assert read('/.env')[0] == 404
    assert read('/scripts/serve.py')[0] == 404
    print('PASS: 3 locale routes, 3 CVs, health, exact video byte ranges, invalid range and private-path isolation.')
finally:
    server.shutdown()
    server.server_close()
