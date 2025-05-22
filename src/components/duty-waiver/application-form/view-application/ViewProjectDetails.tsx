'use client';
import React, { useEffect, useState } from 'react';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { districtOptions } from '@/utils/constants';
import useApplication from '@/hooks/useApplications';

interface ViewProjectDetailsProps {
  details: ProjectDetails;
}

export const ViewProjectDetails: React.FC<ViewProjectDetailsProps> = ({ details }) => {
  const [projectTypeLabel, setProjectTypeLabel] = useState<string>('');
  const [districtLabel, setDistrictLabel] = useState<string>('');
  const { getApplicationTypes } = useApplication();

  useEffect(() => {
    // Get project type label
    const fetchProjectTypes = async () => {
      try {
        const types = await getApplicationTypes();
        const projectType = types.find((type: any) => 
          type.id.toString() === details.projectType || 
          type.name.toLowerCase() === details.projectType.toLowerCase()
        );
        
        if (projectType) {
          setProjectTypeLabel(projectType.name);
        } else {
          setProjectTypeLabel(details.projectType);
        }
      } catch (error) {
        console.error('Failed to fetch project types:', error);
        setProjectTypeLabel(details.projectType);
      }
    };

    // Get district label
    const district = districtOptions.find(d => d.value === details.projectDistrict);
    setDistrictLabel(district ? district.label : details.projectDistrict);
    
    fetchProjectTypes();
  }, [details, getApplicationTypes]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not specified';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Project Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Project Name</h4>
          <p className="mt-1 text-gray-800">{details.projectName || 'Not specified'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Project Type</h4>
          <p className="mt-1 text-gray-800">{projectTypeLabel || 'Not specified'}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Project Description</h4>
        <p className="mt-1 text-gray-800 whitespace-pre-line">{details.projectDescription || 'Not specified'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Project District</h4>
          <p className="mt-1 text-gray-800">{districtLabel || 'Not specified'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Physical Address</h4>
          <p className="mt-1 text-gray-800">{details.projectPhysicalAddress || 'Not specified'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Project Value (MWK)</h4>
          <p className="mt-1 text-gray-800">
            {details.projectValue 
              ? Number(details.projectValue).toLocaleString(undefined, { minimumFractionDigits: 2 })
              : 'Not specified'}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Project Duration</h4>
          <p className="mt-1 text-gray-800">{details.projectDuration || 'Not specified'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
          <p className="mt-1 text-gray-800">{formatDate(details.startDate)}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">End Date</h4>
          <p className="mt-1 text-gray-800">{formatDate(details.endDate)}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Reason for Applying</h4>
        <p className="mt-1 text-gray-800 whitespace-pre-line">{details.reasonForApplying || 'Not specified'}</p>
      </div>
    </div>
  );
};
