import React from "react";

const engines = [
  {
    id: "OpenGeometry",
    icon: "⚡",
    ext: [".ts", ".js"],
    desc: "Parametric geometry via WebAssembly. Write your model in TypeScript or JavaScript — no external install needed.",
    colorClass: "bg-blue-500/10 text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    id: "FreeCAD",
    icon: "🏗️",
    ext: [".py", ".fcmacro"],
    desc: "Full BREP solid modelling via the FreeCAD Python API. Access Part and PartDesign workbenches from scripts.",
    colorClass: "bg-green-500/10 text-green-400",
    borderColor: "border-green-500/30",
  },
  {
    id: "OpenSCAD",
    icon: "📐",
    ext: [".scad"],
    desc: "CSG-based solid modelling. The lingua franca of 3D-printable parametric models.",
    colorClass: "bg-yellow-500/10 text-yellow-400",
    borderColor: "border-yellow-500/30",
  },
];

export const Engines: React.FC = () => {
  return (
    <section id="engines" className="py-32 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-4">
            CAD Engines
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Pick your language, OmniCAD does the rest
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {engines.map((e, i) => (
            <div
              key={i}
              className={`group relative p-8 rounded-3xl bg-zinc-900/50 border ${e.borderColor} hover:bg-zinc-900 transition-all duration-300`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${e.colorClass}`}
                >
                  {e.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{e.id}</h3>
                  <div className="flex gap-2 mt-1">
                    {e.ext.map((ext) => (
                      <span
                        key={ext}
                        className="text-[10px] font-mono font-bold text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
