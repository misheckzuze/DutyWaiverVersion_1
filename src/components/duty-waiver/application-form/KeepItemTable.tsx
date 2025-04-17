'use client';

import React, { useMemo, useState } from 'react';
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
} from '@tanstack/react-table';
// import { EyeCloseIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from '@/icons';
import { EyeCloseIcon, ChevronLeftIcon, ArrowUpIcon, ArrowDownIcon } from '@/icons';

interface Item {
  id: string;
  hsCode: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  value: number;
}

type Props = {
  items: Item[];
  editItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  calculateTotalValue: () => number;
};

const KeepItemTable = ({ items, editItem, deleteItem, calculateTotalValue }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      { 
        accessorKey: 'hsCode', 
        header: 'HS Code',
        cell: info => <span className="font-medium">{info.getValue() as string}</span>
      },
      { 
        accessorKey: 'description', 
        header: 'Description',
        cell: info => <span className="text-gray-700">{info.getValue() as string}</span>
      },
      { 
        accessorKey: 'quantity', 
        header: 'Quantity',
        cell: info => <span className="text-left block">{info.getValue() as number}</span>
      },
      { 
        accessorKey: 'unitOfMeasure', 
        header: 'Unit',
        cell: info => <span className="text-gray-500 uppercase">{info.getValue() as string}</span>
      },
      {
        accessorKey: 'value',
        header: 'Value (MWK)',
        cell: (info) => (
          <span className="text-left block font-medium">
            {Number(info.getValue()).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2 justify-start">
            <button
              onClick={() => editItem(row.original)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => deleteItem(row.original.id)}
              className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <EyeCloseIcon className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [editItem, deleteItem]
  );

  const table = useReactTable({
    data: items,
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
      {/* Search and Controls */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* SearchIcon */}
            <EyeCloseIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search items..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={globalFilter ?? ''}
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
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Summary */}
      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>{' '}
          of{' '}
          <span className="font-medium">{table.getPageCount()}</span>{' '}
          pages ({table.getFilteredRowModel().rows.length} items)
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`p-2 rounded-md ${!table.getCanPreviousPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          
          {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
            const pageIndex = table.getPageCount() <= 5 
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
                className={`w-8 h-8 rounded-md text-sm ${table.getState().pagination.pageIndex === pageIndex ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {pageIndex + 1}
              </button>
            );
          })}
          
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`p-2 rounded-md ${!table.getCanNextPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {/* ChevronIcon */}
            <EyeCloseIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-sm font-semibold text-gray-700">
          Total Value: {calculateTotalValue().toLocaleString()} MWK
        </div>
      </div>
    </div>
  );
};

export default KeepItemTable;