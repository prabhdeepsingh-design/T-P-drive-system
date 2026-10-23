"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  GraduationCap,
  Award,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Pencil,
  X,
  Loader2,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDriveDate, formatDateForInput } from "@/lib/utils";
import { PrintNoticeButton } from "@/components/PrintNoticeButton";
import { DeleteDriveModal } from "@/components/DeleteDriveModal";

export interface DriveRecord {
  id: string;
  companyName: string;
  role: string;
  driveDate: string | Date;
  eligibleBranch: string;
  minCGPA: number | null;
  jobType: string | null;
  details?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface DriveDetailsClientProps {
  initialDrive: DriveRecord;
}

const COMMON_BRANCHES = ["CSE", "IT", "ECE", "ME", "CE", "EE"];
const JOB_TYPES = ["Full-Time", "Internship", "Other"];

export function DriveDetailsClient({ initialDrive }: DriveDetailsClientProps) {
  const router = useRouter();
  const [drive, setDrive] = useState<DriveRecord>(initialDrive);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for editing
  const [companyName, setCompanyName] = useState(drive.companyName);
  const [role, setRole] = useState(drive.role);
  const [driveDate, setDriveDate] = useState(() =>
    formatDateForInput(new Date(drive.driveDate))
  );
  const [eligibleBranch, setEligibleBranch] = useState(drive.eligibleBranch);
  const [minCGPA, setMinCGPA] = useState(
    drive.minCGPA !== null && drive.minCGPA !== undefined ? String(drive.minCGPA) : ""
  );
  const [jobType, setJobType] = useState<string>(drive.jobType || "Full-Time");
  const [details, setDetails] = useState<string>(drive.details || "");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // State for password-protected delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteSuccess = (_deletedId: string) => {
    setSuccessToast("Placement drive deleted successfully.");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  };

