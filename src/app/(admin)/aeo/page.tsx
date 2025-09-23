import type { Metadata } from "next";
import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AEODashboard from "@/components/aeo/AEODashboard";

export const metadata: Metadata = {
  title: "AEO Dashboard | Duty Waiver System",
  description: "Home for AEO Dashboard Module",
};

export default function AeoPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="AEO Dashboard" />
      <div className="px-6">
        <AEODashboard />
      </div>
    </div>
  );
}
