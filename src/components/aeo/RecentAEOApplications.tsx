import React from "react";

const sample = [
  { id: 1, ref: "AEO-001", name: "Operator A", status: "Approved" },
  { id: 2, ref: "AEO-002", name: "Operator B", status: "Pending" },
];

export default function RecentAEOApplications() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Recent AEO Applications</h3>
      <ul className="mt-3 space-y-3">
        {sample.map((s) => (
          <li key={s.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800 dark:text-white">{s.name}</div>
              <div className="text-sm text-gray-500">{s.ref}</div>
            </div>
            <div className={`text-sm px-2 py-1 rounded ${s.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
