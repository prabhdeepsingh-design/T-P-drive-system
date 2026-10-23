"use client";

import React, { useState } from "react";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle, Building2, Briefcase, Calendar, GraduationCap, Award, Tag, FileText } from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

interface DriveFormProps {
  onDriveCreated?: () => void;
}

const COMMON_BRANCHES = ["CSE", "IT", "ECE", "ME", "CE", "EE"];
const JOB_TYPES = ["Full-Time", "Internship", "Other"];

export function DriveForm({ onDriveCreated }: DriveFormProps) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [driveDate, setDriveDate] = useState(formatDateForInput());
  const [eligibleBranch, setEligibleBranch] = useState("");
  const [minCGPA, setMinCGPA] = useState("");
  const [jobType, setJobType] = useState<string>("Full-Time");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
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

    setLoading(true);

    try {
      // Format driveDate as full ISO 8601 string
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

      const res = await fetch("/api/drives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 201) {
        setSuccessMessage(`Placement drive for "${payload.companyName} - ${payload.role}" registered successfully!`);
        // Clear form fields as specified in Feature 1
        setCompanyName("");
        setRole("");
        setDriveDate(formatDateForInput());
        setEligibleBranch("");
        setMinCGPA("");
        setJobType("Full-Time");
        setDetails("");
        setFieldErrors({});

        if (onDriveCreated) {
          onDriveCreated();
        }
      } else if (res.status === 400) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setErrorMessage(data.message || "Validation failed. Please review the highlighted fields.");
      } else {
        setErrorMessage(data.message || data.error || "Server error occurred while saving placement drive.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(`Failed to submit: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Register New Placement Drive</h2>
          <p className="text-xs text-slate-500">Record upcoming campus recruitment drives and internships</p>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-800 text-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Success!</span> {successMessage}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Submission Error:</span> {errorMessage}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              id="companyName"
              type="text"
              required
              placeholder="e.g. Microsoft, Infosys, Tata Consultancy Services"
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
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.companyName}</p>
          )}
        </div>

        {/* Job Role */}
        <div>
          <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Job Role / Profile <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              id="role"
              type="text"
              required
              placeholder="e.g. Software Development Engineer, Trainee Engineer"
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
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.role}</p>
          )}
        </div>

        {/* Row: Drive Date & Job Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Drive Date (ISO Date/Time) */}
          <div>
            <label htmlFor="driveDate" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Drive Date & Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="driveDate"
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
              <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.driveDate}</p>
            )}
          </div>

          {/* Job Type (Optional) */}
          <div>
            <label htmlFor="jobType" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Type <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-700"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Eligible Branches */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="eligibleBranch" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
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
              id="eligibleBranch"
              type="text"
              required
              placeholder="e.g. CSE, IT or ME, EE"
              value={eligibleBranch}
              onChange={(e) => setEligibleBranch(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.eligibleBranch
                  ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                  : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
          </div>
          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick add:</span>
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
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.eligibleBranch}</p>
          )}
        </div>

        {/* Min CGPA (Optional Float 0.0 - 10.0) */}
        <div>
          <label htmlFor="minCGPA" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Minimum CGPA Requirement <span className="text-slate-400 font-normal lowercase">(optional, 0.0 – 10.0)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Award className="w-4 h-4" />
            </div>
            <input
              id="minCGPA"
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 7.50 (Leave blank if no minimum cutoff)"
              value={minCGPA}
              onChange={(e) => setMinCGPA(e.target.value)}
              className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.minCGPA
                  ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500"
                  : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
              }`}
            />
          </div>
          {/* Quick CGPA buttons */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">Common cutoffs:</span>
            {["6.0", "6.5", "7.0", "7.5", "8.0"].map((cgpa) => (
              <button
                key={cgpa}
                type="button"
                onClick={() => setMinCGPA(cgpa)}
                className={`px-2 py-0.5 text-xs rounded-md transition border font-medium ${
                  minCGPA === cgpa
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                }`}
              >
                {cgpa}+
              </button>
            ))}
            {minCGPA !== "" && (
              <button
                type="button"
                onClick={() => setMinCGPA("")}
                className="px-2 py-0.5 text-xs rounded-md text-slate-500 hover:text-slate-700 underline"
              >
                Clear
              </button>
            )}
          </div>
          {fieldErrors.minCGPA && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.minCGPA}</p>
          )}
        </div>

        {/* Drive Details / Description (Optional - Not Compulsory) */}
        <div>
          <label htmlFor="details" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Drive Details / Additional Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              id="details"
              rows={3}
              placeholder="e.g. Selection rounds, CTC package, bond details, venue, or special instructions (optional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-700 resize-y"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Optional: You can provide additional details now or edit them after opening the drive.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Drive in PostgreSQL...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Register Placement Drive</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
