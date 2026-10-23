"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DriveForm } from "@/components/DriveForm";
import { DriveList, PlacementDriveItem } from "@/components/DriveList";
import { Building2, Calendar, Award, Users, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const [drives, setDrives] = useState<PlacementDriveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drives", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Server responded with HTTP status ${res.status} (${res.statusText})`
        );
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setDrives(data);
      } else if (data && Array.isArray(data.data)) {
        setDrives(data.data);
      } else {
        setDrives([]);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch placement drives:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load placement drives. Please check your PostgreSQL connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  // Compute metrics
  const uniqueCompanies = new Set(drives.map((d) => d.companyName.trim())).size;
  const now = new Date().getTime();
  const upcomingCount = drives.filter(
    (d) => new Date(d.driveDate).getTime() >= now
  ).length;

  const validCgpaDrives = drives.filter(
    (d) => d.minCGPA !== null && d.minCGPA !== undefined
  );
  const avgCgpa =
    validCgpaDrives.length > 0
      ? (
          validCgpaDrives.reduce((acc, curr) => acc + (curr.minCGPA || 0), 0) /
          validCgpaDrives.length
        ).toFixed(2)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Banner with Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Drives */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{drives.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Drives</div>
          </div>
        </div>

        {/* Upcoming Drives */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{upcomingCount}</div>
            <div className="text-xs font-medium text-slate-500">Upcoming Drives</div>
          </div>
        </div>

        {/* Visiting Companies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{uniqueCompanies}</div>
            <div className="text-xs font-medium text-slate-500">Companies Visiting</div>
          </div>
        </div>

        {/* Avg Cutoff CGPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{avgCgpa || "N/A"}</div>
            <div className="text-xs font-medium text-slate-500">Average CGPA Cutoff</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Functional Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feature 1 - Add Placement Drive Form (5 columns) */}
        <div className="lg:col-span-5 sticky top-6">
          <DriveForm onDriveCreated={fetchDrives} />
        </div>

        {/* Right Column: Feature 2 - View All Drives (7 columns) */}
        <div className="lg:col-span-7">
          <DriveList
            drives={drives}
            loading={loading}
            error={error}
            onRefresh={fetchDrives}
          />
        </div>
      </div>
    </div>
  );
}