  // Open edit modal and sync values with current drive state
  const handleOpenEdit = () => {
    setCompanyName(drive.companyName);
    setRole(drive.role);
    setDriveDate(formatDateForInput(new Date(drive.driveDate)));
    setEligibleBranch(drive.eligibleBranch);
    setMinCGPA(
      drive.minCGPA !== null && drive.minCGPA !== undefined ? String(drive.minCGPA) : ""
    );
    setJobType(drive.jobType || "Full-Time");
    setDetails(drive.details || "");
    setErrorMessage(null);
    setFieldErrors({});
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setIsEditModalOpen(false);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleBranchChipClick = (branch: string) => {
    const currentList = eligibleBranch
      ? eligibleBranch.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    if (currentList.includes(branch)) {
      setEligibleBranch(currentList.filter((b) => b !== branch).join(", "));
    } else {
      setEligibleBranch([...currentList, branch].join(", "));
    }
  };

  const handleSelectAllBranches = () => {
    setEligibleBranch("CSE, IT, ECE, ME, CE, EE");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = "Company Name is required.";
    if (!role.trim()) errors.role = "Job Role is required.";
    if (!driveDate) errors.driveDate = "Drive Date is required.";
    if (!eligibleBranch.trim()) errors.eligibleBranch = "Eligible Branches is required.";

    if (minCGPA !== "") {
      const num = Number(minCGPA);
      if (isNaN(num) || num < 0 || num > 10) {
        errors.minCGPA = "CGPA must be a valid number between 0.0 and 10.0.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    try {
      const isoDriveDate = new Date(driveDate).toISOString();
      const payload = {
        companyName: companyName.trim(),
        role: role.trim(),
        driveDate: isoDriveDate,
        eligibleBranch: eligibleBranch.trim(),
        minCGPA: minCGPA !== "" ? parseFloat(minCGPA) : null,
        jobType: jobType || null,
        details: details.trim() ? details.trim() : null,
      };

      const res = await fetch(`/api/drives/${drive.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setDrive(data);
        setIsEditModalOpen(false);
        setSuccessToast("Placement drive details updated successfully!");
        router.refresh();
        setTimeout(() => setSuccessToast(null), 4000);
      } else if (res.status === 400) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setErrorMessage(data.message || "Validation failed. Please review the highlighted fields.");
      } else {
        setErrorMessage(data.message || data.error || "Failed to update placement drive.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(`Failed to update drive: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // Parse branches
  const branches = drive.eligibleBranch
    ? drive.eligibleBranch
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
    : [];

  // Determine if drive is upcoming or past
  const driveTime = new Date(drive.driveDate).getTime();
  const isUpcoming = driveTime >= Date.now();
  const noticeRefNo = `GNDEC/TNP/REC/${drive.id.slice(-6).toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-blue-600 transition flex items-center gap-1">
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/" className="hover:text-blue-600 transition">
            <span>Placement Drives</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-[200px]">
            {drive.companyName}
          </span>
        </nav>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Drives</span>
          </Link>

          {/* Edit Drive Option */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition"
            title="Edit Placement Drive Details"
          >
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span>Edit Drive</span>
          </button>

          {/* Delete Drive Option */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 text-xs font-semibold shadow-2xs transition"
            title="Delete Placement Drive"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete Drive</span>
          </button>

          <PrintNoticeButton />
        </div>
      </div>

      {/* Main Official Announcement Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Top Header Banner: GNDEC T&P Style */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 font-extrabold text-xl flex items-center justify-center shadow-inner shrink-0 uppercase">
                {drive.companyName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Official Recruitment Notice
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ref: {noticeRefNo}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {drive.companyName}
                </h1>
                <p className="text-sm sm:text-base font-medium text-blue-200 flex items-center gap-1.5 mt-1">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>{drive.role}</span>
                </p>
              </div>
            </div>

            {/* Status & Job Type Badges */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                  isUpcoming
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {isUpcoming ? "● Upcoming Drive" : "● Past Drive"}
              </span>

              {drive.jobType ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/50">
                  {drive.jobType}
                </span>
              ) : (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Job Type: Not specified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Notice Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Key Parameters 4-Tile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Drive Date */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Drive Date</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {formatDriveDate(drive.driveDate)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Scheduled recruitment date
                </div>
              </div>
            </div>

            {/* Position / Role */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Job Role</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {drive.role}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Designation offered
                </div>
              </div>
            </div>

            {/* Minimum CGPA */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Min CGPA Cutoff</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {drive.minCGPA !== null && drive.minCGPA !== undefined
                    ? `${drive.minCGPA.toFixed(2)} / 10.0`
                    : "Not specified"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {drive.minCGPA !== null ? "Academic score cutoff" : "No minimum cutoff specified"}
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Employment Type</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {drive.jobType || "Not specified"}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Contract / Placement category
                </div>
              </div>
            </div>
          </div>

          {/* Section: Eligible Engineering Branches */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Eligible Engineering Branches</span>
            </h2>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
              <p className="text-xs text-slate-600 mb-3">
                Students enrolled in the following GNDEC academic departments are eligible to register and participate in this drive:
              </p>
              <div className="flex flex-wrap gap-2">
                {branches.length > 0 ? (
                  branches.map((b) => (
                    <span
                      key={b}
                      className="px-3 py-1.5 bg-white text-blue-800 font-bold text-xs rounded-lg border border-blue-200 shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{b}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Not specified</span>
                )}
              </div>
            </div>
          </section>

          {/* Section: Drive Details & Additional Notes */}
          <section className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Drive Details &amp; Additional Information</span>
              </h2>

              <button
                type="button"
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{drive.details ? "Edit Details" : "Add Details"}</span>
              </button>
            </div>

            {drive.details ? (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-xs">
                {drive.details}
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No additional details or instructions added yet for this recruitment drive.</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Details</span>
                </button>
              </div>
            )}
          </section>

          {/* Section: Important Candidate Guidelines (Official GNDEC T&P Protocol) */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Candidate Guidelines &amp; Instructions</span>
            </h2>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-xs text-slate-700 space-y-2.5 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 shrink-0">1.</span>
                <span>
                  <strong>Formal Dress Code:</strong> College uniform or formal attire is strictly mandatory for all aptitude tests, technical rounds, and HR interviews.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 shrink-0">2.</span>
                <span>
                  <strong>Mandatory Documents:</strong> Students must carry their official <strong>GNDEC Student ID Card</strong>, along with at least <strong>two hard copies</strong> of their updated CV/Resume and original academic marksheets.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 shrink-0">3.</span>
                <span>
                  <strong>Reporting Time:</strong> Candidates must report at least <strong>15 minutes prior</strong> to the scheduled drive time ({formatDriveDate(drive.driveDate)}).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-blue-600 shrink-0">4.</span>
                <span>
                  <strong>TNP Code of Conduct:</strong> Malpractice, falsification of CGPA, or absenteeism after confirmation will result in debarment as per T&amp;P Cell policy.
                </span>
              </div>
            </div>
          </section>

          {/* Section: Administrative & Record Details */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Record &amp; Notice Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Database Record ID
                </span>
                <span className="font-mono text-slate-800 select-all font-semibold">
                  {drive.id}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Registered In Database
                </span>
                <span className="text-slate-800 font-medium">
                  {formatDriveDate(drive.createdAt)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                  Last Updated
                </span>
                <span className="text-slate-800 font-medium">
                  {formatDriveDate(drive.updatedAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Placement Drives</span>
            </Link>

            <div className="text-center sm:text-right text-[11px] text-slate-400">
              Guru Nanak Dev Engineering College &bull; Training &amp; Placement Cell
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Placement Drive Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update information and optional notes for {drive.companyName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                disabled={saving}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold">Save Error:</span> {errorMessage}
                  </div>
                </div>
              )}

              {/* Company Name */}
              <div>
                <label
                  htmlFor="editCompanyName"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    id="editCompanyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.companyName
                        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                    }`}
                  />
                </div>
                {fieldErrors.companyName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {fieldErrors.companyName}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label
                  htmlFor="editRole"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Job Role / Profile <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    id="editRole"
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.role
                        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                    }`}
                  />
                </div>
                {fieldErrors.role && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {fieldErrors.role}
                  </p>
                )}
              </div>

              {/* Row: Drive Date & Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="editDriveDate"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Drive Date &amp; Time <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      id="editDriveDate"
                      type="datetime-local"
                      required
                      value={driveDate}
                      onChange={(e) => setDriveDate(e.target.value)}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.driveDate
                          ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                          : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                      }`}
                    />
                  </div>
                  {fieldErrors.driveDate && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {fieldErrors.driveDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="editJobType"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Job Type <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <select
                      id="editJobType"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-700"
                    >
                      {JOB_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Eligible Branches */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="editEligibleBranch"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                  >
                    Eligible Branches <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllBranches}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    Select All Core Branches
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    id="editEligibleBranch"
                    type="text"
                    required
                    value={eligibleBranch}
                    onChange={(e) => setEligibleBranch(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.eligibleBranch
                        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                    }`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 font-medium">Quick toggle:</span>
                  {COMMON_BRANCHES.map((b) => {
                    const selected = eligibleBranch
                      .split(",")
                      .map((s) => s.trim())
                      .includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleBranchChipClick(b)}
                        className={`px-2 py-0.5 text-xs rounded-md transition border font-medium ${
                          selected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                        }`}
                      >
                        {selected ? `✓ ${b}` : `+ ${b}`}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.eligibleBranch && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {fieldErrors.eligibleBranch}
                  </p>
                )}
              </div>

              {/* Min CGPA */}
              <div>
                <label
                  htmlFor="editMinCGPA"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Minimum CGPA Requirement{" "}
                  <span className="text-slate-400 font-normal lowercase">(optional, 0.0 – 10.0)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <input
                    id="editMinCGPA"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="Leave blank if no minimum cutoff"
                    value={minCGPA}
                    onChange={(e) => setMinCGPA(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.minCGPA
                        ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                        : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                    }`}
                  />
                </div>
                {fieldErrors.minCGPA && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {fieldErrors.minCGPA}
                  </p>
                )}
              </div>

              {/* Drive Details / Notes (Optional - Not Compulsory) */}
              <div>
                <label
                  htmlFor="editDetails"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Drive Details / Additional Information{" "}
                  <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    id="editDetails"
                    rows={4}
                    placeholder="e.g. Selection rounds, CTC package, bond details, venue, test syllabus, or special instructions (optional)"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-700 resize-y"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Not compulsory. Provide any special instructions, interview rounds, or salary breakdown.
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs shadow-xs hover:shadow transition flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Placement Drive Modal */}
      <DeleteDriveModal
        isOpen={isDeleteModalOpen}
        drive={{
          id: drive.id,
          companyName: drive.companyName,
          role: drive.role,
        }}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
