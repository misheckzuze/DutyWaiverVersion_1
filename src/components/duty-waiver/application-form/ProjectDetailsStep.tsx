"use client";
import React, { useState } from 'react';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { projectTypeOptions } from '@/utils/constants';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon } from '../../../icons';
import DatePicker from '@/components/ui-utils/date-picker';
import TextArea from '@/components/ui-utils/input/TextArea';

interface ProjectDetailsStepProps {
  details: ProjectDetails;
  onChange: (updatedDetails: Partial<ProjectDetails>) => void;
}

export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ details, onChange }) => {
  const handleInputChange = (field: keyof ProjectDetails, value: string) => {
    onChange({ [field]: value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', dates: Date[]) => {
    const selectedDate = dates[0] || null;
    onChange({ [field]: selectedDate });
  };


  const handleSelectChange = (value: string) => {
    onChange({ projectType: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Project Information</h3>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project Name*</Label>
          <Input
            type="text"
            value={details.projectName}
            onChange={(e) => handleInputChange('projectName', e.target.value)}
            placeholder="Enter project name"
          />
        </div>

        <div>
          <Label>Project Type*</Label>
          <div className="relative">
            <Select
              options={projectTypeOptions}
              placeholder="Select project type"
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
          value={details.projectDescription}
          onChange={(value) => handleInputChange('projectDescription', value)}
          rows={4}
          placeholder="Describe the project in detail..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project District*</Label>
          <Select
            options={[
              { value: "lilongwe", label: "Lilongwe" },
              { value: "blantyre", label: "Blantyre" },
              { value: "mzuzu", label: "Mzuzu" },
              { value: "zomba", label: "Zomba" },
              // Add other districts as needed
            ]}
            placeholder="Select district"
            onChange={(value) => handleInputChange('projectDistrict', value)}
            className="w-full"
            defaultValue={details.projectDistrict}
          />
        </div>
        <div>
          <Label>Physical Address*</Label>
          <Input
            type="text"
            value={details.projectPhysicalAddress}
            onChange={(e) => handleInputChange('projectPhysicalAddress', e.target.value)}
            placeholder="Enter physical address (street, plot number, etc.)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project Value (MWK)*</Label>
          <Input
            type="number"
            value={details.projectValue}
            onChange={(e) => handleInputChange('projectValue', e.target.value)}
            placeholder="Enter total project value"
          />
        </div>

        <div>
          <Label>Project Duration*</Label>
          <Input
            type="text"
            value={details.projectDuration}
            onChange={(e) => handleInputChange('projectDuration', e.target.value)}
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
            defaultDate={details.startDate ?? undefined}
            onChange={(dates) => handleDateChange('startDate', dates)}
          />
        </div>

        <div>
          <DatePicker
            id="end-date"
            label="End Date*"
            placeholder="Select end date"
            defaultDate={details.endDate ?? undefined}
            onChange={(dates) => handleDateChange('endDate', dates)}
          />
        </div>
      </div>

      <div>
        <Label>Reason for Applying*</Label>
        <TextArea
          value={details.reasonForApplying}
          onChange={(value) => handleInputChange('reasonForApplying', value)}
          rows={4}
          placeholder="Explain why you're applying for duty waiver..."
        />
      </div>
    </div>
  );
};