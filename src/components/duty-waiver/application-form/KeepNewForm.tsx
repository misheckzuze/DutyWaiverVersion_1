"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
// import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon, PlusIcon, TrashIcon, DocumentIcon } from '../../../icons';
import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon, PlusIcon } from '../../../icons';
import DatePicker from '@/components/form/date-picker';
import TextArea from '@/components/ui-utils/input/TextArea';
// import Button from '@/components/ui-utils/Button';
import Button from '@/components/ui/button/Button';
// import Modal from '@/components/ui-utils/Modal';
import Modals from '@/app/(admin)/(ui-elements)/modals/page';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import ItemTable from './KeepItemTable';
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@/components/ui-utils/Table';

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Item {
  id: string;
  hsCode: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  value: number;
}

interface Attachment {
  id: string;
  type: string;
  file: File | null;
}

export default function NewApplicationForm({ className, onChange }: FileInputProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [reasonForApplying, setReasonForApplying] = useState("");
  const [projectValue, setProjectValue] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Items state
  const [items, setItems] = useState<Item[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item>({
    id: '',
    hsCode: '',
    description: '',
    quantity: 0,
    unitOfMeasure: '',
    value: 0
  });

  // Attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachmentType, setNewAttachmentType] = useState("");
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);

  const projectTypeOptions = [
    { value: "hospital", label: "Hospital" },
    { value: "school", label: "School" },
    { value: "tourism", label: "Tourism" },
    { value: "hotel", label: "Hotel" },
    { value: "university", label: "University" },
    { value: "other", label: "Other" },
  ];

  const unitOfMeasureOptions = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "l", label: "Liters (l)" },
    { value: "m", label: "Meters (m)" },
    { value: "unit", label: "Unit" },
    { value: "box", label: "Box" },
    { value: "set", label: "Set" },
  ];

  const attachmentTypeOptions = [
    { value: "approval_letter", label: "Letter of Approval" },
    { value: "boq", label: "Bill of Quantities (BOQ)" },
    { value: "designs", label: "Designs/Plans" },
    { value: "permit", label: "Building Permit" },
    { value: "tax_clearance", label: "Tax Clearance Certificate" },
    { value: "other", label: "Other" },
  ];

  const handleSelectChange = (value: string) => {
    setProjectType(value);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openItemModal = () => {
    setCurrentItem({
      id: '',
      hsCode: '',
      description: '',
      quantity: 0,
      unitOfMeasure: '',
      value: 0
    });
    setIsItemModalOpen(true);
  };

  const editItem = (item: Item) => {
    setCurrentItem(item);
    setIsItemModalOpen(true);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const saveItem = () => {
    if (currentItem.id) {
      // Update existing item
      setItems(items.map(item => item.id === currentItem.id ? currentItem : item));
    } else {
      // Add new item
      setItems([...items, { ...currentItem, id: Date.now().toString() }]);
    }
    setIsItemModalOpen(false);
  };

  const addAttachment = () => {
    setIsAddingAttachment(true);
    setNewAttachmentType("");
  };

  const handleAttachmentFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files ? e.target.files[0] : null;
    setAttachments(attachments.map(attachment =>
      attachment.id === id ? { ...attachment, file } : attachment
    ));
  };

  const saveAttachment = () => {
    if (newAttachmentType) {
      setAttachments([
        ...attachments,
        {
          id: Date.now().toString(),
          type: newAttachmentType,
          file: null
        }
      ]);
      setIsAddingAttachment(false);
      setNewAttachmentType("");
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  const getAttachmentTypeLabel = (value: string) => {
    const option = attachmentTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const calculateTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.value || 0), 0);
  };

  return (
    <div className="mx-auto">
      <ComponentCard title="Duty Waiver Application Form">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {step}
                </div>
                <span className="text-xs mt-1">
                  {step === 1 && 'Project Details'}
                  {step === 2 && 'Items'}
                  {step === 3 && 'Attachments'}
                  {step === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Project Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Project Name*</Label>
                <Input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <Label>Project Type*</Label>
                <div className="relative">
                  <Select
                    options={projectTypeOptions}
                    placeholder="Select project type"
                    // value={projectType}
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Project Description*</Label>
              <TextArea
                value={projectDescription}
                onChange={setProjectDescription}
                rows={4}
                placeholder="Describe the project in detail..."
              />
            </div>

            <div>
              <Label>Project Location*</Label>
              <Input
                type="text"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="Enter project location (address, district, etc.)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Project Value (MWK)*</Label>
                <Input
                  type="number"
                  value={projectValue}
                  onChange={(e) => setProjectValue(e.target.value)}
                  placeholder="Enter total project value"
                />
              </div>

              <div>
                <Label>Project Duration*</Label>
                <Input
                  type="text"
                  value={projectDuration}
                  onChange={(e) => setProjectDuration(e.target.value)}
                  placeholder="e.g. 12 months, 2 years, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DatePicker
                  id="start-date"
                  label="Start Date*"
                  placeholder="Select start date"
                // value={startDate}
                // onChange={(date) => setStartDate(date)}
                />
              </div>

              <div>
                <DatePicker
                  id="end-date"
                  label="End Date*"
                  placeholder="Select end date"
                // value={endDate}
                // onChange={(date) => setEndDate(date)}
                />
              </div>
            </div>

            <div>
              <Label>Reason for Applying*</Label>
              <TextArea
                value={reasonForApplying}
                onChange={setReasonForApplying}
                rows={4}
                placeholder="Explain why you're applying for duty waiver..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Items Requesting Duty Waiver</h3>
              <Button
                onClick={openItemModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {items.length > 0 ? (

              <ItemTable
                items={items}
                editItem={editItem}
                deleteItem={deleteItem}
                calculateTotalValue={calculateTotalValue}
              />
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                {/* Tempoary Icon */}
                <EyeCloseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items added</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Click the "Add Item" button to start adding items for duty waiver.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={openItemModal}
                    className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Attachments */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Required Documents</h3>
              <Button
                onClick={addAttachment}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="w-4 h-4" />
                Add Document
              </Button>
            </div>

            <div className="space-y-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{getAttachmentTypeLabel(attachment.type)}</h4>
                      {attachment.file && (
                        <p className="text-sm text-gray-500">{attachment.file.name}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id={`file-upload-${attachment.id}`}
                        className="hidden"
                        onChange={(e) => handleAttachmentFileChange(e, attachment.id)}
                      />
                      <label
                        htmlFor={`file-upload-${attachment.id}`}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
                      >
                        {attachment.file ? 'Change' : 'Upload'}
                      </label>
                      <Button
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-800"
                      // variant="ghost"
                      >
                        {/* Tempory ICon */}
                        <EyeCloseIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {isAddingAttachment && (
                <div className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label>Document Type</Label>
                      <div className="relative">
                        <Select
                          options={attachmentTypeOptions}
                          placeholder="Select document type"
                          // value={newAttachmentType}
                          onChange={setNewAttachmentType}
                          className="dark:bg-dark-900"
                        />
                        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                          <ChevronDownIcon />
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        onClick={saveAttachment}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!newAttachmentType}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsAddingAttachment(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {attachments.length === 0 && !isAddingAttachment && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  {/* Temporary Icon */}
                  <EyeCloseIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents added</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Click the "Add Document" button to upload required documents.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Review Your Application</h3>

            <div className="border rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Project Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <p>{projectName || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Type</Label>
                  <p>{projectType ? projectTypeOptions.find(opt => opt.value === projectType)?.label : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Location</Label>
                  <p>{projectLocation || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Value</Label>
                  <p>{projectValue ? `${projectValue} MWK` : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Duration</Label>
                  <p>{projectDuration || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p>{startDate ? startDate.toLocaleDateString() : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p>{endDate ? endDate.toLocaleDateString() : <span className="text-gray-400">Not provided</span>}</p>
                </div>
              </div>
              <div className="mt-4">
                <Label>Project Description</Label>
                <p className="whitespace-pre-line">{projectDescription || <span className="text-gray-400">Not provided</span>}</p>
              </div>
              <div className="mt-4">
                <Label>Reason for Applying</Label>
                <p className="whitespace-pre-line">{reasonForApplying || <span className="text-gray-400">Not provided</span>}</p>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Items ({items.length})</h4>
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HS Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (MWK)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{item.hsCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.unitOfMeasure}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.value.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-6 py-3 text-right font-medium">Total Value:</td>
                        <td className="px-6 py-3 font-medium">{calculateTotalValue().toLocaleString()} MWK</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No items added</p>
              )}
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Attachments ({attachments.length})</h4>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center">
                        {/* Temporary Icon */}
                        <EyeCloseIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{getAttachmentTypeLabel(attachment.type)}</span>
                        {attachment.file && (
                          <span className="text-sm text-gray-500 ml-2">({attachment.file.name})</span>
                        )}
                      </div>
                      {!attachment.file && (
                        <span className="text-sm text-red-500">Missing file</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No attachments added</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              className="border-gray-300"
            >
              Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              onClick={handleNextStep}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={() => alert('Application submitted!')}
              className="ml-auto bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Application
            </Button>
          )}
        </div>
      </ComponentCard>

      {/* Add/Edit Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        className="max-w-[584px] p-5 lg:p-10"
      // title={currentItem.id ? "Edit Item" : "Add New Item"}
      >
        <div className="space-y-4">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Add Item
          </h4>
          <div>
            <Label>HS Code*</Label>
            <Input
              type="text"
              value={currentItem.hsCode}
              onChange={(e) => setCurrentItem({ ...currentItem, hsCode: e.target.value })}
              placeholder="Enter HS Code"
            />
          </div>

          <div>
            <Label>Description*</Label>
            <TextArea
              value={currentItem.description}
              onChange={(value) => setCurrentItem({ ...currentItem, description: value })}
              rows={3}
              placeholder="Item description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity*</Label>
              <Input
                type="number"
                value={currentItem.quantity || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label>Unit of Measure*</Label>
              <div className="relative">
                <Select
                  options={unitOfMeasureOptions}
                  placeholder="Select unit"
                  // value={currentItem.unitOfMeasure}
                  onChange={(value) => setCurrentItem({ ...currentItem, unitOfMeasure: value })}
                  className="dark:bg-dark-900"
                />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>Value (MWK)*</Label>
            <Input
              type="number"
              value={currentItem.value || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, value: parseFloat(e.target.value) || 0 })}
              placeholder="Enter value in MWK"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setIsItemModalOpen(false)}
              variant="outline"
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={saveItem}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!currentItem.hsCode || !currentItem.description || !currentItem.unitOfMeasure}
            >
              Save Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}