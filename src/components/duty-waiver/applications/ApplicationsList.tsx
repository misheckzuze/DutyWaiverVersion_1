'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Import router
import { ApplicationsTable } from './ApplicationsTable';
import { Application } from '@/types/ApplicationModel';
import useApplication from '@/hooks/useApplications';
import Loader from '@/components/ui-utils/Loader';

const ApplicationsList = () => {
  const router = useRouter(); // ✅ Initialize router

  const {
    getApplicationsByTIN,
    applications,
    isLoading,
    error
  } = useApplication();

  useEffect(() => {
    getApplicationsByTIN();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/app/edit-application/${id}`); // ✅ Navigate to edit page
  };

  const handleCancel = (id: string) => {
    // Handle cancel logic (optional to implement later)
  };

  const handleView = (id: string) => {
    // Handle view logic (optional to implement later)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h1>

      {isLoading ? (
        <Loader/>
      ) : (
        <ApplicationsTable
          applications={applications.map(app => ({
            id: app.id.toString(),
            projectName: app.projectName,
            projectType: `Type ${app.applicationTypeId}`, // Replace with real label if needed
            projectValue: app.projectValue,
            status: app.status.toLowerCase(),
            createdAt: new Date(app.submissionDate),
            updatedAt: new Date(app.submissionDate), // Replace with updatedDate if needed
          }))}
          onEdit={handleEdit} // ✅ Now handleEdit actually routes
          onCancel={handleCancel}
          onView={handleView}
        />
      )}
    </div>
  );
};

export default ApplicationsList;
