import type { Metadata } from "next";
import React from "react";
import { TopDasboardAnalytics } from "@/components/dashboard/TopDasboardAnalytics";
import RecentApplications from "@/components/dashboard/RecentApplications";

export const metadata: Metadata = {
  title:
    "Dashboard | Duty Waiver System",
  description: "Home for Duty Waiver Dashboard System",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-12 xl:col-span-12">
        <TopDasboardAnalytics />

      </div>
      <div className="col-span-12 xl:col-span-12">
        <RecentApplications />
      </div>
    </div>
  );
}
