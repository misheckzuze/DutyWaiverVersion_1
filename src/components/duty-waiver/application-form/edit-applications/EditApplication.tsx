'use client';
import React, { useEffect, useState } from 'react';
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
    startDate: null,
    endDate: null,
  });
  const [items, setItems] = useState<Item[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const { getApplicationById, updateApplication, error } = useApplication(); 

  useEffect(() => {
    const fetchApplication = async () => {
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
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
          });
          setItems(data.items || []);
          setAttachments(data.attachments || []);
        }
      } catch (err) {
        console.error('Failed to load application:', err);
        router.push('/my-applications');
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  const handleNextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const handlePrevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleProjectDetailsChange = (updatedFields: Partial<ProjectDetails>) => {
    setProjectDetails(prev => ({
      ...prev,
      ...updatedFields
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');

      const payload: ApplicationProps = {
        userId: authData?.id || 0,
        tin: authData?.companyTIN || '',
        submissionDate: new Date().toISOString(),
        applicationTypeId: parseInt(projectDetails.projectType) || 1,
        status: "Draft",
        projectName: projectDetails.projectName,
        projectDescription: projectDetails.projectDescription,
        projectDistrict: projectDetails.projectDistrict,
        projectPhysicalAddress: projectDetails.projectPhysicalAddress,
        reasonForApplying: projectDetails.reasonForApplying,
        projectValue: parseFloat(projectDetails.projectValue) || 0,
        currency: "MWK",
        startDate: projectDetails.startDate?.toISOString().split('T')[0] || "",
        endDate: projectDetails.endDate?.toISOString().split('T')[0] || "",
        attachments: attachments.map(att => ({
          type: att.type,
          file: att.file?.name || ""
        })),
        items: items.map(item => ({
          description: item.description,
          hscode: item.hsCode,
          quantity: item.quantity,
          value: item.value,
          currency: "MWK",
          dutyAmount: 200,
          uomId: 1
        }))
      };

      await updateApplication(parseInt(id), payload);
      router.push('/my-applications');
    } catch (err) {
      console.error('Failed to update application:', err);
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
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="ml-auto bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Changes'}
                </Button>
              )}
            </div>
          </>
        )}

        <ConfirmationDialog
          isOpen={showConfirmDialog}
          title="Confirm Changes"
          message="Are you sure you want to update this application?"
          confirmText="Update Application"
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmDialog(false)}
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
