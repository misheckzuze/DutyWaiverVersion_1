'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApplicationsTable } from './ApplicationsTable';
import { Application } from '@/types/ApplicationModel';
import useApplication from '@/hooks/useApplications';
import Loader from '@/components/ui-utils/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ApplicationsList = () => {
  const router = useRouter();

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
    router.push(`/edit-application/${id}`);
    toast.info("Loading application for editing...");
  };

  const handleCancel = (id: string) => {
    // Here you would call an API to cancel the application
    toast.success("Application cancelled successfully");
    // Refresh the applications list
    getApplicationsByTIN();
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

        </>
      )}
    </div>
  );
};

export default ApplicationsList;
