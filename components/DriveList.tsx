"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  Tag,
  Search,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
  Inbox,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle,
  Clock,
  ArrowRight,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { formatDriveDate } from "@/lib/utils";
import { DeleteDriveModal, DeleteTargetDrive } from "@/components/DeleteDriveModal";

export interface PlacementDriveItem {
  id: string;
  companyName: string;
  role: string;
  driveDate: string;
  eligibleBranch: string;
  minCGPA: number | null;
  jobType: string | null;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DriveListProps {
  drives: PlacementDriveItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function DriveList({ drives, loading, error, onRefresh }: DriveListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedJobType, setSelectedJobType] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // State for password-protected deletion
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetDrive | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenDelete = (driveItem: PlacementDriveItem) => {
    setDeleteTarget({
      id: driveItem.id,
      companyName: driveItem.companyName,
      role: driveItem.role,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (_deletedId: string) => {
    setToastMessage("Placement drive deleted successfully.");
    onRefresh();
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Extract all distinct branches from drives
  const allBranches = useMemo(() => {
    const set = new Set<string>();
    drives.forEach((d) => {
      d.eligibleBranch.split(",").forEach((b) => {
        const trimmed = b.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).sort();
  }, [drives]);

  // Filter and sort drives
  const filteredDrives = useMemo(() => {
    return drives
      .filter((d) => {
        // Search term matching company name or role
        const matchSearch =
          searchTerm === "" ||
          d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.role.toLowerCase().includes(searchTerm.toLowerCase());

        // Branch filter
        const matchBranch =
          selectedBranch === "ALL" ||
          d.eligibleBranch
            .toLowerCase()
            .split(",")
            .map((b) => b.trim())
            .includes(selectedBranch.toLowerCase());

        // Job type filter
        const matchJobType =
          selectedJobType === "ALL" ||
          (d.jobType && d.jobType.toLowerCase() === selectedJobType.toLowerCase());

        return matchSearch && matchBranch && matchJobType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.driveDate).getTime();
        const dateB = new Date(b.driveDate).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [drives, searchTerm, selectedBranch, selectedJobType, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Registered Placement Drives</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {drives.length} {drives.length === 1 ? "drive" : "drives"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time schedule of campus recruitment drives synced with PostgreSQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Table View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
            title="Reload from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Bonus Feature) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>

        {/* Branch Filter */}
        <div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition text-slate-700"
          >
            <option value="ALL">All Branches</option>
            {allBranches.map((branch) => (
              <option key={branch} value={branch}>
                Branch: {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Job Type Filter */}
        <div>
          <select
            value={selectedJobType}
            onChange={(e) => setSelectedJobType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition text-slate-700"
          >
            <option value="ALL">All Job Types</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Internship">Internship</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <button
            type="button"
            onClick={toggleSortOrder}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 active:bg-slate-200 transition text-slate-700 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Date: {sortOrder === "asc" ? "Earliest First" : "Latest First"}</span>
            </span>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Loading State Spinner */}
      {loading && drives.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">Loading placement drives...</p>
          <p className="text-xs text-slate-400 mt-1">Connecting to PostgreSQL database via Prisma ORM</p>
        </div>
      )}

      {/* Server Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-rose-900">Database / Server Communication Error</div>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-2 text-xs font-semibold text-rose-800 hover:text-rose-950 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Empty State Placeholder */}
      {!loading && !error && filteredDrives.length === 0 && drives.length === 0 && (
        <div className="py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Placement Drives Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No drives have been registered in the database yet. Use the registration form on the left to add your first recruitment drive.
          </p>
        </div>
      )}

      {/* Search Filter No Results State */}
      {!loading && !error && filteredDrives.length === 0 && drives.length > 0 && (
        <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No matching placement drives</h3>
          <p className="text-xs text-slate-500 mt-1">
            No placement drives match your filter &quot;{searchTerm || selectedBranch || selectedJobType}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedBranch("ALL");
              setSelectedJobType("ALL");
            }}
            className="mt-3 px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* CARD VIEW */}
      {!loading && viewMode === "cards" && filteredDrives.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDrives.map((drive) => {
            const branches = drive.eligibleBranch
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean);

            return (
              <Link
                key={drive.id}
                href={`/drives/${drive.id}`}
                className="group relative bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer text-left block"
                aria-label={`View placement drive details for ${drive.companyName} - ${drive.role}`}
              >
                <div>
                  {/* Top Bar: Company & Job Type */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {drive.companyName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                          {drive.companyName}
                        </h3>
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{drive.role}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {drive.jobType && (
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            drive.jobType === "Internship"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : drive.jobType === "Full-Time"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {drive.jobType}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenDelete(drive);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                        title={`Delete drive for ${drive.companyName}`}
                        aria-label={`Delete drive for ${drive.companyName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="mt-3.5 mb-3 px-3 py-2 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center text-xs text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 mr-2 flex-shrink-0" />
                    <span className="font-medium">{formatDriveDate(drive.driveDate)}</span>
                  </div>

                  {/* Criteria: Branches & Min CGPA */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Eligible Branches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {branches.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 bg-blue-50/80 text-blue-700 rounded-md font-semibold text-[11px] border border-blue-200/60"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-medium">Min CGPA:</span>
                        <span className="font-bold text-slate-800">
                          {drive.minCGPA !== null ? `${drive.minCGPA.toFixed(2)}` : "None"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {drive.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Card Action Footer with Delete Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDelete(drive);
                    }}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 font-semibold transition px-1 py-0.5 rounded hover:bg-rose-50"
                    title={`Delete drive for ${drive.companyName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <span className="text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === "table" && filteredDrives.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Drive Date</th>
                <th className="px-4 py-3">Eligible Branches</th>
                <th className="px-4 py-3">Min CGPA</th>
                <th className="px-4 py-3">Job Type</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrives.map((drive) => (
                <tr key={drive.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <Link
                      href={`/drives/${drive.id}`}
                      className="hover:text-blue-600 hover:underline inline-flex items-center gap-1.5"
                    >
                      <span>{drive.companyName}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{drive.role}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {formatDriveDate(drive.driveDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {drive.eligibleBranch.split(",").map((b) => (
                        <span
                          key={b}
                          className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-semibold border border-blue-200/50"
                        >
                          {b.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {drive.minCGPA !== null ? drive.minCGPA.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {drive.jobType ? (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          drive.jobType === "Internship"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : drive.jobType === "Full-Time"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {drive.jobType}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/drives/${drive.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete(drive)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition"
                        title={`Delete drive for ${drive.companyName}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Delete Drive Modal */}
      <DeleteDriveModal
        isOpen={isDeleteModalOpen}
        drive={deleteTarget}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
