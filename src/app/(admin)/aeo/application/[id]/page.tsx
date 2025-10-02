import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AEOApplicationDetails from "@/components/aeo/AEOApplicationDetails";

// Metadata
export const metadata: Metadata = {
  title: "AEO Application Details | Duty Waiver System",
  description: "View detailed information about your AEO application.",
  keywords: "AEO, Application Details, Dashboard",
};

// Page props
interface AEOApplicationPageProps {
  params: { id: string };
}

// Async page component with PageProps type
export default async function AEOApplicationPage({
  params,
}: AEOApplicationPageProps) {
  const applicationId = parseInt(params.id, 10);

  return (
    <div>
      <PageBreadcrumb pageTitle="AEO Application Details" />
      <div className="px-6">
        <AEOApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
}
