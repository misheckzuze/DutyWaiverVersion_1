'use client';
import React, { useState } from 'react';
import { Item } from '@/types/ItemModel';
import { ItemForm } from './ItemsStep/ItemForm';
import ItemTable from './ItemsStep/ItemTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ItemsStepProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  isEditMode?: boolean; // <-- ✅ add isEditMode here
}

export const ItemsStep: React.FC<ItemsStepProps> = ({ items, setItems, isEditMode = false }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const editItem = (id: string) => {
    setEditingItemId(id);
    document.getElementById('item-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (editingItemId === id) setEditingItemId(null);
  };

  const calculateTotalValue = () => items.reduce((sum, item) => sum + (item.value || 0), 0);

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        hsCode: '123456',
        description: 'Sample Item Description',
        quantity: 100,
        unitOfMeasure: 'pcs',
        value: 5000
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'sample_items.xlsx');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const parsedItems = jsonData.map((row, index) => ({
        id: `${Date.now()}-${index}`,
        hsCode: String(row.hsCode || ''),
        description: String(row.description || ''),
        quantity: Number(row.quantity || 0),
        unitOfMeasure: String(row.unitOfMeasure || ''),
        value: Number(row.value || 0),
      }));

      setItems(prev => [...prev, ...parsedItems]);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {isEditMode ? 'Edit Items' : 'Items Requesting Duty Waiver'}
        </h3>
      </div>

      {!isEditMode && ( // <-- ✅ Only allow upload/download if NOT in edit mode
        <div className="flex gap-4 items-center mb-4">
          <button
            onClick={downloadSampleExcel}
            className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200"
          >
            Download Sample Excel
          </button>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="block text-sm text-gray-700 border border-gray-300 rounded px-4 py-2 cursor-pointer"
          />
        </div>
      )}

      <ItemForm
        items={items}
        editingItemId={editingItemId}
        setItems={setItems}
        setEditingItemId={setEditingItemId}
        isEditMode={isEditMode} // ✅ Pass it to ItemForm
      />

      <ItemTable
        items={items}
        editItem={editItem}
        deleteItem={deleteItem}
        calculateTotalValue={calculateTotalValue}
      />
    </div>
  );
};
