"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from '../../../icons';
import DatePicker from '@/components/form/date-picker';
import TextArea from '@/components/ui-utils/input/TextArea';

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function NewApplicationForm({ className, onChange }: FileInputProps) {
  const [message, setMessage] = useState("");

  const options = [
    { value: "hospital", label: "Hospital" },
    { value: "school", label: "School" },
    { value: "tourism", label: "Tourism" },
  ];

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  return (
    <ComponentCard title="New Application Form">
      <div className="space-y-6">
        <div>
          <Label>Project Name</Label>
          <Input type="text" />
        </div>
        <div>
          <Label>Project Description</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>
        <div>
          <Label>Project Type</Label>
          <div className="relative">
            <Select
              options={options}
              placeholder="Select an option"
              onChange={handleSelectChange}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <Label>Project Location</Label>
          <Input type="text" placeholder="project location..." />
        </div>

        <div>
          <Label>Reason for  Applying</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>
        <div>
          <Label>Project Value</Label>
          <Input type="text" placeholder="project value..." />
        </div>

        <div>
          <Label>Project Duration</Label>
          <Input type="text" placeholder="project duration..." />
        </div>

        <div>
          <DatePicker
            id="date-picker"
            label="Start Date"
            placeholder="Select start date"
            onChange={(dates, currentDateString) => {
              // Handle your logic
              console.log({ dates, currentDateString });
            }}
          />
        </div>

        <div>
          <DatePicker
            id="date-picker"
            label="End Date"
            placeholder="Select end date"
            onChange={(dates, currentDateString) => {
              // Handle your logic
              console.log({ dates, currentDateString });
            }}
          />
        </div>

        <div>
          <Label>Upload Letter of Approval</Label>
          <input
          type="file"
          className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${className}`}
          onChange={onChange}
        />
        </div>

        <div>
          <Label>Upload BOQ</Label>
          <input
          type="file"
          className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${className}`}
          onChange={onChange}
        />
        </div>
  

      </div>
    </ComponentCard>
  );
}
