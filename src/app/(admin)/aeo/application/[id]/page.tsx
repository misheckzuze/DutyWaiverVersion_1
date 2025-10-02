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

// Accept id as string or string[] and normalize it
interface Params {
  id: string | string[];
}

export default async function AEOApplicationPage({ params }: { params: Params }) {
  // Convert id to string if it's an array
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const applicationId = parseInt(id, 10);

  return (
    <div>
      <PageBreadcrumb pageTitle="AEO Application Details" />
      <div className="px-6">
        <AEOApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
}
