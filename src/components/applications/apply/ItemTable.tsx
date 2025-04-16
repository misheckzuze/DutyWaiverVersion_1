'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table'; // <-- Adjust this path
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon } from '@/icons';

type Item = {
  id: number;
  hsCode: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  value: number;
};

type Props = {
  items: Item[];
  editItem: (item: Item) => void;
  deleteItem: (id: number) => void;
  calculateTotalValue: () => number;
};

const ItemTable = ({ items, editItem, deleteItem, calculateTotalValue }: Props) => {
  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      { accessorKey: 'hsCode', header: 'HS Code' },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'quantity', header: 'Quantity' },
      { accessorKey: 'unitOfMeasure', header: 'Unit' },
      {
        accessorKey: 'value',
        header: 'Value (MWK)',
        cell: (info) =>
          Number(info.getValue()).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              onClick={() => editItem(row.original)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </Button>
            <Button
              onClick={() => deleteItem(row.original.id)}
              className="text-red-600 hover:text-red-800"
            >
              <EyeCloseIcon className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [editItem, deleteItem]
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableCell key={header.id} isHeader>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t">
        <div className="flex justify-between font-semibold">
          <span>Total Value:</span>
          <span>{calculateTotalValue().toLocaleString()} MWK</span>
        </div>
      </div>
    </div>
  );
};

export default ItemTable;
