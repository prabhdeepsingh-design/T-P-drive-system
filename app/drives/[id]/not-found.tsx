import React from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion, Search } from "lucide-react";

export default function DriveNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-full border border-amber-300/50">
          404 Not Found
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
          Placement Drive Not Found
        </h1>

        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          The requested recruitment drive could not be located in the GNDEC Training &amp; Placement database. It may have been updated, removed, or the link may be incorrect.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Drives</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
          >
            <Search className="w-4 h-4" />
            <span>Search Other Drives</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
