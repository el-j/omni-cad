import React from 'react';
import { roadmapItems } from '../content/roadmap';

const statusClasses = {
  done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  'in-progress': 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  planned: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
};

export const Roadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-14">
          <div className="mb-4 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">
            Governance
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight">OmniCAD Roadmap</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-gray-400">
            This page is the source of truth for roadmap state. Each item includes a target owner and explicit done criteria.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a href="https://github.com/el-j/omni-cad/issues" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-semibold text-blue-300 hover:bg-white/10">
              Linked Issues
            </a>
            <a href="https://github.com/el-j/omni-cad/milestones" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-semibold text-blue-300 hover:bg-white/10">
              Milestones
            </a>
          </div>
        </header>

        <section className="space-y-6">
          {roadmapItems.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-zinc-900/50 p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClasses[item.status]}`}>
                  {item.status.replace('-', ' ')}
                </span>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 text-sm text-gray-400 md:grid-cols-2">
                <p><span className="font-semibold text-gray-300">Owner:</span> {item.owner}</p>
                <p><span className="font-semibold text-gray-300">Target:</span> {item.target}</p>
              </div>

              <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-300">Done Criteria</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {item.doneCriteria.map((criterion) => (
                  <li key={criterion} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    {criterion}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};