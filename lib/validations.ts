export interface CreatePlacementDriveInput {
  companyName: string;
  role: string;
  driveDate: string | Date;
  eligibleBranch: string;
  minCGPA?: number | null | string;
  jobType?: string | null;
  details?: string | null;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export interface ValidatedPlacementDriveData {
  companyName: string;
  role: string;
  driveDate: Date;
  eligibleBranch: string;
  minCGPA: number | null;
  jobType: string | null;
  details: string | null;
}

export function validatePlacementDriveInput(
  input: unknown
): ValidationResult<ValidatedPlacementDriveData> {
  const errors: Record<string, string> = {};

  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: { general: "Request payload must be a valid JSON object." },
    };
  }

  const payload = input as Record<string, unknown>;

  // 1. Company Name validation (Required text)
  if (
    payload.companyName === undefined ||
    payload.companyName === null ||
    typeof payload.companyName !== "string" ||
    payload.companyName.trim() === ""
  ) {
    errors.companyName = "Company Name is required and cannot be empty.";
  }

  // 2. Role validation (Required text)
  if (
    payload.role === undefined ||
    payload.role === null ||
    typeof payload.role !== "string" ||
    payload.role.trim() === ""
  ) {
    errors.role = "Job Role is required and cannot be empty.";
  }

  // 3. Drive Date validation (Required ISO Date/Time)
  let parsedDate: Date | null = null;
  if (
    payload.driveDate === undefined ||
    payload.driveDate === null ||
    (typeof payload.driveDate === "string" && payload.driveDate.trim() === "")
  ) {
    errors.driveDate = "Drive Date is required.";
  } else {
    parsedDate = new Date(payload.driveDate as string | Date);
    if (isNaN(parsedDate.getTime())) {
      errors.driveDate = "Drive Date must be a valid ISO Date/Time format.";
    }
  }

  // 4. Eligible Branches validation (Required text, e.g. CSE, IT)
  if (
    payload.eligibleBranch === undefined ||
    payload.eligibleBranch === null ||
    typeof payload.eligibleBranch !== "string" ||
    payload.eligibleBranch.trim() === ""
  ) {
    errors.eligibleBranch = "Eligible Branches is required (e.g. CSE, IT).";
  }

  // 5. Min CGPA validation (Optional float 0.0 - 10.0)
  let parsedCGPA: number | null = null;
  if (
    payload.minCGPA !== undefined &&
    payload.minCGPA !== null &&
    payload.minCGPA !== ""
  ) {
    const cgpaNum = Number(payload.minCGPA);
    if (isNaN(cgpaNum)) {
      errors.minCGPA = "Min CGPA must be a valid number between 0.0 and 10.0.";
    } else if (cgpaNum < 0 || cgpaNum > 10) {
      errors.minCGPA = "Min CGPA must be between 0.0 and 10.0.";
    } else {
      parsedCGPA = Math.round(cgpaNum * 100) / 100; // Round to 2 decimal places
    }
  }

  // 6. Job Type validation (Optional text: Internship / Full-Time / Other or custom)
  let parsedJobType: string | null = null;
  if (
    payload.jobType !== undefined &&
    payload.jobType !== null &&
    typeof payload.jobType === "string" &&
    payload.jobType.trim() !== ""
  ) {
    parsedJobType = payload.jobType.trim();
  }

  // 7. Details / Notes validation (Optional text, not compulsory)
  let parsedDetails: string | null = null;
  if (
    payload.details !== undefined &&
    payload.details !== null &&
    typeof payload.details === "string" &&
    payload.details.trim() !== ""
  ) {
    parsedDetails = payload.details.trim();
  }

  if (Object.keys(errors).length > 0 || !parsedDate) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: {},
    data: {
      companyName: (payload.companyName as string).trim(),
      role: (payload.role as string).trim(),
      driveDate: parsedDate,
      eligibleBranch: (payload.eligibleBranch as string).trim(),
      minCGPA: parsedCGPA,
      jobType: parsedJobType,
      details: parsedDetails,
    },
  };
}
