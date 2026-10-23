import React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DriveDetailsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Top Navigation Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Drives</span>
        </Link>
        <div className="h-6 w-28 bg-slate-200 rounded-full" />
      </div>

      {/* Main Notice Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-full" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
            <div className="h-28 bg-slate-100 rounded-xl" />
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading placement drive details from PostgreSQL database...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
