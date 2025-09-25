import { useState, useCallback } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function apiUrl(path: string) {
  return BASE ? `${BASE}${path}` : path;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadedDocument {
  fileName: string;
  relativePath: string;
  attachmentRecordId: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadedDocument;
}

export default function useDocumentUpload() {
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = useCallback(async (file: File): Promise<UploadResponse> => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only images (JPEG, PNG, GIF) and PDF files are allowed');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    const fileName = file.name;
    const fileId = `${fileName}_${Date.now()}`;

    // Set initial progress
    setUploadProgress(prev => new Map(prev).set(fileId, {
      fileName,
      progress: 0,
      status: 'uploading'
    }));

    setIsUploading(true);

    try {
      const formData = new FormData();
      // API expects key name 'File'
      formData.append('File', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => new Map(prev).set(fileId, {
            fileName,
            progress,
            status: 'uploading'
          }));
        }
      });

      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response: UploadResponse = JSON.parse(xhr.responseText);
              setUploadProgress(prev => new Map(prev).set(fileId, {
                fileName,
                progress: 100,
                status: 'completed'
              }));
              resolve(response);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Upload failed due to network error'));
        };

        xhr.ontimeout = () => {
          reject(new Error('Upload timed out'));
        };
      });

      // Use v1 endpoint
      xhr.open('POST', apiUrl('/api/v1/attachments/upload'));
      xhr.timeout = 300000; // 5 minutes timeout

      // Set headers
      const headers = authHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);

      const result = await uploadPromise;
      
      // Clean up progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 3000);

      return result;
    } catch (error: any) {
      setUploadProgress(prev => new Map(prev).set(fileId, {
        fileName,
        progress: 0,
        status: 'error',
        error: error.message
      }));

      // Clean up error state after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });
      }, 5000);

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearProgress = useCallback((fileName?: string) => {
    if (fileName) {
      setUploadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileName);
        return newMap;
      });
    } else {
      setUploadProgress(new Map());
    }
  }, []);

  const getProgress = useCallback((fileName: string): UploadProgress | undefined => {
    return uploadProgress.get(fileName);
  }, [uploadProgress]);

  return {
    uploadDocument,
    uploadProgress: Array.from(uploadProgress.values()),
    isUploading,
    clearProgress,
    getProgress
  };
}
