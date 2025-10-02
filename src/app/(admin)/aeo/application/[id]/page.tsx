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

// In Next.js 15, params is a Promise
interface Params {
  id: string;
}

export default async function AEOApplicationPage({ 
  params 
}: { 
  params: Promise<Params> 
}) {
  // Await the params promise
  const { id } = await params;
  
  // Convert id to number
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