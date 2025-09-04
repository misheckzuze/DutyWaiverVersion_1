import React from "react";

export default function AEODashboard() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AEO Analytics</h2>
      <div className="mt-3 text-sm text-gray-500">Placeholder analytics for the AEO module. Replace with real charts and metrics as needed.</div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">Total Registrations<br/><span className="text-2xl font-bold">120</span></div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">Active Operators<br/><span className="text-2xl font-bold">42</span></div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">Pending Approvals<br/><span className="text-2xl font-bold">5</span></div>
      </div>
    </div>
  );
}
