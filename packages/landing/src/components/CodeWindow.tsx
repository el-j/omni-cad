import React from "react";

export const CodeWindow: React.FC = () => {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-xs text-gray-500 font-mono italic">
          my-model.scad
        </span>
      </div>
      <div className="p-5 overflow-auto">
        <pre className="text-sm leading-relaxed font-mono">
          <code>
            <span className="text-gray-500 italic">
              // Save this file → OmniCAD renders it live
            </span>
            <br />
            <span className="text-purple-400">difference</span>() {"{"}
            <br />
            &nbsp;&nbsp;<span className="text-purple-400">union</span>() {"{"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="text-purple-400">cube</span>([
            <span className="text-blue-400">40</span>,{" "}
            <span className="text-blue-400">40</span>,{" "}
            <span className="text-blue-400">20</span>], center ={" "}
            <span className="text-red-400">true</span>);
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="text-purple-400">cylinder</span>(h ={" "}
            <span className="text-blue-400">30</span>, r ={" "}
            <span className="text-blue-400">12</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;center
            = <span className="text-red-400">true</span>, $fn ={" "}
            <span className="text-blue-400">64</span>);
            <br />
            &nbsp;&nbsp;{"}"}
            <br />
            &nbsp;&nbsp;<span className="text-purple-400">cylinder</span>(h ={" "}
            <span className="text-blue-400">40</span>, r ={" "}
            <span className="text-blue-400">7</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;center ={" "}
            <span className="text-red-400">true</span>, $fn ={" "}
            <span className="text-blue-400">64</span>);
            <br />
            {"}"}
          </code>
        </pre>
      </div>
    </div>
  );
};
