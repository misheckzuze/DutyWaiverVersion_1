import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function NewAeoApplication() {
  return (
    <div>
      <PageBreadCrumb pageTitle="New AEO Application" />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">New AEO Application</h3>
        <p className="text-sm text-gray-500 mt-2">Sample form page for creating a new AEO application.</p>
      </div>
    </div>
  );
}
