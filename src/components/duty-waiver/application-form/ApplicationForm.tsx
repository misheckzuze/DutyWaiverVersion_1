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
import * as Yup from "yup";

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
    projectDurationYears: "",
    projectDurationMonths: "",
    startDate: null,
    endDate: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});


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
  // useEffect(() => {
  //   setFormData(prev => ({
  //     ...prev,
  //     userId: userData.userId,
  //     tin: userData.tin
  //   }));
  //   console.log("Updated formData with user details:", formData); // Debug log
  // }, [userData]);
    useEffect(() => {
  setFormData(prev => {
    if (prev.userId === userData.userId && prev.tin === userData.tin) {
      return prev;
    }
    return {
      ...prev,
      userId: userData.userId,
      tin: userData.tin
    };
  });

  console.log("User data applied to form:", userData);
}, [userData]);


  const handleNextStep = async () => {
  try {
    if (currentStep === 1) {
      // Validate Project Details step
      await projectDetailsSchema.validate(projectDetails, { abortEarly: false });
    }

    // Step 2: Items validation
    if (currentStep === 2) {
      if (items.length === 0) {
        setErrors({ items: "Please add at least one item." });
        return;
      }
    }

    // Step 3: Attachments validation
    if (currentStep === 3) {
      if (attachments.length === 0) {
        setErrors({ attachments: "Please upload at least one attachment." });
        return;
      }
    }

    // Clear errors and move to next step
    setErrors({});
    setCurrentStep(prev => prev + 1);
  } catch (validationError: any) {
    // Collect Yup errors into an object
    const newErrors: Record<string, string> = {};
    validationError.inner?.forEach((err: any) => {
      if (err.path) newErrors[err.path] = err.message;
    });
    setErrors(newErrors);
  }
};


//validation
const projectDetailsSchema = Yup.object().shape({
  projectName: Yup.string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .matches(/^[a-zA-Z0-9\s\-_]+$/, "Project name contains invalid characters")
    .required("Project name is required"),
    
  projectDescription: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .required("Project description is required"),
    
  projectType: Yup.string()
    .oneOf(['1', '2', '3'], "Please select a valid project type")
    .required("Project type is required"),
    
  projectDistrict: Yup.string()
    .required("Project district is required"),
    
  projectPhysicalAddress: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .required("Physical address is required"),
    
  reasonForApplying: Yup.string()
    .min(20, "Please provide a detailed reason (minimum 20 characters)")
    .required("Reason for applying is required"),
    
  projectValue: Yup.number()
    .typeError("Project value must be a valid number")
    .positive("Project value must be greater than 0")
    .min(1000, "Minimum project value is 1,000 MWK")
    .max(1000000000, "Maximum project value is 1,000,000,000 MWK")
    .required("Project value is required"),
    
  startDate: Yup.date()
    .nullable()
    .min(new Date(), "Start date cannot be in the past")
    .required("Start date is required"),
    
  endDate: Yup.date()
    .nullable()
    .min(Yup.ref("startDate"), "End date must be after start date")
    .test('duration', 'Project duration cannot exceed 5 years', function(value) {
      const startDate = this.parent.startDate;
      if (!startDate || !value) return true;
      const diffYears = (value.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return diffYears <= 5;
    })
    .required("End date is required"),
});


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

  console.log("Submitting form with userData:", userData);

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
    startDate: projectDetails.startDate?.toISOString().split("T")[0] || "",
    endDate: projectDetails.endDate?.toISOString().split("T")[0] || "",
    attachments: attachments.map(att => ({
      type: att.type,
      file: typeof att.file === "string" ? att.file : (att.file?.name || "")
    })),
    items: items.map(item => ({
      description: item.description,
      hscode: item.hsCode,
      quantity: item.quantity,
      value: item.value,
      currency: "MWK",
      dutyAmount: 200,
      uomId: 1
    })),
    submissionDate: new Date().toISOString(),
    status: "Under Review", 
    userId: userData.userId,
    tin: userData.tin,
    applicationTypeId: Number(projectDetails.projectType) || 0
  };

  console.log("Final form data being submitted (Submit):", fullFormData);

  try {
    await createDraft(fullFormData); // if backend uses same endpoint
    router.push("/my-applications");
    alert("Application submitted successfully!");
  } catch (error: any) {
    console.error("Error submitting application:", error);

    if (error.response) {
      console.error("Server responded with:", error.response.data);
      alert(`Submission failed: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error("No response received:", error.request);
      alert("No response received from server.");
    } else {
      console.error("Unexpected error:", error.message);
      alert(`Unexpected error: ${error.message}`);
    }
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
         uomId: 1
        // uomId: (item.unitOfMeasure ?? (item as any).uomId) as any
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
            errors={errors}
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