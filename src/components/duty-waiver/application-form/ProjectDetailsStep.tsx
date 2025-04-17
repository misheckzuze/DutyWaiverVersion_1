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
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [reasonForApplying, setReasonForApplying] = useState("");
  const [projectValue, setProjectValue] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
          />
        </div>

        <div>
          <DatePicker
            id="end-date"
            label="End Date*"
            placeholder="Select end date"
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
  );
};