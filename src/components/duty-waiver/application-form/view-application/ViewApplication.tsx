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
import { ApplicationProps } from '@/types/Application';
import Loader from '@/components/ui-utils/Loader';

interface ViewApplicationProps {
  id: string;
}

export default function ViewApplication({ id }: ViewApplicationProps) {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const [applicationData, setApplicationData] = useState<ApplicationProps | null>(null);
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

  const { getApplicationById } = useApplication();

  useEffect(() => {
    const fetchApplication = async () => {
      setIsFetching(true);
      try {
        const data = await getApplicationById(id);
        if (data) {
          setApplicationData(data);
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
  }, []);

  const handleBackToList = () => {
    router.push('/my-applications');
  };

  const handleEdit = () => {
    router.push(`/edit-application/${id}`);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Submitted': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
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
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeClass(applicationData.status)}`}>
                    {applicationData.status}
                  </div>
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
                  onClick={handleEdit}
                  variant="primary"
                  className="px-4 py-2"
                >
                  Edit Application
                </Button>
              )}
            </div>
          </>
        )}
      </ComponentCard>
    </div>
  );
}
