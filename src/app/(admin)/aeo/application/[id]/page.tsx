import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AEOApplicationDetails from "@/components/aeo/AEOApplicationDetails";

// Metadata for the page
export const metadata: Metadata = {
  title: "AEO Application Details | Duty Waiver System",
  description: "View detailed information about your AEO application.",
  keywords: "AEO, Application Details, Dashboard",
};

// Props type for the page
interface AEOApplicationPageProps {
  params: {
    id: string;
  };
}

// Make the component async to satisfy Next.js App Router types
export default async function AEOApplicationPage({
  params,
}: AEOApplicationPageProps) {
  const applicationId = parseInt(params.id);

  return (
    <div>
      <PageBreadcrumb pageTitle="AEO Application Details" />
      <div className="px-6">
        <AEOApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
}
