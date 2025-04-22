'use client';
import React, { useState } from 'react';
import { ApplicationsTable } from './ApplicationsTable';
import { Application } from '@/types/ApplicationModel';

const ApplicationsList = () => {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      projectName: 'New Hospital Construction',
      projectType: 'Healthcare',
      projectValue: 25000000,
      status: 'draft',
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date('2023-05-15'),
    },
    {
      id: '2',
      projectName: 'Rural School Expansion',
      projectType: 'Education',
      projectValue: 12000000,
      status: 'submitted',
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2023-06-12'),
    },
    {
      id: '3',
      projectName: 'Agricultural Irrigation System',
      projectType: 'Agriculture',
      projectValue: 18000000,
      status: 'approved',
      createdAt: new Date('2023-07-01'),
      updatedAt: new Date('2023-07-15'),
    },
    {
      id: '4',
      projectName: 'Renewable Energy Grid',
      projectType: 'Energy',
      projectValue: 30000000,
      status: 'rejected',
      createdAt: new Date('2023-08-20'),
      updatedAt: new Date('2023-08-25'),
    }
  ]);

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
      <ApplicationsTable
        applications={applications}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onView={handleView}
      />
    </div>
  );
};

export default ApplicationsList;
