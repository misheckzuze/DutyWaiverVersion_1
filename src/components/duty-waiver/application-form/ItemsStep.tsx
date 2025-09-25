'use client';
import React, { useMemo, useState } from 'react';
import { Item } from '@/types/ItemModel';
import { ItemForm } from './ItemsStep/ItemForm';
import ItemTable from './ItemsStep/ItemTable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useHSCodeBatchValidation } from '@/hooks/useHSCodeValidation';

interface ItemsStepProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  isEditMode?: boolean; // <-- ✅ add isEditMode here
}

export const ItemsStep: React.FC<ItemsStepProps> = ({ items, setItems, isEditMode = false }) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const { validateBatch, isBatchValidating, batchError, clearBatchError } = useHSCodeBatchValidation();

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
        hsCode: '68109900',
        description: 'Optional note for user (ignored)',
        quantity: 10,
        value: 5000
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: ['hsCode', 'description', 'quantity', 'value'] });
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
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      // Extract hsCodes and values (ignore other fields)
      const rows = jsonData.map((row, index) => ({
        index,
        hsCode: String(row.hsCode || '').replace(/\D/g, ''),
        quantity: Number(row.quantity || 0),
        value: Number(row.value || 0),
      }));

      const validFormat = rows.filter(r => /^\d{8}$/.test(r.hsCode));
      const invalidFormat = rows.filter(r => !/^\d{8}$/.test(r.hsCode));

      setIsProcessingUpload(true);
      setProgressText(`Validating ${validFormat.length} HS Codes...`);
      clearBatchError();

      const result = await validateBatch(validFormat.map(r => r.hsCode));
      
      if (!result) {
        setIsProcessingUpload(false);
        setProgressText('');
        return;
      }

      // Map results by input for quick lookup
      const byInput = new Map(result.map(r => [r.input, r]));

      const itemsToAdd: Item[] = [];
      const failedCodes: string[] = [];

      for (const row of validFormat) {
        const r = byInput.get(row.hsCode);
        if (r && r.success && r.data) {
          const uomCode = r.data.unitOfMeasures?.[0]?.code || '';
          itemsToAdd.push({
            id: `${Date.now()}-${row.index}`,
            hsCode: r.data.code,
            description: r.data.description,
            unitOfMeasure: uomCode,
            quantity: row.quantity || 0,
            value: row.value || 0,
          } as Item);
        } else {
          failedCodes.push(row.hsCode);
        }
      }

      setItems(prev => [...prev, ...itemsToAdd]);

      // Build user feedback
      const invalidFormatCodes = invalidFormat.map(r => r.hsCode).filter(Boolean);
      const messages: string[] = [];
      if (itemsToAdd.length > 0) messages.push(`${itemsToAdd.length} item(s) added.`);
      if (failedCodes.length > 0) messages.push(`Invalid HS Codes (not added): ${failedCodes.join(', ')}`);
      if (invalidFormatCodes.length > 0) messages.push(`Bad format (expect 8 digits): ${invalidFormatCodes.join(', ')}`);

      if (messages.length > 0) alert(messages.join('\n'));

      setIsProcessingUpload(false);
      setProgressText('');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {isEditMode ? 'Edit Items' : 'Items Requesting Duty Waiver'}
        </h3>
        {(isBatchValidating || isProcessingUpload) && (
          <span className="text-xs text-blue-700">{progressText || 'Validating HS Codes...'}</span>
        )}
      </div>

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
            disabled={isBatchValidating || isProcessingUpload}
          />
        </div>

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
