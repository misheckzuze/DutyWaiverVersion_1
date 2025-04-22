import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ApplicationsList from "@/components/duty-waiver/applications/ApplicationsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Duty Waiver Applications | Duty Waiver System",
  description: "View and manage your submitted duty waiver applications.",
  keywords: "Duty Waiver, Applications List, Dashboard",
};

export default function DutyWaiverApplicationsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Applications" />
      <div className="px-6">
        <ApplicationsList />
      </div>
    </div>
  );
}
