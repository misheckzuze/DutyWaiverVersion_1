"use client";
import React from 'react';
import { Attachment } from '@/types/AttachmentModel';
import { EyeCloseIcon } from '@/icons';
import Button from '@/components/ui/button/Button';

interface AttachmentItemProps {
  attachment: Attachment;
  onFileChange: (id: string, file: File | null) => void;
  onRemove: (id: string) => void;
}

export const AttachmentItem: React.FC<AttachmentItemProps> = ({ 
  attachment, 
  onFileChange, 
  onRemove 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    onFileChange(attachment.id, file);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{attachment.type}</h4>
          {attachment.file && (
            <p className="text-sm text-gray-500">{attachment.file.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            id={`file-upload-${attachment.id}`}
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor={`file-upload-${attachment.id}`}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
          >
            {attachment.file ? 'Change' : 'Upload'}
          </label>
          <Button
            onClick={() => onRemove(attachment.id)}
            className="text-red-600 hover:text-red-800"
          >
            <EyeCloseIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};