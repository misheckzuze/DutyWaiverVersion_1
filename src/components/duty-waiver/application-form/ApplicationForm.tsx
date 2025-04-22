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
import useApplication from '@/hooks/useApplications';
import { ApplicationProps } from '@/types/Application';

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: "",
    projectDescription: "",
    projectType: "",
    projectDistrict: "",
    projectPhysicalAddress: "",
    reasonForApplying: "",
    projectValue: "",
    projectDuration: "",
    startDate: null,
    endDate: null
  });

  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const { 
    application, 
    error, 
    isLoading, 
    createDraft 
} = useApplication();

 // Store form data in state
 const [formData, setFormData] = useState<ApplicationProps>({
  userId: 0, // Initialize with default values
  companyId: 0,
  submissionDate: new Date().toISOString(),
  applicationTypeId: 0,
  status: "Draft",
  projectName: "",
  projectDescription: "",
  projectDistrict: "",
  projectPhysicalAddress: "",
  reasonForApplying: "",
  projectValue: 0,
  currency: "MWK",
  startDate: "",
  endDate: "",
  attachments: [],
  items: []
});

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProjectDetailsChange = (updatedDetails: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({ ...prev, ...updatedDetails }));
  };

    // Update form data when inputs change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: value
      }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
  
    const fullFormData: ApplicationProps = {
      ...formData, // Keep static values like userId, companyId
      projectName: projectDetails.projectName,
      projectDescription: projectDetails.projectDescription,
      projectDistrict: projectDetails.projectDistrict,
      projectPhysicalAddress: projectDetails.projectPhysicalAddress,
      reasonForApplying: projectDetails.reasonForApplying,
      projectValue: parseFloat(projectDetails.projectValue),
      currency: "MWK",
      startDate: projectDetails.startDate?.toISOString().split('T')[0] || "",
      endDate: projectDetails.endDate?.toISOString().split('T')[0] || "",
      attachments: attachments.map(att => ({
        documentType: att.type,
        filePath: att.file?.name || "" // Adjust if uploading files separately
      })),
      items: items.map(item => ({
        description: item.description,
        hscode: item.hsCode,
        quantity: item.quantity,
        value: item.value,
        currency: "MWK",
        dutyAmount: 200, // Example value, replace with actual calculation
        uomId: 1
      })),
      submissionDate: new Date().toISOString(),
      status: "Draft",
      userId: 7,
      companyId: 2,
      applicationTypeId: 1
    };
  
    try {
      await createDraft(fullFormData);
      alert("Draft saved successfully!");
      // Optionally: reset form or redirect
    } catch (error) {
      console.error("Error saving draft:", error);
    }
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
            <div>
              {/* Your form implementation */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {isLoading ? 'Saving...' : 'Save Draft'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}