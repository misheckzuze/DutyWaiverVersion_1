'use client';
import React, { useEffect, useState } from 'react';
import { Item } from '@/types/ItemModel';
// import { unitOfMeasureOptions } from '@/utils/constants';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import useApplication from '@/hooks/useApplications';
import { useHSCodeValidation } from '@/hooks/useHSCodeValidation';

interface ItemFormProps {
  items: Item[];
  editingItemId: string | null;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  isEditMode?: boolean;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  items,
  editingItemId,
  setItems,
  setEditingItemId,
  isEditMode = false,
}) => {
  const [newItem, setNewItem] = useState<Omit<Item, 'id'>>({
    hsCode: '',
    description: '',
    quantity: 0,
    unitOfMeasure: '',
    value: 0,
  });
  const [unitOfMeasureOptions, setUnitOfMeasureOptions] = useState<{ value: string, label: string }[]>([]);
  const [isHSCodeValidated, setIsHSCodeValidated] = useState(false);
  const [hsCodeValidationError, setHsCodeValidationError] = useState<string | null>(null);
  
  const { getUnitOfMeasure } = useApplication();
  const { validateHSCode, isValidating, validationError, clearValidationError } = useHSCodeValidation();
  const currentItem = editingItemId ? items.find(item => item.id === editingItemId) : null;


  useEffect(() => {

      const fetchUnitOfMeasures = async () => {
        try {
          const unitOfMeasures = await getUnitOfMeasure();
          const options = unitOfMeasures.map((type: any) => ({
            value: type.code,
            label: type.code
          }));
          setUnitOfMeasureOptions(options);
        } catch (error) {
          console.error('Failed to fetch project types:', error);
        }
      };
  
      fetchUnitOfMeasures();
    }, []);

  // Helper function to format number with commas
  const formatNumberWithCommas = (num: string | number): string => {
    const numStr = num.toString().replace(/\D/g, '');
    if (!numStr) return '';
    return parseInt(numStr).toLocaleString();
  };

  // Helper function to parse formatted number back to raw number
  const parseFormattedNumber = (formattedValue: string): number => {
    return parseInt(formattedValue.replace(/,/g, '')) || 0;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const rawValue = parseFormattedNumber(e.target.value);
    if (isEditing) {
      setItems(items.map(i => 
        i.id === editingItemId ? { ...i, value: rawValue } : i
      ));
    } else {
      setNewItem({ ...newItem, value: rawValue });
    }
  };

  const handleHSCodeChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    if (isEditing) {
      setItems(items.map(i => 
        i.id === editingItemId ? { ...i, hsCode: value } : i
      ));
    } else {
      setNewItem({ ...newItem, hsCode: value });
    }
    
    // Clear validation state when HS Code changes
    setIsHSCodeValidated(false);
    setHsCodeValidationError(null);
    clearValidationError();
  };

  const handleValidateHSCode = async () => {
    const currentHsCode = editingItemId 
      ? items.find(i => i.id === editingItemId)?.hsCode || ''
      : newItem.hsCode;

    if (!currentHsCode || currentHsCode.length !== 8) {
      setHsCodeValidationError('HS Code must be exactly 8 digits');
      return;
    }

    const result = await validateHSCode(currentHsCode);
    
    if (result) {
      setIsHSCodeValidated(true);
      setHsCodeValidationError(null);
      
      // Auto-populate description and unit of measure
      if (editingItemId) {
        setItems(items.map(i => 
          i.id === editingItemId 
            ? { 
                ...i, 
                description: result.description, 
                unitOfMeasure: result.unitOfMeasure 
              } 
            : i
        ));
      } else {
        setNewItem({ 
          ...newItem, 
          description: result.description, 
          unitOfMeasure: result.unitOfMeasure 
        });
      }
    } else {
      setHsCodeValidationError(validationError || 'HS Code validation failed');
    }
  };

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
    // Reset validation state
    setIsHSCodeValidated(false);
    setHsCodeValidationError(null);
    clearValidationError();
  };

  const isFormValid = editingItemId
    ? currentItem?.hsCode && currentItem?.description && currentItem?.unitOfMeasure && isHSCodeValidated
    : newItem.hsCode && newItem.description && newItem.unitOfMeasure && isHSCodeValidated;

  return (
    <div id="item-form" className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-800">
          {isEditMode ? 'Edit Item List' : editingItemId ? 'Edit Item' : 'Add New Item'}
        </h4>
        <Button
          type="button"
          onClick={handleValidateHSCode}
          disabled={
            isValidating || 
            (editingItemId 
              ? !items.find(i => i.id === editingItemId)?.hsCode || (items.find(i => i.id === editingItemId)?.hsCode || '').length !== 8
              : !newItem.hsCode || newItem.hsCode.length !== 8
            ) || 
            isHSCodeValidated
          }
          className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          size="sm"
        >
          {isValidating ? 'Verifying...' : isHSCodeValidated ? 'Verified ✓' : 'Verify HS Code'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
  {/* HS Code */}
  <div className="md:col-span-2">
    <Label>HS Code*</Label>
    <div>
      <Input
        type="text"
        value={editingItemId
          ? items.find(i => i.id === editingItemId)?.hsCode || ''
          : newItem.hsCode}
        onChange={(e) => {
          // Limit to 8 characters
          if (e.target.value.length <= 8) {
            handleHSCodeChange(e, !!editingItemId);
          }
        }}
        placeholder="HS Code"
        className="w-full"
      />
    </div>
    {(hsCodeValidationError || validationError) && (
      <p className="text-red-500 text-xs mt-1">
        {hsCodeValidationError || validationError}
      </p>
    )}
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
            disabled={!isHSCodeValidated}
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
              disabled={!isHSCodeValidated}
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
          />
        </div>

        {/* Value */}
        <div className="md:col-span-2">
          <Label>Value (MWK)*</Label>
          <Input
            type="text" // Changed from number to text to allow commas
            value={editingItemId
              ? formatNumberWithCommas(items.find(i => i.id === editingItemId)?.value || 0)
              : formatNumberWithCommas(newItem.value)}
            onChange={(e) => handleValueChange(e, !!editingItemId)}
            placeholder="Value"
            className="w-full"
            formatNumber={true} // Enable comma formatting
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
              // Reset validation state
              setIsHSCodeValidated(false);
              setHsCodeValidationError(null);
              clearValidationError();
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