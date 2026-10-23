import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validatePlacementDriveInput } from "@/lib/validations";

/**
 * GET /api/drives
 * Purpose: Retrieves all placement drives ordered by driveDate.
 * Expected Status Codes:
 *   - 200 OK with JSON array
 *   - 500 Server Error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";

    const drives = await prisma.placementDrive.findMany({
      orderBy: {
        driveDate: order,
      },
    });

    return NextResponse.json(drives, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/drives Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to retrieve placement drives from database";
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
 * POST /api/drives
 * Purpose: Validates payload, creates entry in PostgreSQL.
 * Expected Status Codes:
 *   - 201 Created with created record
 *   - 400 Bad Request with validation error messages
 *   - 500 Server Error on database failure
 */
export async function POST(request: NextRequest) {
  try {
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

    const newDrive = await prisma.placementDrive.create({
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

    return NextResponse.json(newDrive, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/drives Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected server error occurred";
    return NextResponse.json(
      {
        error: "Server Error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
