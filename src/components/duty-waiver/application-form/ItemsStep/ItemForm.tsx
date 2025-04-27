'use client';
import React, { useState } from 'react';
import { Item } from '@/types/ItemModel';
import { unitOfMeasureOptions } from '@/utils/constants';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon } from '@/icons';
import Button from '@/components/ui/button/Button';

interface ItemFormProps {
  items: Item[];
  editingItemId: string | null;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  isEditMode?: boolean; // ✅ added
}

export const ItemForm: React.FC<ItemFormProps> = ({
  items,
  editingItemId,
  setItems,
  setEditingItemId,
  isEditMode = false, // default is false
}) => {
  const [newItem, setNewItem] = useState<Omit<Item, 'id'>>({
    hsCode: '',
    description: '',
    quantity: 0,
    unitOfMeasure: '',
    value: 0,
  });

  const currentItem = editingItemId ? items.find(item => item.id === editingItemId) : null;

  const handleSave = () => {
    if (editingItemId) {
      setEditingItemId(null);
    } else {
      setItems([...items, { ...newItem, id: Date.now().toString() }]);
      setNewItem({
        hsCode: '',
        description: '',
        quantity: 0,
        unitOfMeasure: '',
        value: 0,
      });
    }
  };

  const isFormValid = editingItemId
    ? currentItem?.hsCode && currentItem?.description && currentItem?.unitOfMeasure
    : newItem.hsCode && newItem.description && newItem.unitOfMeasure;

  return (
    <div id="item-form" className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
      <h4 className="font-medium text-blue-800 mb-3">
        {isEditMode ? 'Edit Item List' : editingItemId ? 'Edit Item' : 'Add New Item'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* HS Code */}
        <div className="md:col-span-2">
          <Label>HS Code*</Label>
          <Input
            type="text"
            value={editingItemId
              ? items.find(i => i.id === editingItemId)?.hsCode || ''
              : newItem.hsCode}
            onChange={(e) => editingItemId
              ? setItems(items.map(i => i.id === editingItemId ? { ...i, hsCode: e.target.value } : i))
              : setNewItem({ ...newItem, hsCode: e.target.value })}
            placeholder="HS Code"
            className="w-full"
            // disabled={isEditMode && !editingItemId} // ✅ Disable input if editMode but not editing a specific item
          />
        </div>

        {/* Description */}
        <div className="md:col-span-4">
          <Label>Description*</Label>
          <Input
            type="text"
            value={editingItemId
              ? items.find(i => i.id === editingItemId)?.description || ''
              : newItem.description}
            onChange={(e) => editingItemId
              ? setItems(items.map(i => i.id === editingItemId ? { ...i, description: e.target.value } : i))
              : setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Item description"
            className="w-full"
            // disabled={isEditMode && !editingItemId}
          />
        </div>

        {/* Unit of Measure */}
        <div className="md:col-span-2">
          <Label>Unit of Measure*</Label>
          <div className="relative">
            <Select
              options={unitOfMeasureOptions}
              placeholder="Select"
              value={editingItemId
                ? items.find(i => i.id === editingItemId)?.unitOfMeasure || ''
                : newItem.unitOfMeasure}
              onChange={(value) => editingItemId
                ? setItems(items.map(i => i.id === editingItemId ? { ...i, unitOfMeasure: value } : i))
                : setNewItem({ ...newItem, unitOfMeasure: value })}
              className="w-full dark:bg-dark-900"
              // disabled={isEditMode && !editingItemId}
            />
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Quantity */}
        <div className="md:col-span-2">
          <Label>Quantity*</Label>
          <Input
            type="number"
            value={editingItemId
              ? items.find(i => i.id === editingItemId)?.quantity || 0
              : newItem.quantity || ''}
            onChange={(e) => editingItemId
              ? setItems(items.map(i => i.id === editingItemId ? { ...i, quantity: parseInt(e.target.value) || 0 } : i))
              : setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
            placeholder="Qty"
            className="w-full"
            // disabled={isEditMode && !editingItemId}
          />
        </div>

        {/* Value */}
        <div className="md:col-span-2">
          <Label>Value (MWK)*</Label>
          <Input
            type="number"
            value={editingItemId
              ? items.find(i => i.id === editingItemId)?.value || 0
              : newItem.value || ''}
            onChange={(e) => editingItemId
              ? setItems(items.map(i => i.id === editingItemId ? { ...i, value: parseFloat(e.target.value) || 0 } : i))
              : setNewItem({ ...newItem, value: parseFloat(e.target.value) || 0 })}
            placeholder="Value"
            className="w-full"
            // disabled={isEditMode && !editingItemId}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        {editingItemId && (
          <Button
            onClick={() => {
              setEditingItemId(null);
              setNewItem({
                hsCode: '',
                description: '',
                quantity: 0,
                unitOfMeasure: '',
                value: 0
              });
            }}
            variant="outline"
            className="border-gray-300"
          >
            Cancel
          </Button>
        )}
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!isFormValid}
          >
            {editingItemId ? 'Update Item' : 'Add Item'}
          </Button>
      </div>
    </div>
  );
};
