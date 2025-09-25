'use client';
import React, { useEffect, useState } from 'react';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { Item } from '@/types/ItemModel';
import { Attachment } from '@/types/AttachmentModel';
// import { attachmentTypeOptions } from '@/utils/constants';
import useApplication from '@/hooks/useApplications';
import { EyeCloseIcon } from '../../../icons';
import Label from '@/components/ui-utils/Label';

interface ReviewStepProps {
  projectDetails: ProjectDetails;
  items: Item[];
  attachments: Attachment[];
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  projectDetails,
  items,
  attachments
}) => {
  const calculateTotalValue = () => items.reduce((sum, item) => sum + (item.value || 0), 0);

    const [attachmentTypeOptions, setAttachmentTypeOptions] = useState<{ value: string, label: string }[]>([]);
    const [uomMap, setUomMap] = useState<Record<string, string>>({});
    const { getAttachmentTypes, getUnitOfMeasure } = useApplication();

    useEffect(() => {
  
      const fetchAttachmentTypes = async () => {
        try {
          const attachmentTypeOptions = await getAttachmentTypes();
          const options = attachmentTypeOptions.map((type: any) => ({
            value: type.id,
            label: type.name
          }));
          setAttachmentTypeOptions(options);
        } catch (error) {
          console.error('Failed to fetch project types:', error);
        }
      };
  
      fetchAttachmentTypes();

      const fetchUoms = async () => {
        try {
          const uoms = await getUnitOfMeasure();
          const map: Record<string, string> = {};
          (uoms || []).forEach((u: any) => {
            if (u.code != null) map[String(u.code)] = u.code;
            if (u.id != null) map[String(u.id)] = u.code;
          });
          setUomMap(map);
        } catch (e) {
          console.error('Failed to fetch UOMs:', e);
        }
      };
      fetchUoms();
    }, [getUnitOfMeasure]);

  const getAttachmentTypeLabel = (value: string) => {
    const option = attachmentTypeOptions.find(opt => String(opt.value) === String(value) || opt.label === value);
    return option ? option.label : value;
  };

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const fileUrl = (relativePath?: string) => (relativePath ? `${baseUrl}${relativePath}` : undefined);

  const formatDate = (date: Date | null) => {
    if (!date) return <span className="text-gray-400">Not provided</span>;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectTypeLabel = (value: string) => {
    if (!value) return <span className="text-gray-400">Not provided</span>;
    return value;
  };

  const getDistrictLabel = (value: string) => {
    if (!value) return <span className="text-gray-400">Not provided</span>;
    return value;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Review Your Application</h3>

        <div className="border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Project Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Project Name</Label>
              <p>{projectDetails.projectName || <span className="text-gray-400">Not provided</span>}</p>
            </div>
            <div>
              <Label>Project Type</Label>
              <p>{getProjectTypeLabel(projectDetails.projectType)}</p>
            </div>
            <div>
              <Label>Project Description</Label>
              <p className="whitespace-pre-line">{projectDetails.projectDescription || <span className="text-gray-400">Not provided</span>}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Project District</Label>
              <p>{getDistrictLabel(projectDetails.projectDistrict)}</p>
            </div>
            <div>
              <Label>Physical Address</Label>
              <p>{projectDetails.projectPhysicalAddress || <span className="text-gray-400">Not provided</span>}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Project Estimation Value</Label>
              <p>{projectDetails.projectValue ? `${projectDetails.projectValue} MWK` : <span className="text-gray-400">Not provided</span>}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Start Date</Label>
              <p>{formatDate(projectDetails.startDate)}</p>
            </div>
            <div>
              <Label>End Date</Label>
              <p>{formatDate(projectDetails.endDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Project Duration (Years)</Label>
              <p>{projectDetails.projectDurationYears || <span className="text-gray-400">Not provided</span>}</p>
            </div>
            <div>
              <Label>Project Duration (Months)</Label>
              <p>{projectDetails.projectDurationMonths || <span className="text-gray-400">Not provided</span>}</p>
            </div>
          </div>

          <div className="mt-4">
            <Label>Reason for Applying</Label>
            <p className="whitespace-pre-line">{projectDetails.reasonForApplying || <span className="text-gray-400">Not provided</span>}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Items ({items.length})</h4>
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HS Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value (MWK)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.hsCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{uomMap[String((item as any).uomId ?? item.unitOfMeasure)] || String((item as any).uomId ?? item.unitOfMeasure)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.value?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-6 py-3 text-right font-medium">Total Value:</td>
                    <td className="px-6 py-3 font-medium">{calculateTotalValue().toLocaleString()} MWK</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No items added</p>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">Attachments ({attachments.length})</h4>
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <EyeCloseIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{getAttachmentTypeLabel(attachment.type)}</span>
                    {(attachment.contentType || attachment.size) && (
                      <span className="ml-2 text-xs text-gray-500">
                        {attachment.contentType ? attachment.contentType.split('/').pop()?.toUpperCase() : ''}
                        {attachment.size ? ` • ${(attachment.size / 1024).toFixed(1)} KB` : ''}
                      </span>
                    )}
                  </div>
                  {attachment.relativePath ? (
                    <a
                      href={fileUrl(attachment.relativePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-sm text-red-500">Not uploaded</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No attachments added</p>
          )}
        </div>
      </div>
    </div>
  );
};