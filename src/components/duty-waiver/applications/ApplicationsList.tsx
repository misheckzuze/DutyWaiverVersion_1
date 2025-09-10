'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationsTable } from './ApplicationsTable';
import { Application } from '@/types/ApplicationModel';
import useApplication from '@/hooks/useApplications';
import Loader from '@/components/ui-utils/Loader';
import EnhancedConfirmationDialog from '@/components/ui-utils/EnhancedConfirmationDialog';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApplicationsList = () => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmType, setConfirmType] = useState<'success' | 'warning' | 'danger' | 'info'>('warning');

  const {
    getApplicationsByTIN,
    getApplicationTypes,
    applications,
    isLoading,
    error
  } = useApplication();

  const [typeMap, setTypeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [apps, types] = await Promise.all([
          getApplicationsByTIN(),
          getApplicationTypes()
        ]);
        const map: Record<string, string> = {};
        (types || []).forEach((t: any) => { map[String(t.id)] = t.name; });
        setTypeMap(map);
        toast.success("Applications loaded successfully");
      } catch (err) {
        toast.error("Failed to load applications");
      }
    };

    fetchAll();
  }, []);

  const handleEdit = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage("Are you sure you want to edit this application?");
    setConfirmType("info");
    setConfirmAction(() => () => {
      router.push(`/edit-application/${id}`);
      toast.info("Editing application...");
    });
    setShowConfirmDialog(true);
  };

  const handleCancel = (id: string) => {
    setSelectedApplicationId(id);
    setConfirmMessage("Are you sure you want to cancel this application? This action cannot be undone.");
    setConfirmType("danger");
    setConfirmAction(() => () => {
      // Here you would call an API to cancel the application
      toast.success("Application cancelled successfully");
      // Refresh the applications list
     getApplicationsByTIN();
    });
    setShowConfirmDialog(true);
  };

  const handleView = (id: string) => {
    router.push(`/view-application/${id}`);
    toast.info("Loading application details...");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h1>

      {isLoading ? (
        <Loader/>
      ) : (
        <>
          <ApplicationsTable
            applications={applications.map(app => ({
              id: app.id.toString(),
              projectName: app.projectName,
              projectType: typeMap[String(app.applicationTypeId)] || `Type ${app.applicationTypeId}`,
              projectValue: app.projectValue,
              status: app.status.toLowerCase(),
              createdAt: new Date(app.submissionDate),
              updatedAt: new Date(app.submissionDate)
            }))}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onView={handleView}
          />

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
    </div>
  );
};

export default ApplicationsList;
