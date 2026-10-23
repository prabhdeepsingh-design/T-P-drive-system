"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Lock, KeyRound, Loader2, X, AlertCircle, Trash2 } from "lucide-react";

export interface DeleteTargetDrive {
  id: string;
  companyName: string;
  role: string;
}

interface DeleteDriveModalProps {
  isOpen: boolean;
  drive: DeleteTargetDrive | null;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export function DeleteDriveModal({
  isOpen,
  drive,
  onClose,
  onSuccess,
}: DeleteDriveModalProps) {
  const [step, setStep] = useState<"confirm" | "password">("confirm");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset modal state whenever it is opened or when target drive changes
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setPassword("");
      setErrorMessage(null);
      setLoading(false);
    }
  }, [isOpen, drive]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !drive) return null;

  const handleProceedToPassword = () => {
    setStep("password");
    setErrorMessage(null);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage("Administrator password is required.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/drives/${drive.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        onSuccess(drive.id);
        onClose();
      } else if (res.status === 401) {
        // Show specific error and allow user to retry without closing the dialog
        setErrorMessage(data.message || "Incorrect administrator password.");
      } else if (res.status === 404) {
        setErrorMessage(data.message || "This placement drive was not found.");
      } else {
        setErrorMessage(
          data.message || data.error || "An unexpected error occurred while deleting the drive."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setErrorMessage(`Failed to delete: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* STEP 1: INITIAL CONFIRMATION DIALOG */}
        {step === "confirm" && (
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Placement Drive?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please confirm if you want to remove this recruitment record from the database.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Drive Details
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {drive.companyName}
              </div>
              <div className="text-slate-600">
                {drive.role}
              </div>
            </div>

            <p className="text-xs text-rose-600 bg-rose-50/70 border border-rose-100 p-3 rounded-xl leading-relaxed">
              <strong>Notice:</strong> This action permanently removes this drive. In the next step, you will be prompted for the administrator password.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToPassword}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-xs shadow-xs hover:shadow transition flex items-center gap-1.5"
              >
                <span>Proceed to Password</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PASSWORD ENTRY DIALOG */}
        {step === "password" && (
          <form onSubmit={handleConfirmDelete} className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              {/* Strictly specified heading */}
              <h3 className="text-lg font-bold text-slate-900">
                Admin Password Required
              </h3>
              {/* Strictly specified message */}
              <p className="text-xs text-slate-500 mt-1">
                Enter the administrator password to delete this placement drive.
              </p>
            </div>

            <div className="px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <span className="text-slate-500">Deleting drive: </span>
              <span className="font-bold text-slate-900">{drive.companyName}</span>
              <span className="text-slate-500"> — {drive.role}</span>
            </div>

            {/* Error Message with retry allowed */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">Error:</span> {errorMessage}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="adminPassword"
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter administrator password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={loading}
                  className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errorMessage
                      ? "border-rose-400 focus:ring-rose-200 focus:border-rose-500 text-rose-900"
                      : "border-slate-200 focus:ring-blue-100 focus:border-blue-600 text-slate-800"
                  }`}
                />
              </div>
            </div>

            {/* Dialog Actions: Cancel and Confirm Delete */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300 text-white font-semibold rounded-xl text-xs shadow-xs hover:shadow transition flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying &amp; Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
