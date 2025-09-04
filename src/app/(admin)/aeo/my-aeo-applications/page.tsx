import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function MyAeoApplications() {
  return (
    <div>
  <PageBreadCrumb pageTitle="My AEO Applications" />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">My AEO Applications</h3>
        <p className="text-sm text-gray-500 mt-2">Sample listing page for AEO applications.</p>
      </div>
    </div>
  );
}
