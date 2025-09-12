"use client";
import React, { useState, useRef } from 'react';
import useDocumentUpload from '@/hooks/useDocumentUpload';
import { UploadProgress } from '@/hooks/useDocumentUpload';

interface DocumentUploadProps {
  attachmentId: number;
  attachmentName: string;
  onUploadComplete: (attachmentRecordId: number) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function DocumentUpload({
  attachmentId,
  attachmentName,
  onUploadComplete,
  onUploadError,
  disabled = false,
  required = false
}: DocumentUploadProps) {
  const { uploadDocument, uploadProgress, isUploading, getProgress } = useDocumentUpload();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedRecordId, setUploadedRecordId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Only images (JPEG, PNG, GIF) and PDF files are allowed');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onUploadError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);

    try {
      const response = await uploadDocument(file);
      setUploadedRecordId(response.data.attachmentRecordId);
      onUploadComplete(response.data.attachmentRecordId);
    } catch (error: any) {
      onUploadError(error.message || 'Upload failed');
      setUploadedFile(null);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedRecordId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (file.type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const currentProgress = uploadedFile ? getProgress(uploadedFile.name) : null;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800 dark:text-white">
          {attachmentName}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h4>
        {uploadedRecordId && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Uploaded
          </span>
        )}
      </div>

      {!uploadedFile ? (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-600 hover:bg-gray-100 dark:border-gray-500 dark:hover:border-gray-400 dark:hover:bg-gray-600">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.935 5.11a5.5 5.5 0 0 0 1.13 1.897A3 3 0 0 0 13 13Zm0 0V7.5a2.5 2.5 0 0 0-5 0V13m5 0H8m5 0v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3m5 0V9.5a2.5 2.5 0 0 0-5 0V13"/>
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Images and PDF (MAX. 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File Info */}
          <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
            {getFileIcon(uploadedFile)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(uploadedFile.size)}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              disabled={isUploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Upload Progress */}
          {currentProgress && currentProgress.status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Uploading...</span>
                <span>{currentProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {currentProgress && currentProgress.status === 'error' && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {currentProgress.error || 'Upload failed'}
                </p>
              </div>
            </div>
          )}

          {/* Upload Success */}
          {currentProgress && currentProgress.status === 'completed' && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Upload completed successfully
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
