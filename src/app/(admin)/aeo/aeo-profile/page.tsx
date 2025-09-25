import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AEOForm from "@/components/aeo/AEOForm";

export default function AeoProfilePage() {
  return (
    <div>
      <PageBreadCrumb pageTitle="Company Profile" />
      <div className="p-6">
        <AEOForm />
      </div>
    </div>
  );
}
