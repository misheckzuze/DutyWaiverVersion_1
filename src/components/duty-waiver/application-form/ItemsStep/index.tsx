"use client";
import React, { useState } from 'react';
import { Item } from '@/types/ItemModel';
import { ItemForm } from './ItemForm';
import ItemTable from './ItemTable';

interface ItemsStepProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

export const ItemsStep: React.FC<ItemsStepProps> = ({ items, setItems }) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Items Requesting Duty Waiver</h3>
      </div>

      <ItemForm 
        items={items}
        editingItemId={editingItemId}
        setItems={setItems}
        setEditingItemId={setEditingItemId}
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