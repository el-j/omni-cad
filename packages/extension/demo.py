import FreeCAD, Part
doc = FreeCAD.newDocument()
box = doc.addObject("Part::Box", "Box")
doc.recompute()
