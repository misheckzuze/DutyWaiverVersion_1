"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from "@tanstack/react-table";
import {
  EyeIcon,
  TrashBinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon as SubmitIcon, // reuse as submit
} from "@/icons";

export type AEOAttachment = {
  id: number;
  applicationId: number;
  attachmentId: number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
};

export type AEOApplication = {
  id: number;
  status: string; // e.g. "Draft"
  companyId: number;
  createdAt: string;
  updatedAt: string;
  applicationDate: string;
  attachments: AEOAttachment[];
};

type AEOStatusKey = "draft" | "submitted" | "approved" | "rejected" | "processing";

const statusStyles: Record<
  AEOStatusKey,
  { class: string; icon: React.ReactNode; gradient: string }
> = {
  draft: {
    class:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300",
    icon: <ClockIcon className="w-4 h-4 text-gray-600" />,
    gradient: "from-gray-50 to-gray-100",
  },
  submitted: {
    class:
      "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
    icon: <ClockIcon className="w-4 h-4 text-blue-600" />,
    gradient: "from-blue-50 to-blue-100",
  },
  processing: {
    class:
      "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
    icon: <ClockIcon className="w-4 h-4 text-yellow-600" />,
    gradient: "from-yellow-50 to-yellow-100",
  },
  approved: {
    class:
      "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
    icon: <CheckCircleIcon className="w-4 h-4 text-green-600" />,
    gradient: "from-green-50 to-green-100",
  },
  rejected: {
    class:
      "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
    icon: <XCircleIcon className="w-4 h-4 text-red-600" />,
    gradient: "from-red-50 to-red-100",
  },
};

function normalizeStatus(s: string): AEOStatusKey {
  const k = (s || "").toLowerCase();
  if (["draft", "submitted", "approved", "rejected", "processing"].includes(k)) {
    return k as AEOStatusKey;
  }
  return "draft";
}

interface Props {
  applications: AEOApplication[];
  onSubmit: (id: string) => void;
  onCancel: (id: string) => void;
  onView: (id: string) => void;
}

export const AEOApplicationsTable: React.FC<Props> = ({
  applications,
  onSubmit,
  onCancel,
  onView,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<AEOApplication>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Application Number",
        cell: ({ row }) => (
          <button
            onClick={() => onView(String(row.original.id))}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            title="View application"
          >
            #{row.original.id}
          </button>
        ),
      },
      {
        accessorKey: "applicationDate",
        header: "Date of application",
        cell: ({ row }) => (
          <span className="text-gray-700">
            {new Date(row.original.applicationDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = normalizeStatus(row.original.status);
          return (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${statusStyles[s].class}`}
            >
              {statusStyles[s].icon}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const s = normalizeStatus(row.original.status);
          const id = String(row.original.id);

          return (
            <div className="flex gap-2 justify-end">
              {/* Always allow view */}
              <button
                onClick={() => onView(id)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="View"
              >
                <EyeIcon className="w-4 h-4" />
              </button>

              {s === "draft" && (
                <>
                  <button
                    onClick={() => onSubmit(id)}
                    className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                    title="Submit"
                  >
                    <SubmitIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onCancel(id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Cancel"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [onSubmit, onCancel, onView]
  );

  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Search & controls */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EyeIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search applications..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ArrowUpIcon className="h-3 w-3 ml-1" />,
                        desc: <ArrowDownIcon className="h-3 w-3 ml-1" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    normalizeStatus(row.original.status) !== "draft"
                      ? "bg-gray-50 opacity-90"
                      : "hover:bg-gray-50 transition-colors"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No applications found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of <span className="font-medium">{table.getPageCount()}</span> pages (
          {table.getFilteredRowModel().rows.length} applications)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`p-2 rounded-md ${
              !table.getCanPreviousPage()
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
            const pageIndex =
              table.getPageCount() <= 5
                ? i
                : Math.min(
                    Math.max(0, table.getPageCount() - 5),
                    Math.max(0, table.getState().pagination.pageIndex - 2)
                  ) + i;

            if (pageIndex >= table.getPageCount()) return null;

            return (
              <button
                key={pageIndex}
                onClick={() => table.setPageIndex(pageIndex)}
                className={`w-8 h-8 rounded-md text-sm ${
                  table.getState().pagination.pageIndex === pageIndex
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageIndex + 1}
              </button>
            );
          })}

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`p-2 rounded-md ${
              !table.getCanNextPage()
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
