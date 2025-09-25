"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Attachment } from '@/types/AttachmentModel';
import { TrashBinIcon } from '@/icons';
import Button from '@/components/ui/button/Button';
import useApplication from '@/hooks/useApplications';
// import { attachmentTypeOptions } from '@/utils/constants';
import useDocumentUpload from '@/hooks/useDocumentUpload';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AttachmentItemProps {
  attachment: Attachment;
  onFileChange: (id: string, file: File | null, attachmentId?: number, relativePath?: string) => void;
  onRemove: (id: string) => void;
}

export const AttachmentItem: React.FC<AttachmentItemProps> = ({
  attachment,
  onFileChange,
  onRemove
}) => {
  const { uploadDocument, getProgress } = useDocumentUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    onFileChange(attachment.id, file);

    const toastId = toast.loading('Uploading document...');
    try {
      const res = await uploadDocument(file);
      toast.update(toastId, { render: 'Document uploaded', type: 'success', isLoading: false, autoClose: 2000 });

      // Pass the attachmentId and relativePath to parent
      onFileChange(attachment.id, file, res.data.attachmentId, res.data.relativePath);
    } catch (err: any) {
      toast.update(toastId, { render: err?.message || 'Upload failed', type: 'error', isLoading: false, autoClose: 4000 });
    }
  };

  const currentFileName = typeof attachment.file === 'string' ? attachment.file : attachment.file?.name;
  const progress = useMemo(() => (currentFileName ? getProgress(currentFileName) : undefined), [currentFileName, getProgress]);

  const [attachmentTypeOptions, setAttachmentTypeOptions] = useState<{ value: string, label: string }[]>([]);
  const { getAttachmentTypes } = useApplication();

  useEffect(() => {

    const fetchAttachmentTypes = async () => {
      try {
        const attachmentTypeOptions = await getAttachmentTypes();
        const options = attachmentTypeOptions.map((type: any) => ({
          value: type.id,
          label: type.name || type.description || String(type.id)
        }));
        setAttachmentTypeOptions(options);
      } catch (error) {
        console.error('Failed to fetch project types:', error);
      }
    };

    fetchAttachmentTypes();
  }, []);

  const attachmentTypeOption = attachmentTypeOptions.find(opt => String(opt.value) === String(attachment.type));
  const attachmementTypeLabel = attachmentTypeOption ? attachmentTypeOption.label : String(attachment.type);
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const viewUrl = attachment.relativePath ? `${baseUrl}${attachment.relativePath}` : undefined;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{attachmementTypeLabel}</h4>
          {currentFileName && (
            <p className="text-sm text-gray-500">{currentFileName}</p>
          )}
        </div>
        <div className="flex gap-2">
          {viewUrl && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 text-sm text-blue-600 hover:underline"
            >
              View
            </a>
          )}
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
            {currentFileName ? 'Change' : 'Upload'}
          </label>
          <Button
            onClick={() => onRemove(attachment.id)}
            className="p-1.5 bg-red-50 !text-red-600 rounded-md hover:bg-red-100 transition-colors"
          >
            <TrashBinIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {progress && (
        <div className="mt-3">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${progress.progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress.status === 'completed' ? 'Uploaded' : `Uploading ${progress.progress}%`}</p>
        </div>
      )}
    </div>
  );
};