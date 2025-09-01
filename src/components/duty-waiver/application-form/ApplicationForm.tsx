"use client";
import React, { useState, useEffect } from 'react';
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
import { useRouter } from "next/navigation";

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
    // projectDuration: "",
    projectDurationYears: "",
    projectDurationMonths: "",
    startDate: null,
    endDate: null
  });

  const router = useRouter();

  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [userData, setUserData] = useState<{ userId: number; tin: string }>({ 
    userId: 0, 
    tin: "" 
  });

  const { 
    application, 
    error, 
    isLoading, 
    createDraft 
  } = useApplication();

  // Load user data from localStorage on component mount
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    const userId = authData?.id || 0;
    const tin = authData?.companyTIN || "";
    
    console.log("Loaded authData from localStorage:", authData); // Debug log
    console.log("Extracted userId:", userId, "tin:", tin); // Debug log
    
    setUserData({
      userId,
      tin
    });
  }, []);

  // Store form data in state
  const [formData, setFormData] = useState<ApplicationProps>({
    userId: userData.userId,
    tin: userData.tin,
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

  // Update formData when userData changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      userId: userData.userId,
      tin: userData.tin
    }));
    console.log("Updated formData with user details:", formData); // Debug log
  }, [userData]);

  const handleNextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProjectDetailsChange = (updatedDetails: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({ ...prev, ...updatedDetails }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
  
    console.log("Submitting form with userData:", userData); // Debug log
    
    if (!userData.userId || !userData.tin) {
      console.error("Missing user data - userId:", userData.userId, "tin:", userData.tin);
      alert("User information is missing. Please ensure you're logged in.");
      return;
    }

    const fullFormData: ApplicationProps = {
      ...formData,
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
        type: att.type,
        file: typeof att.file === 'string' ? att.file : (att.file?.name || "")
      })),
      items: items.map(item => ({
        description: item.description,
        hscode: item.hsCode,
        quantity: item.quantity,
        value: item.value,
        currency: "MWK",
        dutyAmount: 200,
        uomId: (item.unitOfMeasure ?? (item as any).uomId) as any
      })),
      submissionDate: new Date().toISOString(),
      status: "Under Review",
      userId: userData.userId,
      tin: userData.tin,
      applicationTypeId: Number(projectDetails.projectType) || 0
    };

    console.log("Final form data being submitted:", fullFormData); // Debug log
  
    try {
      await createDraft(fullFormData);
      router.push("/my-applications");
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const handleDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
  
    console.log("Submitting form with userData:", userData); // Debug log
    
    if (!userData.userId || !userData.tin) {
      console.error("Missing user data - userId:", userData.userId, "tin:", userData.tin);
      alert("User information is missing. Please ensure you're logged in.");
      return;
    }

    const fullFormData: ApplicationProps = {
      ...formData,
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
        type: att.type,
        file: typeof att.file === 'string' ? att.file : (att.file?.name || "")
      })),
      items: items.map(item => ({
        description: item.description,
        hscode: item.hsCode,
        quantity: item.quantity,
        value: item.value,
        currency: "MWK",
        dutyAmount: 200,
        uomId: (item.unitOfMeasure ?? (item as any).uomId) as any
      })),
      submissionDate: new Date().toISOString(),
      status: "Draft",
      userId: userData.userId,
      tin: userData.tin,
      applicationTypeId: Number(projectDetails.projectType) || 0
    };

    console.log("Final form data being submitted:", fullFormData); // Debug log
  
    try {
      await createDraft(fullFormData);
      router.push("/my-applications");
      alert("Draft saved successfully!");
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
              <button
                onClick={handleDraft}
                disabled={isLoading}
                className="ml-auto mr-8 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isLoading ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {isLoading ? 'Submitting...' : 'Submit Changes'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}