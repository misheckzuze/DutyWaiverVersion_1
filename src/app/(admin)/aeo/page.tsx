import type { Metadata } from "next";
import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AEODashboard from "@/components/aeo/AEODashboard";
import RecentAEOApplications from "@/components/aeo/RecentAEOApplications";

export const metadata: Metadata = {
  title: "AEO Dashboard | Duty Waiver System",
  description: "Home for AEO Dashboard Module",
};

export default function AeoPage() {
  return (
    <div className="space-y-6">
  <PageBreadCrumb pageTitle="AEO Dashboard" />
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 xl:col-span-12">
          <AEODashboard />
        </div>
        <div className="col-span-12 xl:col-span-12">
          <RecentAEOApplications />
        </div>
      </div>
    </div>
  );
}
