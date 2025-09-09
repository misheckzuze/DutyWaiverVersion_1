"use client";
import React, { useEffect, useState } from 'react';
import useAEOApplication from '@/hooks/useAEOApplication';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import AddButton from './AddButton';
import RemoveButton from './RemoveButton';
import LoadingSpinner from './LoadingSpinner';

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
    const [entries, setEntries] = useState<Array<any>>([{ attachmentId: null, file: null, meta: null }]);
    const [tin, setTin] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('Tin') || '' : '');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [declarations, setDeclarations] = useState([{
        name: '',
        designation: '',
        place: '',
        signedDate: ''
    }]);

    useEffect(() => {
        (async () => {
            try {
                const types = await api.getAttachmentTypes();
                setAttachmentTypes(types || []);
            } catch (err) {
                console.debug('Failed to load attachment types', err);
            }
        })();
    }, [api]);

    const addEntry = () => setEntries(s => [...s, { attachmentId: null, file: null, meta: null }]);
    const removeEntry = (i: number) => setEntries(s => s.filter((_, idx) => idx !== i));

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

    const onFileChange = (i: number, f?: File) => {
        setEntries(s => { const copy = [...s]; copy[i] = { ...copy[i], file: f ?? null, meta: f ? fileMeta(f) : null }; return copy; });
    };

    const uploadOne = async (entry: any) => {
        if (!entry.file) return null;
        const res = await api.uploadAttachment(entry.file, entry.attachmentId ?? undefined);
        // map response to expected attachment payload
        return {
            attachmentId: res.id ?? entry.attachmentId ?? null,
            fileName: entry.meta?.fileName ?? entry.file.name,
            fileUrl: res.url || res.fileUrl || res.filePath || '',
            contentType: entry.meta?.contentType,
            size: entry.meta?.size,
        };
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setMessage(null);
        try {
            const uploaded: any[] = [];
            for (const e of entries) {
                if (!e.file) continue;
                const u = await uploadOne(e);
                if (u) uploaded.push(u);
            }

            const payload: any = {
                tin,
                attachments: uploaded,
                declarations
            };
            if (reason) payload.reason = reason;

            const res = await api.createApplication(payload);
            setMessage('Application submitted successfully!');
            console.debug('Application response', res);
        } catch (err: any) {
            setMessage(`Failed: ${err?.message || err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle document downloads
    const downloadDocument = (docName: string) => {
        // In a real implementation, this would fetch the document from an API
        console.log(`Downloading ${docName}`);
        alert(`Download functionality would fetch: ${docName}`);
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
                    <FormInput
                        label="Company TIN"
                        value={tin}
                        disabled
                        onChange={(e: any) => setTin(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason for Application *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Please provide a detailed reason for applying for AEO Licence..."
                        />
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
                                        onChange={(e) => updateDeclaration(i, 'name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                                        placeholder="Full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Designation *
                                    </label>
                                    <input
                                        type="text"
                                        value={decl.designation}
                                        onChange={(e) => updateDeclaration(i, 'designation', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                                        placeholder="Job title/position"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Place *
                                    </label>
                                    <input
                                        type="text"
                                        value={decl.place}
                                        onChange={(e) => updateDeclaration(i, 'place', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                                        placeholder="City, Country"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Signed Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={decl.signedDate}
                                        onChange={(e) => updateDeclaration(i, 'signedDate', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                                    />
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
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Required Attachments</h3>

                    {entries.map((ent, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-12 md:col-span-4">
                                <FormSelect
                                    label="Document Type"
                                    value={ent.attachmentId ?? ''}
                                    onChange={(e: any) => setEntries(s => {
                                        const c = [...s];
                                        c[i].attachmentId = e.target.value ? Number(e.target.value) : null;
                                        return c;
                                    })}
                                    options={[
                                        // { value: '', label: 'Select document type' },
                                        ...attachmentTypes.map((t: any) => ({ value: t.id, label: t.name }))
                                    ]}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="col-span-12 md:col-span-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Upload File
                                </label>
                                <div className="flex items-center">
                                    <label className="flex flex-col items-center px-4 py-2 bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 rounded-lg border border-dashed border-gray-300 dark:border-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="mt-1 text-xs">Choose file</span>
                                        <input
                                            type="file"
                                            onChange={(e) => onFileChange(i, e.target.files?.[0])}
                                            className="hidden"
                                        />
                                    </label>

                                    {ent.meta && (
                                        <div className="ml-3 text-xs text-gray-600 dark:text-gray-300">
                                            <div className="font-medium truncate max-w-xs">{ent.meta.fileName}</div>
                                            <div>{ent.meta.contentType} — {ent.meta.sizeMB} MB</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-2 flex justify-end">
                                <RemoveButton onClick={() => removeEntry(i)} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <AddButton onClick={addEntry} text="Add another attachment" />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {message && (
                            <div className={`text-sm px-4 py-2 rounded-lg ${message.includes('Failed') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                {message}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner />
                                    <span className="ml-2">Submitting...</span>
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