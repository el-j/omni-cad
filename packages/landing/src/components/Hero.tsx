import React from "react";
import { VideoPlayer } from "./VideoPlayer";
import { CodeWindow } from "./CodeWindow";

export const Hero: React.FC = () => {
  const baseUrl = import.meta.env.BASE_URL;
  const docsHref = `${baseUrl}docs`;
  const channelHref = (channel: string) => `${baseUrl}channels/${channel}/`;
  const installHref = `${import.meta.env.BASE_URL}docs`;

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505]"
    >
      {/* Decorative background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Open Source · MIT License
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            The <span className="text-gradient">Universal CAD</span> <br />
            Engine for VS Code
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
            Write 3D models in TypeScript, Python, or OpenSCAD. OmniCAD routes
            your file to the right engine, compiles it, and renders the result
            live — right inside your editor.
          </p>

          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200 max-w-xl">
            Current export coverage: FreeCAD supports STL, STEP, and IGES.
            OpenSCAD supports STL. Additional adapter families are on the public
            roadmap.
          </div>

          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href={installHref}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              Install Extension
            </a>
            <a
              href="https://github.com/el-j/omni-cad"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all"
            >
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
            <a
              href={docsHref}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                Stable
              </div>
              <div className="font-semibold text-white">Main Docs</div>
              <div className="text-sm text-gray-400 mt-1">Root page</div>
            </a>
            <a
              href={channelHref("beta")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                Channel
              </div>
              <div className="font-semibold text-white">Beta Docs</div>
              <div className="text-sm text-gray-400 mt-1">Pre-release</div>
            </a>
            <a
              href={channelHref("alpha")}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
                Channel
              </div>
              <div className="font-semibold text-white">Alpha Docs</div>
              <div className="text-sm text-gray-400 mt-1">Early preview</div>
            </a>
          </div>

          <div className="flex gap-12 border-t border-white/5 pt-10 w-full">
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                CAD Engines
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Export Formats Live
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">E2E</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Release-Gated QA
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block h-[500px]">
          <div className="absolute top-0 left-0 w-full z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <CodeWindow />
          </div>
          <div className="absolute top-32 right-[-10%] w-[80%] z-20 transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-3xl">
            <VideoPlayer src="/videos/freecad-workflow.webm" />
          </div>
        </div>
      </div>
    </section>
  );
};
