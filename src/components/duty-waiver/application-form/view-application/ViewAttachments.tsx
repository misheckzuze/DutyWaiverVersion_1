'use client';
import React from 'react';
import { Attachment } from '@/types/AttachmentModel';
import { DocumentIcon, DownloadIcon } from '@/icons';

interface ViewAttachmentsProps {
  attachments: Attachment[];
}

export const ViewAttachments: React.FC<ViewAttachmentsProps> = ({ attachments }) => {
  const getFileIcon = (contentType: string) => {
    if (!contentType) return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    
    const type = contentType.split('/')[0];
    const subtype = contentType.split('/')[1];
    
    switch (type) {
      case 'application':
        if (subtype?.includes('pdf')) return <DocumentIcon className="w-6 h-6 text-red-500" />;
        if (subtype?.includes('word') || subtype?.includes('document')) return <DocumentIcon className="w-6 h-6 text-blue-500" />;
        if (subtype?.includes('sheet') || subtype?.includes('excel')) return <DocumentIcon className="w-6 h-6 text-green-500" />;
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
      case 'image':
        return <DocumentIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (!size) return '';
    const kb = size / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileTypeFromContentType = (contentType: string) => {
    if (!contentType) return 'FILE';
    return contentType.split('/').pop()?.toUpperCase() || 'FILE';
  };

  const handleView = (attachment: Attachment) => {
    if (attachment.relativePath) {
      const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${attachment.relativePath}`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        Attachments
      </h3>

      {attachments.length === 0 ? (
        <p className="text-gray-500 italic">No attachments have been added to this application.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.map((attachment, index) => (
            <div 
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="mr-4">
                {getFileIcon(attachment.contentType || '')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  Document Type: {attachment.type || 'Unknown'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {getFileTypeFromContentType(attachment.contentType || '')}
                  {attachment.size && ` • ${formatFileSize(attachment.size)}`}
                </p>
              </div>
              {attachment.relativePath && (
                <button
                  onClick={() => handleView(attachment)}
                  className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                  title="View Document"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
