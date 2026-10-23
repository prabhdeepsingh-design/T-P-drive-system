import React from "react";
import { GraduationCap, Briefcase, Database, CheckCircle2 } from "lucide-react";

export function Header() {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  TNP Technical Team
                </span>
                <span className="text-xs text-slate-400">GNDEC Ludhiana</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                Placement Drive Manager
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-slate-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>PostgreSQL & Prisma</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 text-emerald-300 rounded-lg border border-emerald-800/40 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>System Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
