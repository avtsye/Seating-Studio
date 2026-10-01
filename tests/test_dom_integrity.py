import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class DomIntegrityTests(unittest.TestCase):
    def test_no_duplicate_static_ids(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        ids = re.findall(r'id="([^"]+)"', html)
        duplicates = sorted({x for x in ids if ids.count(x) > 1})
        self.assertEqual([], duplicates, f"duplicate HTML ids: {duplicates}")

    def test_static_hash_selectors_exist(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        app = (ROOT / "src" / "app.js").read_text(encoding="utf-8")
        ids = set(re.findall(r'id="([^"]+)"', html))
        refs = set(re.findall(r"\$\('#([^']+)'\)", app))
        dynamic = {
            "quickClearSeat","quickToggleBlocked","quickSelectRow",
            "quickSelectBlock","quickSelectArea","editSelectedSeat",
            "areaName","areaType","duplicate","deleteArea",
            "compareCanvasA","compareCanvasB","emptyAddPerson",
            "quickPinPanel","quickSeatLock",
        }
        missing = sorted(
            x for x in refs
            if x not in ids and x not in dynamic and " input[" not in x
        )
        self.assertEqual([], missing, f"missing static selector targets: {missing}")

    def test_no_duplicate_named_functions(self):
        app = (ROOT / "src" / "app.js").read_text(encoding="utf-8")
        names = re.findall(r"function\s+([A-Za-z0-9_$]+)\s*\(", app)
        duplicates = sorted({x for x in names if names.count(x) > 1})
        self.assertEqual([], duplicates, f"duplicate function declarations: {duplicates}")

if __name__ == "__main__":
    unittest.main()
