import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class BuilderTests(unittest.TestCase):
 def test_builder_shell(self):
  h=(ROOT/'index.html').read_text(encoding='utf-8')
  for x in ('id="planGrid"','id="scrollExtent"','data-tool="draw"','data-tool="move"','data-tool="erase"','id="backup"','id="restore"','data-kind="blocked"'): self.assertIn(x,h)
 def test_floor_style_geometry_editor(self):
  j=(ROOT/'src'/'app.js').read_text(encoding='utf-8')
  for x in ('function rect(','function areaAt(','localStorage.setItem','paintSeats',"viewport=$('#viewport')",'const newId=','globalThis.crypto.randomUUID','setPointerCapture','viewport.addEventListener(\'pointerdown\'','viewport.addEventListener(\'pointermove\'','finishDrag','before:JSON.stringify(state)','function fitContent','function mergeTouching','function adjacent','dragTip','gridWidth','gridHeight','grid.style.width','function drawGrid','function drawViewportGrid','function updateScrollExtent','viewport.addEventListener(\'scroll\'','function updateGridStroke','VALID_TYPES','normalizeHall','Math.max(.1','blocked','applyGridSize','minW=cells.length','snapshot();state.hall.gridWidth=nextW','colors[a.type]||colors.empty','canvas.getBoundingClientRect()'): self.assertIn(x,j)
 def test_numbering_rule(self):
  j=(ROOT/'src'/'app.js').read_text(encoding='utf-8');self.assertIn('function seatingBlocks',j);self.assertIn('(blockIndex+1)*1000+i+1',j)
 def test_python_launcher(self): self.assertIn('ThreadingTCPServer',(ROOT/'run.py').read_text(encoding='utf-8'))
if __name__=='__main__': unittest.main()
