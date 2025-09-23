"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import useAEOApplication from '@/hooks/useAEOApplication';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';
import LoadingSpinner from './LoadingSpinner';
import DocumentUpload from './DocumentUpload';
import DatePicker from './DatePicker';

function fileMeta(file: File) {
    return {
        fileName: file.name,
        contentType: file.type || file.name.split('.').pop() || 'bin',
        size: file.size,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
    };
}

export default function ApplyAEOLicence() {
    const api = useAEOApplication();
    const [attachmentTypes, setAttachmentTypes] = useState<any[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<Map<number, number>>(new Map()); // attachmentId -> attachmentRecordId
    const [tin, setTin] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('Tin') || '' : '');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [declarations, setDeclarations] = useState([{
        name: '',
        designation: '',
        place: '',
        signedDate: ''
    }]);
    const hasLoadedRef = useRef(false);

    const loadAttachmentTypes = useCallback(async () => {
        if (hasLoadedRef.current) return;
        
        try {
            setIsLoading(true);
            setMessage(null);
            console.log('Loading attachment types...');
            const response = await api.getAttachmentTypes();
            console.log('Attachment types response:', response);
            
            // Handle different response formats
            let types = [];
            if (Array.isArray(response)) {
                types = response;
            } else if (response && Array.isArray(response.data)) {
                types = response.data;
            } else if (response && response.data) {
                types = response.data;
            } else if (response && response.success && Array.isArray(response.data)) {
                types = response.data;
            } else {
                console.warn('Unexpected response format:', response);
                types = [];
            }
            
            console.log('Processed attachment types:', types);
            setAttachmentTypes(types);
            hasLoadedRef.current = true;
        } catch (err: any) {
            console.error('Failed to load attachment types', err);
            setMessage('Failed to load attachment types. Please refresh the page.');
            setMessageType('error');
            setAttachmentTypes([]); // Ensure we set empty array on error
            hasLoadedRef.current = true; // Mark as loaded even on error
        } finally {
            setIsLoading(false);
        }
    }, [api.getAttachmentTypes]);

    useEffect(() => {
        loadAttachmentTypes();
    }, [loadAttachmentTypes]);

    // Validation functions
    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        // Validate TIN
        if (!tin.trim()) {
            newErrors.tin = 'TIN is required';
        }

        // Validate reason
        if (!reason.trim()) {
            newErrors.reason = 'Application reason is required';
        } else if (reason.trim().length < 10) {
            newErrors.reason = 'Application reason must be at least 10 characters';
        }

        // Validate declarations
        declarations.forEach((decl, index) => {
            if (!decl.name.trim()) {
                newErrors[`declaration_${index}_name`] = 'Declarant name is required';
            }
            if (!decl.designation.trim()) {
                newErrors[`declaration_${index}_designation`] = 'Declarant capacity is required';
            }
            if (!decl.place.trim()) {
                newErrors[`declaration_${index}_place`] = 'Place is required';
            }
            if (!decl.signedDate) {
                newErrors[`declaration_${index}_signedDate`] = 'Signed date is required';
            } else {
                const selectedDate = new Date(decl.signedDate);
                const today = new Date();
                if (selectedDate > today) {
                    newErrors[`declaration_${index}_signedDate`] = 'Signed date cannot be in the future';
                }
            }
        });

        // Validate documents - all attachment types must have uploaded documents
        if (attachmentTypes.length > 0) {
            attachmentTypes.forEach((attachmentType) => {
                if (!uploadedDocuments.has(attachmentType.id)) {
                    newErrors[`document_${attachmentType.id}`] = `${attachmentType.name} is required`;
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearMessage = () => {
        setMessage(null);
        setMessageType('info');
    };

    const addDeclaration = () => {
        setDeclarations(s => [...s, { name: '', designation: '', place: '', signedDate: '' }]);
    };

    const removeDeclaration = (i: number) => {
        if (declarations.length > 1) {
            setDeclarations(s => s.filter((_, idx) => idx !== i));
        }
    };

    const updateDeclaration = (i: number, field: string, value: string) => {
        setDeclarations(s => {
            const copy = [...s];
            copy[i] = { ...copy[i], [field]: value };
            return copy;
        });
    };

    const handleDocumentUpload = (attachmentId: number, attachmentRecordId: number) => {
        setUploadedDocuments(prev => new Map(prev).set(attachmentId, attachmentRecordId));
        // Clear document error when successfully uploaded
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`document_${attachmentId}`];
            return newErrors;
        });
    };

    const handleDocumentUploadError = (error: string) => {
        setMessage(`Upload error: ${error}`);
        setMessageType('error');
    };

    const handleSubmit = async () => {
        // Clear previous errors and messages
        setErrors({});
        setMessage(null);
        
        // Validate form
        if (!validateForm()) {
            setMessage('Please fix the errors below before submitting.');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert uploaded documents to the required format
            const attachments = Array.from(uploadedDocuments.entries()).map(([attachmentId, applicationAttachmentId]) => ({
                attachmentId,
                applicationAttachmentId
            }));

            const payload: any = {
                tin,
                applicationReason: reason,
                attachments,
                declarations: declarations.map(decl => ({
                    isConfirmed: true,
                    declarantFullName: decl.name,
                    declarantCapacity: decl.designation,
                    declarationDate: decl.signedDate
                }))
            };

            const res = await api.createApplication(payload);
            setMessage('Application submitted successfully! You will receive a confirmation email shortly.');
            setMessageType('success');
            console.debug('Application response', res);
            
            // Redirect to applications list after successful submission
            setTimeout(() => {
                window.location.href = '/aeo/applications';
            }, 2000);
        } catch (err: any) {
            setMessage(`Failed to submit application: ${err?.message || 'Unknown error occurred'}`);
            setMessageType('error');
            console.error('Application submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle document downloads
    const downloadDocument = (docName: string) => {
        let fileName = '';
        let filePath = '';
        
        // Map document names to actual file paths
        switch (docName) {
            case 'AEO Application Form':
                fileName = 'AEO Application and self assessment form.-2.docx';
                filePath = '/documents/AEO Application and self assessment form.-2.docx';
                break;
            case 'Security Questionnaire':
                fileName = 'COMPLIANCE CHECKLIST.docx';
                filePath = '/documents/COMPLIANCE CHECKLIST.docx';
                break;
            default:
                console.error('Unknown document:', docName);
                return;
        }
        
        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        link.target = '_blank';
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
                {/* Header Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Apply for AEO License</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Advanced Economic Operator License Application
                    </p>
                </div>

                {/* Downloadable Forms Section */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Required Forms (Download, Fill, and Attach)
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => downloadDocument('AEO Application Form')}
                            className="flex items-center px-3 py-2 bg-white dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-md text-blue-700 dark:text-blue-200 text-sm hover:bg-blue-50 dark:hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            AEO Application and self assessment form
                        </button>
                        {/* <button
                            onClick={() => downloadDocument('Compliance Declaration')}
                            className="flex items-center px-3 py-2 bg-white dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-md text-blue-700 dark:text-blue-200 text-sm hover:bg-blue-50 dark:hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Revised user Requirements AEO Application
                        </button> */}
                        <button
                            onClick={() => downloadDocument('Security Questionnaire')}
                            className="flex items-center px-3 py-2 bg-white dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-md text-blue-700 dark:text-blue-200 text-sm hover:bg-blue-50 dark:hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Compliance Checklist
                        </button>
                    </div>
                </div>

                {/* TIN and Reason Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <FormInput
                            label="Company TIN *"
                        value={tin}
                        disabled
                        onChange={(e: any) => setTin(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.tin ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                        {errors.tin && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.tin}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason for Application *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (errors.reason) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.reason;
                                        return newErrors;
                                    });
                                }
                            }}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                                errors.reason ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Please provide a detailed reason for applying for AEO Licence..."
                        />
                        {errors.reason && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                        )}
                    </div>
                </div>

                {/* Declarations Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                        </svg>
                        Declarations
                    </h3>

                    {declarations.map((decl, i) => (
                        <div key={i} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg relative">
                            {declarations.length > 1 && (
                                <button
                                    onClick={() => removeDeclaration(i)}
                                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                                    aria-label="Remove declaration"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={decl.name}
                                        onChange={(e) => {
                                            updateDeclaration(i, 'name', e.target.value);
                                            if (errors[`declaration_${i}_name`]) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[`declaration_${i}_name`];
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white ${
                                            errors[`declaration_${i}_name`] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Full name"
                                    />
                                    {errors[`declaration_${i}_name`] && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[`declaration_${i}_name`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Designation *
                                    </label>
                                    <input
                                        type="text"
                                        value={decl.designation}
                                        onChange={(e) => {
                                            updateDeclaration(i, 'designation', e.target.value);
                                            if (errors[`declaration_${i}_designation`]) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[`declaration_${i}_designation`];
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white ${
                                            errors[`declaration_${i}_designation`] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Job title/position"
                                    />
                                    {errors[`declaration_${i}_designation`] && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[`declaration_${i}_designation`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Place *
                                    </label>
                                    <input
                                        type="text"
                                        value={decl.place}
                                        onChange={(e) => {
                                            updateDeclaration(i, 'place', e.target.value);
                                            if (errors[`declaration_${i}_place`]) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[`declaration_${i}_place`];
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white ${
                                            errors[`declaration_${i}_place`] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="City, Country"
                                    />
                                    {errors[`declaration_${i}_place`] && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[`declaration_${i}_place`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Signed Date *
                                    </label>
                                    <DatePicker
                                        value={decl.signedDate}
                                        onChange={(e) => {
                                            updateDeclaration(i, 'signedDate', e.target.value);
                                            if (errors[`declaration_${i}_signedDate`]) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[`declaration_${i}_signedDate`];
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white cursor-pointer ${
                                            errors[`declaration_${i}_signedDate`] ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors[`declaration_${i}_signedDate`] && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors[`declaration_${i}_signedDate`]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addDeclaration}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add another declaration
                    </button>
                </div>

                {/* Attachments Section */}
                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Required Attachments *
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading attachment types...</span>
                            </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attachmentTypes.map((attachmentType: any) => (
                                <div key={attachmentType.id} className="space-y-2">
                                    <DocumentUpload
                                        attachmentId={attachmentType.id}
                                        attachmentName={attachmentType.name}
                                        onUploadComplete={(attachmentRecordId) => handleDocumentUpload(attachmentType.id, attachmentRecordId)}
                                        onUploadError={handleDocumentUploadError}
                                        disabled={isSubmitting}
                                        required={true}
                                    />
                                    {errors[`document_${attachmentType.id}`] && (
                                        <p className="text-sm text-red-600 dark:text-red-400">{errors[`document_${attachmentType.id}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">

                    <div className="flex flex-col items-end gap-2">
                        {message && (
                            <div className={`text-sm px-4 py-2 rounded-lg flex items-center ${
                                messageType === 'error' 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800' 
                                    : messageType === 'success'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}>
                                {messageType === 'error' && (
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {messageType === 'success' && (
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {messageType === 'info' && (
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {message}
                                <button
                                    onClick={clearMessage}
                                    className="ml-2 text-current hover:opacity-70"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || isLoading}
                            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner />
                                    <span className="ml-2">Submitting Application...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Submit Application
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}