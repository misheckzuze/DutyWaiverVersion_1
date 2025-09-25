'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useApplication from '@/hooks/useApplications';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { Item } from '@/types/ItemModel';
import { Attachment } from '@/types/AttachmentModel';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { ViewProjectDetails } from './ViewProjectDetails';
import { ViewItems } from './ViewItems';
import { ViewAttachments } from './ViewAttachments';
import { ApplicationProps, ApplicationSubmissionResponse } from '@/types/Application';
import Loader from '@/components/ui-utils/Loader';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@/icons';
import EnhancedConfirmationDialog from '@/components/ui-utils/EnhancedConfirmationDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ViewApplicationProps {
  id: string;
}

export default function ViewApplication({ id }: ViewApplicationProps) {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const [applicationData, setApplicationData] = useState<ApplicationSubmissionResponse | null>(null);
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'success' | 'warning' | 'danger' | 'info'>('warning');

  const { getApplicationById } = useApplication();

  useEffect(() => {
    const fetchApplication = async () => {
      setIsFetching(true);
      try {
        const data = await getApplicationById(id);
        if (data) {
          setApplicationData(data);

          // Parse duration string if available (e.g., "2 years 3 months")
          let durationYears = '';
          let durationMonths = '';

          if (data.projectDuration) {
            const durationStr = data.projectDuration.toString();
            const yearsMatch = durationStr.match(/(\d+)\s*years?/i);
            const monthsMatch = durationStr.match(/(\d+)\s*months?/i);

            if (yearsMatch) durationYears = yearsMatch[1];
            if (monthsMatch) durationMonths = monthsMatch[1];
          }

          setProjectDetails({
  projectName: data.projectName,
  projectDescription: data.projectDescription,
  projectType: data.applicationTypeId?.toString() || '',
  projectDistrict: data.projectDistrict,
  projectPhysicalAddress: data.projectPhysicalAddress,
  reasonForApplying: data.reasonForApplying,
  projectValue: data.projectValue?.toString() || '',
  projectDuration: `${durationYears} years ${durationMonths} months`, 
  projectDurationYears: durationYears,
  projectDurationMonths: durationMonths,
  startDate: data.startDate ? new Date(data.startDate) : null,
  endDate: data.endDate ? new Date(data.endDate) : null,
});


          setItems(data.items || []);
          // Map attachments to our local shape with view link
          setAttachments((data.attachments || []).map((a: any, idx: number) => ({
            id: String(a.id ?? idx),
            type: String(a.attachmentType?.id ?? ''),
            file: a.fileName || null,
            relativePath: a.fileUrl || undefined,
            attachmentId: a.id,
            uploaded: true,
            size: a.size,
            contentType: a.contentType,
          })));

          // Show success toast
          toast.success("Application details loaded successfully");
        }
      } catch (err) {
        console.error('Failed to load application:', err);
        toast.error("Failed to load application details");
        router.push('/my-applications');
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, []);

  const handleBackToList = () => {
    router.push('/my-applications');
  };

  const handleEdit = () => {
    router.push(`/edit-application/${id}`);
  };

  const getStatusDetails = (status: string) => {
    const statusMap: Record<string, { class: string, icon: React.ReactNode, gradient: string }> = {
      'Draft': {
        class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300',
        icon: <ClockIcon className="w-4 h-4 mr-1" />,
        gradient: 'from-gray-50 to-gray-100'
      },
      'Under Review': {
        class: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300',
        icon: <ClockIcon className="w-4 h-4 mr-1 text-blue-600" />,
        gradient: 'from-blue-50 to-blue-100'
      },
      'Submitted': {
        class: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300',
        icon: <ClockIcon className="w-4 h-4 mr-1 text-yellow-600" />,
        gradient: 'from-yellow-50 to-yellow-100'
      },
      'Approved': {
        class: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300',
        icon: <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />,
        gradient: 'from-green-50 to-green-100'
      },
      'Rejected': {
        class: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300',
        icon: <XCircleIcon className="w-4 h-4 mr-1 text-red-600" />,
        gradient: 'from-red-50 to-red-100'
      },
    };
    return statusMap[status] || statusMap['Draft'];
  };

  return (
    <div className="mx-auto">
      <ComponentCard title={`Application #${id}`}>
        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : (
          <>
            {applicationData && (
              <div className="mb-6">
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {projectDetails.projectName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Reference: {applicationData.referenceNumber || 'N/A'}
                    </p>
                  </div>
                  {applicationData.status && (
                    <div className={`flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusDetails(applicationData.status).class}`}>
                      {getStatusDetails(applicationData.status).icon}
                      {applicationData.status}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <ViewProjectDetails details={projectDetails} />
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <ViewItems items={items} />
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <ViewAttachments attachments={attachments} />
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="px-4 py-2"
              >
                Back to Applications
              </Button>

              {applicationData?.status === 'Draft' && (
                <Button
                  onClick={() => {
                    setConfirmMessage("Are you sure you want to edit this application?");
                    setConfirmType("info");
                    setConfirmAction(() => handleEdit);
                    setShowConfirmDialog(true);
                  }}
                  variant="primary"
                  className="px-4 py-2"
                >
                  Edit Application
                </Button>
              )}
            </div>

            <EnhancedConfirmationDialog
              isOpen={showConfirmDialog}
              message={confirmMessage}
              onConfirm={() => {
                confirmAction();
                setShowConfirmDialog(false);
              }}
              onCancel={() => setShowConfirmDialog(false)}
              type={confirmType}
            />
          </>
        )}
      </ComponentCard>
    </div>
  );
}
