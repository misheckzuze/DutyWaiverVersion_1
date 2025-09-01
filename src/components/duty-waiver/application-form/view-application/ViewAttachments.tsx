'use client';
import React from 'react';
import { Attachment } from '@/types/AttachmentModel';
import { DocumentIcon, DownloadIcon } from '@/icons';

interface ViewAttachmentsProps {
  attachments: Attachment[];
}

export const ViewAttachments: React.FC<ViewAttachmentsProps> = ({ attachments }) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // You can add more file type icons as needed
    switch (extension) {
      case 'pdf':
        return <DocumentIcon className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentIcon className="w-6 h-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <DocumentIcon className="w-6 h-6 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <DocumentIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleDownload = (attachment: Attachment) => {
    // This is a placeholder for actual download functionality
    // In a real implementation, you would fetch the file from the server
    console.log('Download attachment:', attachment);
    alert('Download functionality would be implemented here.');
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
                {getFileIcon((typeof attachment.file === 'string' ? attachment.file : attachment.file?.name) || '')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {(typeof attachment.file === 'string' ? attachment.file : attachment.file?.name) || 'Unnamed file'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {attachment.type || 'Unknown'}
                </p>
              </div>
              <button
                onClick={() => handleDownload(attachment)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Download"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
