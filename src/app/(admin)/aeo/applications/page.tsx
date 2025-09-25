import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AEOApplicationList from "@/components/aeo/applications/AEOApplicationList";

export const metadata: Metadata = {
  title: "AEO Applications | Duty Waiver System",
  description: "View and manage your submitted duty AEO applications.",
  keywords: "AEO, Applications List, Dashboard",
};

export default function AEOApplicationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="AEO Applications" />
      <div className="px-6">
        <AEOApplicationList />
      </div>
    </div>
  );
}

