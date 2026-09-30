import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class ShellTests(unittest.TestCase):
    def test_main_shell_contains_map_workspace(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="viewport"', html)
        self.assertIn('id="selection"', html)

    def test_zoom_range_is_present(self):
        js = (ROOT / "src" / "app.js").read_text(encoding="utf-8")
        self.assertIn("Math.min(1.5", js)
        self.assertIn("Math.max(.1", js)

    def test_python_launcher_exists(self):
        launcher = (ROOT / "run.py").read_text(encoding="utf-8")
        self.assertIn("ThreadingTCPServer", launcher)

if __name__ == "__main__":
    unittest.main()
