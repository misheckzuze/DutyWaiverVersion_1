import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import ApplicationForm from "@/components/duty-waiver/application-form/ApplicationForm";

export const metadata: Metadata = {
  title: "New Duty Waiver Application | Duty Waiver System",
  description:
    "This is the New Duty Waiver Application page for Duty Waiver System",
  keywords: "Duty Waiver, New Application, Dashboard",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Duty Waiver Application Form" />
      <div className="px-6">
        <ApplicationForm />
      </div>
    </div>
  );
}
