'use client';
import React, { useState } from 'react';
import { Attachment } from '@/types/AttachmentModel';
import { AttachmentItem } from './AttachmentItem';
import { AddAttachmentForm } from './AddAttachmentForm';
import { PlusIcon, EyeCloseIcon } from '@/icons';
import Button from '@/components/ui/button/Button';

interface AttachmentsStepProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  isEditMode?: boolean; // <-- ✅ add isEditMode
}

export const AttachmentsStep: React.FC<AttachmentsStepProps> = ({
  attachments,
  setAttachments,
  isEditMode = false, // default to false
}) => {
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);

  const addAttachment = () => setIsAddingAttachment(true);

  const handleAttachmentFileChange = (id: string, file: File | null, attachmentId?: number, relativePath?: string) => {
    setAttachments(attachments.map(attachment =>
      attachment.id === id ? { 
        ...attachment, 
        file, 
        attachmentId, 
        relativePath,
        uploaded: !!attachmentId 
      } : attachment
    ));
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {isEditMode ? 'Edit Required Documents' : 'Required Documents'}
        </h3>

        {/* {!isEditMode && ( // ✅ Disable Add Document button in edit mode if needed */}
          <Button
            onClick={addAttachment}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusIcon className="w-4 h-4" />
            Add Document
          </Button>
        {/* )} */}
      </div>

      <div className="space-y-4">
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onFileChange={handleAttachmentFileChange}
            onRemove={removeAttachment}
          />
        ))}

        {isAddingAttachment && (
          <AddAttachmentForm
            onSave={(type) => {
              setAttachments([
                ...attachments,
                { id: Date.now().toString(), type, file: null }
              ]);
              setIsAddingAttachment(false);
            }}
            onCancel={() => setIsAddingAttachment(false)}
          />
        )}

        {attachments.length === 0 && !isAddingAttachment && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <EyeCloseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No documents added
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Click the "Add Document" button to upload required documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
