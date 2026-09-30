import threading
import unittest
import urllib.request
from socketserver import ThreadingTCPServer

from run import Handler


class RuntimeSmokeTests(unittest.TestCase):
    def test_local_server_serves_app_and_assets(self):
        server = ThreadingTCPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            base = f"http://127.0.0.1:{server.server_address[1]}"
            with urllib.request.urlopen(base + "/", timeout=5) as response:
                html = response.read().decode("utf-8")
                self.assertIn('id="viewport"', html)
                self.assertIn('id="gridCanvas"', html)
            with urllib.request.urlopen(base + "/src/app.js", timeout=5) as response:
                js = response.read().decode("utf-8")
                self.assertIn("viewport.addEventListener('pointerdown'", js)
                self.assertIn("function drawViewportGrid", js)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == "__main__":
    unittest.main()
