import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { DriveDetailsClient } from "@/components/DriveDetailsClient";

interface PageProps {
  params: {
    id: string;
  };
}

// Generate dynamic SEO metadata for each placement drive
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const drive = await prisma.placementDrive.findUnique({
    where: { id: params.id },
  });

  if (!drive) {
    return {
      title: "Placement Drive Not Found | GNDEC TNP",
    };
  }

  return {
    title: `${drive.companyName} — ${drive.role} | GNDEC TNP`,
    description: `Official campus recruitment notice for ${drive.companyName} (${drive.role}). Eligible branches: ${drive.eligibleBranch}. Training & Placement Cell, GNDEC Ludhiana.`,
  };
}

export default async function DriveDetailsPage({ params }: PageProps) {
  const { id } = params;

  let drive;
  try {
    drive = await prisma.placementDrive.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Database error fetching drive ${id}:`, error);
    throw new Error("Unable to connect to the database to load placement drive details.");
  }

  if (!drive) {
    notFound();
  }

  const serializedDrive = {
    ...drive,
    driveDate: drive.driveDate.toISOString(),
    createdAt: drive.createdAt.toISOString(),
    updatedAt: drive.updatedAt.toISOString(),
  };

  return <DriveDetailsClient initialDrive={serializedDrive} />;
}
