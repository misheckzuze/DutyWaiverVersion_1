import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import AEOForm from "@/components/aeo/AEOForm";
import ProfileCompletionStatus from "@/components/aeo/ProfileCompletionStatus";

export const metadata: Metadata = {
  title: "AEO Company Profile | Duty Waiver System",
  description: "Manage your AEO company profile information.",
  keywords: "AEO, Company Profile, Dashboard",
};

export default function AEOProfilePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="AEO Company Profile" />
      <div className="px-6">
        <ProfileCompletionStatus />
        <AEOForm />
      </div>
    </div>
  );
}
