'use client';
import React, { useState, useEffect } from 'react';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { projectTypeOptions, districtOptions } from '@/utils/constants';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import { ChevronDownIcon } from '@/icons';
import DatePicker from '@/components/ui-utils/date-picker';
import TextArea from '@/components/ui-utils/input/TextArea';
import useApplication from '@/hooks/useApplications';

interface ProjectDetailsStepProps {
  details: ProjectDetails;
  onChange: (updatedDetails: Partial<ProjectDetails>) => void;
  isEditMode?: boolean;
  errors?: Partial<Record<keyof ProjectDetails, string>>;
}

export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({
  details,
  onChange,
  isEditMode = false,
  errors = {}
}) => {
  const [localDetails, setLocalDetails] = useState<ProjectDetails>(details);

  useEffect(() => {
    setLocalDetails(details);
  }, [details]);

  const handleInputChange = (field: keyof ProjectDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedDetails = { ...localDetails, [field]: e.target.value };
    setLocalDetails(updatedDetails);
    onChange({ [field]: e.target.value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', dates: Date[]) => {
    const selectedDate = dates[0] || null;
    const updatedDetails = { ...localDetails, [field]: selectedDate };
    setLocalDetails(updatedDetails);
    onChange({ [field]: selectedDate });
  };

  const handleSelectChange = (field: keyof ProjectDetails) => (value: string) => {
    const updatedDetails = { ...localDetails, [field]: value };
    setLocalDetails(updatedDetails);
    onChange({ [field]: value });
  };

  const handleTextAreaChange = (field: keyof ProjectDetails) => (value: string) => {
    const updatedDetails = { ...localDetails, [field]: value };
    setLocalDetails(updatedDetails);
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        {isEditMode ? 'Edit Project Information' : 'Project Information'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project Name*</Label>
          <Input
            type="text"
            value={localDetails.projectName}
            onChange={handleInputChange('projectName')}
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        <div>
          <Label>Project Type*</Label>
          <div className="relative">
            <Select
              options={projectTypeOptions}
              value={localDetails.projectType}
              placeholder="Select project type"
              onChange={handleSelectChange('projectType')}
              className="w-full dark:bg-dark-900"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {errors.projectType && (
            <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Project Description*</Label>
        <TextArea
          value={localDetails.projectDescription}
          onChange={handleTextAreaChange('projectDescription')}
          rows={4}
          placeholder="Describe the project in detail..."
        />
        {errors.projectDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.projectDescription}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project District*</Label>
          <Select
            options={districtOptions}
            value={localDetails.projectDistrict}
            placeholder="Select district"
            onChange={handleSelectChange('projectDistrict')}
            className="w-full"
          />
          {errors.projectDistrict && (
            <p className="mt-1 text-sm text-red-600">{errors.projectDistrict}</p>
          )}
        </div>

        <div>
          <Label>Physical Address*</Label>
          <Input
            type="text"
            value={localDetails.projectPhysicalAddress}
            onChange={handleInputChange('projectPhysicalAddress')}
            placeholder="Enter physical address (street, plot number, etc.)"
          />
          {errors.projectPhysicalAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.projectPhysicalAddress}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Project Value (MWK)*</Label>
          <div className="relative">
            <Input
              type="number"
              value={localDetails.projectValue}
              onChange={handleInputChange('projectValue')}
              placeholder="Enter total project value"
              min="0"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              MWK
            </span>
          </div>
          {errors.projectValue && (
            <p className="mt-1 text-sm text-red-600">{errors.projectValue}</p>
          )}
        </div>

        <div>
          <Label>Project Duration*</Label>
          <Input
            type="text"
            value={localDetails.projectDuration}
            onChange={handleInputChange('projectDuration')}
            placeholder="e.g. 12 months, 2 years, etc."
          />
          {errors.projectDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.projectDuration}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DatePicker
            id="start-date"
            label="Start Date*"
            placeholder="Select start date"
            defaultDate={localDetails.startDate ?? undefined}
            onChange={(dates) => handleDateChange('startDate', dates)}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <DatePicker
            id="end-date"
            label="End Date*"
            placeholder="Select end date"
            defaultDate={localDetails.endDate ?? undefined}
            onChange={(dates) => handleDateChange('endDate', dates)}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div>
        <Label>Reason for Applying*</Label>
        <TextArea
          value={localDetails.reasonForApplying}
          onChange={handleTextAreaChange('reasonForApplying')}
          rows={4}
          placeholder="Explain why you're applying for duty waiver..."
        />
        {errors.reasonForApplying && (
          <p className="mt-1 text-sm text-red-600">{errors.reasonForApplying}</p>
        )}
      </div>
    </div>
  );
};
