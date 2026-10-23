import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { validatePlacementDriveInput } from "@/lib/validations";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/drives/[id]
 * Purpose: Retrieves a specific placement drive by its database cuid ID.
 * Expected Status Codes:
 *   - 200 OK with drive object
 *   - 404 Not Found if record does not exist
 *   - 500 Server Error on database failure
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A valid drive ID must be provided in the route parameters.",
        },
        { status: 400 }
      );
    }

    const drive = await prisma.placementDrive.findUnique({
      where: {
        id,
      },
    });

    if (!drive) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `Placement drive with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(drive, { status: 200 });
  } catch (error: unknown) {
    console.error(`GET /api/drives/${params?.id} Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve placement drive from database";
    return NextResponse.json(
      {
        error: "Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/drives/[id]
 * Purpose: Updates the details of an existing placement drive.
 * Expected Status Codes:
 *   - 200 OK with updated drive object
 *   - 400 Bad Request if validation fails
 *   - 404 Not Found if record doesn't exist
 *   - 500 Server Error
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A valid drive ID must be provided in the route parameters.",
        },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Malformed JSON in request body",
        },
        { status: 400 }
      );
    }

    const validation = validatePlacementDriveInput(body);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "Validation failed for placement drive payload",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Verify existing drive
    const existing = await prisma.placementDrive.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `Placement drive with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    const updatedDrive = await prisma.placementDrive.update({
      where: { id },
      data: {
        companyName: validation.data.companyName,
        role: validation.data.role,
        driveDate: validation.data.driveDate,
        eligibleBranch: validation.data.eligibleBranch,
        minCGPA: validation.data.minCGPA,
        jobType: validation.data.jobType,
        details: validation.data.details,
      },
    });

    return NextResponse.json(updatedDrive, { status: 200 });
  } catch (error: unknown) {
    console.error(`PUT /api/drives/${params?.id} Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update placement drive in database";
    return NextResponse.json(
      {
        error: "Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

/**
 * Securely compares the provided password with the server-configured administrator password.
 * Uses SHA-256 and timingSafeEqual to avoid timing attack vulnerabilities.
 */
function verifyAdminPassword(provided: string, expected: string): boolean {
  if (typeof provided !== "string" || typeof expected !== "string") return false;
  const hashA = crypto.createHash("sha256").update(provided).digest();
  const hashB = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * DELETE /api/drives/[id]
 * Purpose: Securely deletes a placement drive by ID, requiring valid admin password.
 * Expected Status Codes:
 *   - 200 OK: Placement drive deleted successfully
 *   - 400 Bad Request: Missing or invalid drive ID
 *   - 401 Unauthorized: Incorrect or missing administrator password
 *   - 404 Not Found: Placement drive with specified ID does not exist
 *   - 500 Server Error: Server configuration issue or unexpected database error
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          error: "Bad Request",
          message: "A valid drive ID must be provided in the route parameters.",
        },
        { status: 400 }
      );
    }

    // 1. Verify server-side administrator password configuration
    const expectedPassword = process.env.ADMIN_DELETE_PASSWORD;
    if (!expectedPassword || expectedPassword.trim() === "") {
      console.error("ADMIN_DELETE_PASSWORD environment variable is not configured on the server.");
      return NextResponse.json(
        {
          error: "Server Error",
          message: "Server configuration error: Administrator delete password is not configured.",
        },
        { status: 500 }
      );
    }

    // 2. Extract provided password from request body or x-admin-password header
    let providedPassword: string | undefined;

    const headerPwd = request.headers.get("x-admin-password");
    if (headerPwd && headerPwd.trim()) {
      providedPassword = headerPwd.trim();
    } else {
      try {
        const body = await request.json();
        if (body && typeof body === "object" && typeof body.password === "string") {
          providedPassword = body.password.trim();
        }
      } catch {
        // Request body might be empty or malformed
      }
    }

    // 3. Reject if password is missing (401 Unauthorized)
    if (!providedPassword) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Incorrect administrator password.",
        },
        { status: 401 }
      );
    }

    // 4. Reject if password is incorrect (401 Unauthorized)
    const isPasswordValid = verifyAdminPassword(providedPassword, expectedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Incorrect administrator password.",
        },
        { status: 401 }
      );
    }

    // 5. Check if target drive exists in database
    const existing = await prisma.placementDrive.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: `Placement drive with ID '${id}' was not found.`,
        },
        { status: 404 }
      );
    }

    // 6. Execute delete operation in PostgreSQL
    await prisma.placementDrive.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Placement drive deleted successfully.",
        deletedDriveId: id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(`DELETE /api/drives/${params?.id} Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete placement drive from database";
    return NextResponse.json(
      {
        error: "Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

