'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressSteps } from './../ProgressSteps';
import { ProjectDetailsStep } from './../ProjectDetailsStep';
import { ItemsStep } from './../ItemsStep';
import { AttachmentsStep } from './../AttachmentsStep';
import { ReviewStep } from './../ReviewStep';
import useApplication from '@/hooks/useApplications';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { Item } from '@/types/ItemModel';
import { Attachment } from '@/types/AttachmentModel';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import ConfirmationDialog from '@/components/ui-utils/ConfirmationDialog';
import { ApplicationProps } from '@/types/Application';

interface EditApplicationFormProps {
  id: string;
}

export default function EditApplicationForm({ id }: EditApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    projectDescription: '',
    projectType: '',
    projectDistrict: '',
    projectPhysicalAddress: '',
    reasonForApplying: '',
    projectValue: '',
    projectDuration: '',
    projectDurationYears: '',
    projectDurationMonths: '',
    startDate: null,
    endDate: null,
  });
  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDraftConfirmDialog, setDraftShowConfirmDialog] = useState(false);
  const [showSubmitConfirmDialog, setSubmitShowConfirmDialog] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [redirect, setRedirect] = useState(false);

  const { getApplicationById, updateApplication, error } = useApplication();
  const hasFetched = useRef(false);

  // Single useEffect - runs only once
  useEffect(() => {
    const fetchApplication = async () => {
      if (hasFetched.current || !id) return;
      
      hasFetched.current = true;
      setIsFetching(true);
      
      try {
        const data = await getApplicationById(id);
        
        if (data) {
          setProjectDetails({
            projectName: data.projectName,
            projectDescription: data.projectDescription,
            projectType: data.applicationTypeId?.toString() || '',
            projectDistrict: data.projectDistrict,
            projectPhysicalAddress: data.projectPhysicalAddress,
            reasonForApplying: data.reasonForApplying,
            projectValue: data.projectValue?.toString() || '',
            projectDuration: data.projectDuration?.toString() || '',
            projectDurationYears: data.projectDurationYears?.toString() || '',
            projectDurationMonths: data.projectDurationMonths?.toString() || '',
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
          });
          setItems(data.items || []);
          setAttachments((data.attachments || []).map((a: any, idx: number) => ({
            id: `${a.type}-${idx}`,
            type: a.type,
            file: a.file || null,
          })));
        }
      } catch (err) {
        console.error('Failed to load application:', err);
        setRedirect(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchApplication();
  }, []); // Empty dependency array - runs once only

  useEffect(() => {
    if (redirect) {
      router.push('/my-applications');
    }
  }, [redirect, router]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleProjectDetailsChange = (updatedFields: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const buildPayload = (status: ApplicationProps["status"]): any => {
  const authData = JSON.parse(localStorage.getItem('authData') || '{}');

  return {
    id: parseInt(id), // main application id
    data: {
      id: parseInt(id),
      referenceNumber: "", // fill if needed
      userId: authData?.id || 0,
      tin: authData?.companyTIN || '',
      submissionDate: new Date().toISOString(),
      applicationTypeId: parseInt(projectDetails.projectType) || 1,
      status,
      projectName: projectDetails.projectName,
      projectDescription: projectDetails.projectDescription,
      projectDistrict: projectDetails.projectDistrict,
      projectPhysicalAddress: projectDetails.projectPhysicalAddress,
      reasonForApplying: projectDetails.reasonForApplying,
      projectValue: parseFloat(projectDetails.projectValue) || 0,
      currency: "MWK",
      deleted: false, // default
      startDate: projectDetails.startDate?.toISOString().split('T')[0] || "",
      endDate: projectDetails.endDate?.toISOString().split('T')[0] || "",
      attachments: attachments.map(att => ({
        type: att.type,
        file: typeof att.file === "string" ? att.file : "" // send string name
      })),
      items: items.map(item => ({
        description: item.description,
        hsCode: item.hsCode,
        quantity: item.quantity,
        value: item.value,
        currency: "MWK",
        dutyAmount: item.dutyAmount || 0,
        uomId: item.uomId || 1,
        applicationId: parseInt(id),
        deleted: false,
        uom: {
          code: item.uom?.code || "",
          description: item.uom?.description || "",
          deleted: false
        }
      }))
    }
  };
};


  const handleDraft = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload("Draft");
      const response = await updateApplication(parseInt(id), payload);

      if (response?.success) {
        alert(response.message || "Draft saved successfully!");
        router.push('/my-applications');
      } else {
        alert(response?.message || "Failed to save draft");
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert("Unexpected error while saving draft");
    } finally {
      setIsSaving(false);
    }
  };

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    const payload = buildPayload("Under Review");
    const response = await updateApplication(parseInt(id), payload);

    if (response?.success) {
      alert(response.message || "Application submitted successfully!");
      router.push('/my-applications');
    } else {
      alert(response?.message || "Failed to submit application");
    }
  } catch (err: any) {
    console.error('Failed to submit application:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to submit application';
    alert(`Unexpected error while submitting application: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="mx-auto">
      <ComponentCard title={`Edit Application #${id}`}>
        {isFetching ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <ProgressSteps currentStep={currentStep} totalSteps={4} />

            {currentStep === 1 && (
              <ProjectDetailsStep
                details={projectDetails}
                onChange={handleProjectDetailsChange}
                isEditMode={true}
              />
            )}

            {currentStep === 2 && (
              <ItemsStep
                items={items}
                setItems={setItems}
                isEditMode={true}
              />
            )}

            {currentStep === 3 && (
              <AttachmentsStep
                attachments={attachments}
                setAttachments={setAttachments}
                isEditMode={true}
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
                <div>
                  <Button
                    onClick={() => setDraftShowConfirmDialog(true)}
                    className="ml-auto mr-8 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    onClick={() => setSubmitShowConfirmDialog(true)}
                    className="ml-auto bg-green-600 hover:bg-green-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Changes'}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <ConfirmationDialog
          isOpen={showDraftConfirmDialog}
          title="Confirm Changes"
          message="Are you sure you want to update this application?"
          confirmText="Update Draft Application"
          onConfirm={handleDraft}
          onCancel={() => setDraftShowConfirmDialog(false)}
          isSubmitting={isSaving}
        />

        <ConfirmationDialog
          isOpen={showSubmitConfirmDialog}
          title="Confirm Changes"
          message="Are you sure you want to submit this application?"
          confirmText="Submit Application"
          onConfirm={handleSubmit}
          onCancel={() => setSubmitShowConfirmDialog(false)}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}