import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AEOForm from "@/components/aeo/AEOForm";

export default function NewAeoApplication() {
  return (
    <div>
      <PageBreadCrumb pageTitle="New AEO Application" />
      <div className="p-6">
        <AEOForm />
      </div>
    </div>
  );
}
