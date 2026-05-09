import React from "react";

export const Docs: React.FC = () => {
  const docsVersion = import.meta.env.VITE_DOCS_VERSION || "unversioned";
  const docsChannel = import.meta.env.VITE_DOCS_CHANNEL || "stable";
  const assetUrl = (path: string) =>
    `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
  const appRouteUrl = (path: string) =>
    `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Channel: {docsChannel} • Version: {docsVersion}
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-4">
            Documentation
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-gradient">
            Living Documentation
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            OmniCAD is a universal routing layer for CAD engines, exposing them
            via VS Code and the Model Context Protocol (MCP).
          </p>
        </header>

        <section className="mb-24 relative">
          <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-50 hidden lg:block" />
          <h2 className="text-3xl font-bold mb-8">
            Core Architecture: OpenGeometry
          </h2>
          <div className="bg-zinc-900/50 p-10 rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              At the heart of OmniCAD is <strong>OpenGeometry</strong>—a
              high-performance parametric kernel that bridges modern TypeScript
              development with industrial CAD standards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  TypeScript-Native
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Define geometry using standard TS classes and interfaces. Full
                  intellisense and type-safety included.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Parametric Recompute
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Instantly recompute complex assemblies by changing simple
                  variable constraints.
                </p>
              </div>
            </div>
            <div className="mt-10">
              <a
                href="https://github.com/OpenGeometry-io/OpenGeometry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-bold transition-colors"
              >
                Visit OpenGeometry on GitHub
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="mb-24 rounded-3xl border border-white/10 bg-zinc-900/50 p-10">
          <h2 className="mb-4 text-3xl font-bold">
            Current Capability Snapshot
          </h2>
          <p className="mb-6 text-gray-300">
            The table below reflects currently verified behavior in the shipped
            extension. Planned formats and adapters are tracked separately in
            roadmap docs.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-300">
                <tr>
                  <th className="px-4 py-3">Adapter</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified Exports</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                <tr>
                  <td className="px-4 py-3">FreeCAD</td>
                  <td className="px-4 py-3 text-emerald-300">Production</td>
                  <td className="px-4 py-3">STL, STEP, IGES</td>
                  <td className="px-4 py-3 text-gray-400">
                    Primary solid/BREP path
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">OpenSCAD</td>
                  <td className="px-4 py-3 text-emerald-300">Production</td>
                  <td className="px-4 py-3">STL</td>
                  <td className="px-4 py-3 text-gray-400">Mesh-first export</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">OpenGeometry</td>
                  <td className="px-4 py-3 text-yellow-300">Experimental</td>
                  <td className="px-4 py-3">None</td>
                  <td className="px-4 py-3 text-gray-400">
                    Preview runtime, export pending
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-24 rounded-3xl border border-white/10 bg-zinc-900/50 p-10">
          <h2 className="mb-4 text-3xl font-bold">
            Release Notes And Migration
          </h2>
          <p className="mb-6 text-gray-300">
            Each docs snapshot corresponds to a release or channel build. Review
            the changelog and release notes before upgrading between versions.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/el-j/omni-cad/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-white/10"
            >
              GitHub Releases
            </a>
            <a
              href="https://github.com/el-j/omni-cad/blob/main/CHANGELOG.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-white/10"
            >
              Changelog
            </a>
            <a
              href={appRouteUrl("/roadmap")}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-white/10"
            >
              Roadmap Governance
            </a>
            <a
              href="https://github.com/el-j/omni-cad/blob/main/docs/EXPORT_CAPABILITY_MATRIX.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-white/10"
            >
              Export Capability Matrix
            </a>
            <a
              href="https://github.com/el-j/omni-cad/blob/main/docs/ADAPTER_FAMILY_DECISIONS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-white/10"
            >
              Adapter Family Decisions
            </a>
          </div>
        </section>

        <section className="mb-24 relative">
          <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-transparent opacity-50 hidden lg:block" />
          <h2 className="text-3xl font-bold mb-8">
            Model Context Protocol (MCP)
          </h2>
          <p className="text-gray-400 mb-10 text-lg leading-relaxed">
            OmniCAD exposes a standardized MCP server allowing LLMs to "see" and
            "write" CAD code directly.
          </p>
          <div className="grid grid-cols-1 gap-6">
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="px-3 py-1 rounded-md bg-green-500/10 text-green-400 font-mono text-sm border border-green-500/20">
                  omniCAD.compile_and_measure
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Compiles a geometry script and returns physical measurements
                (BOM, Mass, Volume).
              </p>
              <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs text-gray-400 overflow-x-auto shadow-inner">
                {`{
  "engine": "freecad" | "openscad" | "opengeometry",
  "code": "import FreeCAD... box = Part.makeBox(10,10,10)..."
}`}
              </div>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/10 flex items-center justify-between">
              <div className="px-3 py-1 rounded-md bg-green-500/10 text-green-400 font-mono text-sm border border-green-500/20">
                omniCAD.get_metadata
              </div>
              <span className="text-xs text-gray-500 italic">
                Core tool for capability discovery
              </span>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-12">
            Engine Stories & Live Demos
          </h2>
          <div className="space-y-24">
            <div id="freecad" className="group">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-lg">
                  🏗️
                </span>
                FreeCAD (Python)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/10 group-hover:border-green-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed italic border-l-2 border-green-500/50 pl-4">
                    Python-driven solid modeling with full access to the FreeCAD
                    kernel.
                  </p>
                  <pre className="text-xs text-blue-300 font-mono bg-black/40 p-6 rounded-2xl overflow-x-auto">
                    {`import FreeCAD, Part
doc = FreeCAD.newDocument()
box = doc.addObject("Part::Box", "MyBox")
box.Length = 50
doc.recompute()`}
                  </pre>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 bg-green-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <video
                    src={assetUrl("/videos/freecad-workflow.webm")}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative rounded-3xl border border-white/10 shadow-3xl w-full z-10"
                  />
                </div>
              </div>
            </div>

            <div id="openscad" className="group">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-lg">
                  📐
                </span>
                OpenSCAD (CSG)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
                <div className="order-2 lg:order-1 relative group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 bg-yellow-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <video
                    src={assetUrl("/videos/openscad-render.webm")}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative rounded-3xl border border-white/10 shadow-3xl w-full z-10"
                  />
                </div>
                <div className="order-1 lg:order-2 bg-zinc-900/50 p-8 rounded-3xl border border-white/10 group-hover:border-yellow-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed italic border-l-2 border-yellow-500/50 pl-4">
                    Constructive Solid Geometry via text definitions.
                  </p>
                  <pre className="text-xs text-yellow-300 font-mono bg-black/40 p-6 rounded-2xl overflow-x-auto">
                    {`difference() {
  cube([20, 20, 20], center=true);
  sphere(r=14, $fn=64);
}`}
                  </pre>
                </div>
              </div>
            </div>

            <div id="opengeometry" className="group">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-lg">
                  ⚡
                </span>
                OpenGeometry (TS)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/10 group-hover:border-purple-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed italic border-l-2 border-purple-500/50 pl-4">
                    Parametric modeling using the OpenGeometry TypeScript
                    library.
                  </p>
                  <pre className="text-xs text-purple-300 font-mono bg-black/40 p-6 rounded-2xl overflow-x-auto">
                    {`// OmniCAD OpenGeometry Example
const radius = 15;
const height = 100;
const shell = new Cylinder(radius, height);
shell.render();`}
                  </pre>
                </div>
                <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute inset-0 bg-purple-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <video
                    src={assetUrl("/videos/opengeometry-preview.webm")}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative rounded-3xl border border-white/10 shadow-3xl w-full z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-48 pt-24 border-t border-white/5 text-center">
          <p className="text-gray-500 text-sm mb-12 uppercase tracking-[0.2em] font-bold">
            Built upon Giants
          </p>
          <div className="flex flex-wrap justify-center gap-12 items-center opacity-30 hover:opacity-100 transition-opacity duration-700">
            <a
              href="https://freecad.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              FreeCAD
            </a>
            <a
              href="https://openscad.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              OpenSCAD
            </a>
            <a
              href="https://opengeometry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline decoration-purple-500/50 underline-offset-8"
            >
              OpenGeometry
            </a>
            <a
              href="https://threejs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Three.js
            </a>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-gradient font-bold"
            >
              MCP
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
