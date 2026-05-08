import React from 'react';

const features = [
  {
    icon: '🔀',
    title: 'Universal Engine Router',
    desc: 'Drop any CAD file in your workspace. OmniCAD reads the extension, picks the right backend, and compiles — no configuration needed.',
    colorClass: 'bg-blue-500/10 text-blue-400'
  },
  {
    icon: '🎮',
    title: 'Live 3D Viewer',
    desc: 'A Three.js-powered WebGL panel opens beside your editor. Every save triggers an instant re-compile and mesh update.',
    colorClass: 'bg-green-500/10 text-green-400'
  },
  {
    icon: '📤',
    title: 'Multi-format Export',
    desc: 'One click to export your model to STEP, STL, or IGES depending on engine capabilities, with roadmap formats documented separately.',
    colorClass: 'bg-yellow-500/10 text-yellow-400'
  },
  {
    icon: '🤖',
    title: 'MCP / AI Integration',
    desc: 'Built-in Model Context Protocol server. Any MCP-capable AI agent can drive OmniCAD programmatically.',
    colorClass: 'bg-purple-500/10 text-purple-400'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-[#050505]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-4">
            Features
          </div>
          <h2 className="text-4xl font-bold mb-6">Everything you need for code-driven CAD</h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            OmniCAD is built for developers who want to author 3D models in code —
            with a professional workflow and AI integration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-2xl bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 ${f.colorClass}`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
