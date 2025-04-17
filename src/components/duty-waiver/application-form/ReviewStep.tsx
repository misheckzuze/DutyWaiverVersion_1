"use client";
import React, { useState } from 'react';
// import { ProjectDetails, Item, Attachment } from './types';
import { ProjectDetails } from '@/types/ProjectDetailsModel';
import { Item } from '@/types/ItemModel';
import { Attachment } from '@/types/AttachmentModel';
import { projectTypeOptions, attachmentTypeOptions } from '@/utils/constants';
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
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [reasonForApplying, setReasonForApplying] = useState("");
  const [projectValue, setProjectValue] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const getAttachmentTypeLabel = (value: string) => {
    const option = attachmentTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
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
                  <p>{projectName || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Type</Label>
                  <p>{projectType ? projectTypeOptions.find(opt => opt.value === projectType)?.label : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Location</Label>
                  <p>{projectLocation || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Value</Label>
                  <p>{projectValue ? `${projectValue} MWK` : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Project Duration</Label>
                  <p>{projectDuration || <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p>{startDate ? startDate.toLocaleDateString() : <span className="text-gray-400">Not provided</span>}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p>{endDate ? endDate.toLocaleDateString() : <span className="text-gray-400">Not provided</span>}</p>
                </div>
              </div>
              <div className="mt-4">
                <Label>Project Description</Label>
                <p className="whitespace-pre-line">{projectDescription || <span className="text-gray-400">Not provided</span>}</p>
              </div>
              <div className="mt-4">
                <Label>Reason for Applying</Label>
                <p className="whitespace-pre-line">{reasonForApplying || <span className="text-gray-400">Not provided</span>}</p>
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
                          <td className="px-6 py-4 whitespace-nowrap">{item.unitOfMeasure}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.value.toLocaleString()}</td>
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
                        {attachment.file && (
                          <span className="text-sm text-gray-500 ml-2">({attachment.file.name})</span>
                        )}
                      </div>
                      {!attachment.file && (
                        <span className="text-sm text-red-500">Missing file</span>
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