'use client';
import React, { useEffect } from 'react';
import { ApplicationsTable } from './ApplicationsTable';
import { Application } from '@/types/ApplicationModel';
import useApplication from '@/hooks/useApplications';

const ApplicationsList = () => {
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
    // Handle edit logic
  };

  const handleCancel = (id: string) => {
    // Handle cancel logic
  };

  const handleView = (id: string) => {
    // Handle view logic
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Applications</h1>

      {isLoading ? (
        <p>Loading applications...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : applications.length === 0 ? (
        <p className="text-gray-600">No applications found.</p>
      ) : (
        <ApplicationsTable
          applications={applications.map(app => ({
            id: app.id.toString(),
            projectName: app.projectName,
            projectType: `Type ${app.applicationTypeId}`, // Replace with real label if available
            projectValue: app.projectValue,
            status: app.status.toLowerCase(),
            createdAt: new Date(app.submissionDate),
            updatedAt: new Date(app.submissionDate), // Replace with updatedDate if available
          }))}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onView={handleView}
        />
      )}
    </div>
  );
};

export default ApplicationsList;
