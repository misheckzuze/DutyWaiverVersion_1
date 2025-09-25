"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAEOApplication from '@/hooks/useAEOApplication';
import DocumentPreview from './DocumentPreview';
import LoadingSpinner from './LoadingSpinner';

interface AEOApplicationDetailsProps {
  applicationId: number;
}

interface AEOAttachment {
  id: number;
  applicationId: number;
  attachmentId: number;
  fileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  attachment: {
    id: number;
    name: string;
    description: string;
    required: boolean;
    attachmentTypeId: number;
    attachmentType: any;
    createdAt: string;
    updatedAt: string | null;
  };
}

interface AEODeclaration {
  id: number;
  isConfirmed: boolean;
  declarantFullName: string;
  declarantCapacity: string;
  signatureImage: string | null;
  declarationDate: string;
  createdAt: string;
  updatedAt: string;
  applicationId: number;
}

interface AEOCompany {
  id: number;
  tin: string;
  tradingName: string;
  address: string;
  email: string;
  phonenumber: string;
  otp: string | null;
  deleted: boolean;
}

interface AEOApplicationData {
  id: number;
  status: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  applicationDate: string;
  approvalDate: string | null;
  expiryDate: string | null;
  attachments: AEOAttachment[];
  declarations: AEODeclaration[];
  company: AEOCompany;
}

export default function AEOApplicationDetails({ applicationId }: AEOApplicationDetailsProps) {
  const router = useRouter();
  const { getAEOApplicationById } = useAEOApplication();
  const [application, setApplication] = useState<AEOApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getAEOApplicationById(applicationId);
        setApplication(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, getAEOApplicationById]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accredited':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'aeocompliant':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pcacompliant':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'query':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'riskcompliant':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'underreview':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading application details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Application not found</p>
        <button
          onClick={() => router.back()}
          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              AEO Application #{application.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Application Date: {formatDate(application.applicationDate)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Validity Information for Accredited Applications */}
      {application.status.toLowerCase() === 'accredited' && (application.approvalDate || application.expiryDate) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                AEO License Validity
              </h2>
              <p className="text-green-600 dark:text-green-300">
                Your AEO license is currently active and valid
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {application.approvalDate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Approval Date</h3>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {formatDate(application.approvalDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {application.expiryDate && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Expiry Date</h3>
                    <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {formatDate(application.expiryDate)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(() => {
                        const expiry = new Date(application.expiryDate);
                        const now = new Date();
                        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (daysLeft > 30) {
                          return `${daysLeft} days remaining`;
                        } else if (daysLeft > 0) {
                          return `${daysLeft} days remaining - Renewal recommended`;
                        } else {
                          return 'License expired - Renewal required';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {application.expiryDate && (() => {
            const expiry = new Date(application.expiryDate);
            const now = new Date();
            const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft <= 30 && daysLeft > 0) {
              return (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Your AEO license will expire soon. Consider renewing your application to maintain your accredited status.
                    </p>
                  </div>
                </div>
              );
            } else if (daysLeft <= 0) {
              return (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Your AEO license has expired. Please submit a new application to regain your accredited status.
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">TIN</label>
            <p className="text-gray-900 dark:text-white">{application.company.tin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trading Name</label>
            <p className="text-gray-900 dark:text-white">{application.company.tradingName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <p className="text-gray-900 dark:text-white">{application.company.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <p className="text-gray-900 dark:text-white">{application.company.phonenumber}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <p className="text-gray-900 dark:text-white">{application.company.address}</p>
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Attachments ({application.attachments.length})
        </h2>
        {application.attachments.length > 0 ? (
          <div className="space-y-3">
            {application.attachments.map((attachment) => (
              <DocumentPreview
                key={attachment.id}
                fileName={attachment.fileName}
                fileUrl={attachment.fileUrl}
                contentType={attachment.contentType}
                size={attachment.size}
                attachmentName={attachment.attachment?.name}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No attachments found</p>
        )}
      </div>

      {/* Declarations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Declarations ({application.declarations.length})
        </h2>
        {application.declarations.length > 0 ? (
          <div className="space-y-4">
            {application.declarations.map((declaration, index) => (
              <div key={declaration.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800 dark:text-white">Declaration #{index + 1}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    declaration.isConfirmed 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {declaration.isConfirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Declarant Name</label>
                    <p className="text-gray-900 dark:text-white">{declaration.declarantFullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
                    <p className="text-gray-900 dark:text-white">{declaration.declarantCapacity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Declaration Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {declaration.declarationDate && declaration.declarationDate !== '0001-01-01T00:00:00' 
                        ? formatDate(declaration.declarationDate)
                        : 'Not set'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Created</label>
                    <p className="text-gray-900 dark:text-white">{formatDate(declaration.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No declarations found</p>
        )}
      </div>

      {/* Application Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Application Timeline
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Application Created</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(application.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(application.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
