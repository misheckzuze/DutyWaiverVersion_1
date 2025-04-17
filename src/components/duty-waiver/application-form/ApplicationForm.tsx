"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import { ProgressSteps } from './ProgressSteps';
import { ProjectDetailsStep } from './ProjectDetailsStep';
import { ItemsStep } from './ItemsStep';
import { AttachmentsStep } from './AttachmentsStep';
import { ReviewStep } from './ReviewStep';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { Item } from '@/types/ItemModel';
import { Attachment } from '@/types/AttachmentModel';

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: "",
    projectDescription: "",
    projectType: "",
    projectLocation: "",
    reasonForApplying: "",
    projectValue: "",
    projectDuration: "",
    startDate: null,
    endDate: null
  });

  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProjectDetailsChange = (updatedDetails: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({ ...prev, ...updatedDetails }));
  };

  return (
    <div className="mx-auto">
      <ComponentCard title="Duty Waiver Application Form">
        <ProgressSteps currentStep={currentStep} totalSteps={4} />

        {currentStep === 1 && (
          <ProjectDetailsStep 
            details={projectDetails} 
            onChange={handleProjectDetailsChange} 
          />
        )}

        {currentStep === 2 && (
          <ItemsStep 
            items={items} 
            setItems={setItems} 
          />
        )}

        {currentStep === 3 && (
          <AttachmentsStep 
            attachments={attachments} 
            setAttachments={setAttachments} 
          />
        )}

        {currentStep === 4 && (
          <ReviewStep 
            projectDetails={projectDetails} 
            items={items} 
            attachments={attachments} 
          />
        )}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Back
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNextStep}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => alert('Application submitted!')}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Application
            </button>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}