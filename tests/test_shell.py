import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ShellTests(unittest.TestCase):
    def test_main_shell_contains_map_workspace(self):
        html=(ROOT/"index.html").read_text(encoding="utf-8")
        for marker in ('id="viewport"','id="selection"','id="seatLayer"','id="fileInput"','id="wizard"','id="openWizard"','id="objectLayer"','id="clearLocal"'): self.assertIn(marker,html)
    def test_real_map_interactions_exist(self):
        js=(ROOT/"src"/"app.js").read_text(encoding="utf-8")
        for feature in ("onpointerdown","addEventListener('wheel'","JSON.stringify(state","fileInput","toggleLock"): self.assertIn(feature,js)
    def test_zoom_range_is_present(self):
        js=(ROOT/"src"/"app.js").read_text(encoding="utf-8")
        self.assertIn("Math.max(.1,Math.min(1.5",js)
    def test_python_launcher_exists(self):
        self.assertIn("ThreadingTCPServer",(ROOT/"run.py").read_text(encoding="utf-8"))
if __name__=="__main__": unittest.main()
