import FreeCAD, Part
doc = FreeCAD.newDocument()
box = doc.addObject("Part::Box", "Box")
box.Length = 50
box.Width = 20
doc.recompute()
