"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "./FileUpload";
import DeclarationsField from "./DeclarationsField";
// import { countries } from "./countries"; // You'll need to create this
import { countries } from "@/lib/countries";
// Components
import SectionHeader from "./SectionHeader";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import FormCheckbox from "./FormCheckbox";
import AddButton from "./AddButton";
import RemoveButton from "./RemoveButton";
import LoadingSpinner from "./LoadingSpinner";
import useAEOProfile from '@/hooks/useAeoProfile';
import useAgent from '@/hooks/useAgent';
import DatePicker from "./DatePicker";

const emptyAgent = { agentCode: "", agentName: "", agentTpin: "", agentTelephoneNumber: "", agentEmailAddress: "" };
const emptyContact = { contactType: "Primary", title: "", firstName: "", familyName: "", positionTitle: "", emailAddress: "", directTelephoneNumber: "", mobileTelephoneNumber: "" };
const emptyLicense = { licenseType: "", approvedOperations: "" };
const emptyExemption = { cpccode: "", description: "" };
const emptyDrawback = { hscode: "", description: "" };
const emptyDeclaration = { isConfirmed: false, declarantFullName: "", declarantCapacity: "", signatureImage: "", declarationDate: new Date().toISOString() };
const emptyBank = { usesMalawiBankingSystem: true, bankName: "", bankBranch: "", bankAccountNo: "" };
const emptyOverseas = { purchaserName: "", country: "" };
const emptySupplier = { supplierName: "", country: "" };
const emptyRecord = { documentsRecordsKept: false, keptInHardCopy: false, keptMicrofilmed: false, keptComputerised: false, usesAccountingSystemLedger: false, usesHardCopyLedger: false, usesComputerisedLedger: false };

export default function AEOForm() {
    const [customsAgents, setCustomsAgents] = useState([{ ...emptyAgent }]);
    const [companyContacts, setCompanyContacts] = useState([{ ...emptyContact }]);
    const companyActivityTemplate = {
        isImporter: false,
        isExporter: false,
        isManufacturer: false,
        isProcessor: false,
        isExemptionsClaimant: false,
        isDrawbackClaimant: false,
        isCustomsLicenseHolder: false,
        requiresPermits: false,
        isCustomsClearingAgent: false,
        isFreightForwarder: false,
        isTransporter: false,
    };
    const [companyActivity, setCompanyActivity] = useState({ ...companyActivityTemplate });

     const recordKeepingsTemplate = {
        documentsRecordsKept: false,
        keptInHardCopy: false,
        keptMicrofilmed: false,
        keptComputerised: false,
        usesAccountingSystemLedger: false,
        usesHardCopyLedger: false,
        usesComputerisedLedger: false
    };
     const [recordKeepings, setRecordKeepings] = useState({ ...recordKeepingsTemplate });
    const [licenseDetails, setLicenseDetails] = useState([{ ...emptyLicense }]);
    const [exemptionItems, setExemptionItems] = useState([{ ...emptyExemption }]);
    const [drawbackItems, setDrawbackItems] = useState([{ ...emptyDrawback }]);
    const [bankingArrangements, setBankingArrangements] = useState([{ ...emptyBank }]);
    const [overseasPurchasers, setOverseasPurchasers] = useState([{ purchaserName: "", country: "" }]);
    const [overseasSuppliers, setOverseasSuppliers] = useState([{ supplierName: "", country: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [agentValidationLoading, setAgentValidationLoading] = useState<{[key: number]: boolean}>({});
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [validatedAgents, setValidatedAgents] = useState<{[key: number]: boolean}>({});

    const schema = z.object({
        tin: z.string().min(1, "TIN is required"),
        declarations: z.array(
            z.object({
                declarantFullName: z.string().optional(),
                declarantCapacity: z.string().optional(),
                declarationDate: z.string().optional(),
                signatureImage: z.string().nullable().optional(),
            })
        ),
    });

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { tin: "", declarations: [{ ...emptyDeclaration }] },
    });

    const { register, handleSubmit, watch, setValue } = methods;
    const watchDeclarations = watch("declarations");

    const aeo = useAEOProfile();
    const agentHook = useAgent();
    const [existingCompanyId, setExistingCompanyId] = useState<number | null>(null);
    const [companyInfo, setCompanyInfo] = useState<any>({ id: null, tin: '', tradingName: '', address: '', email: '', phonenumber: '', otp: null, deleted: false });

    // Normalize API response accepting camelCase or PascalCase
    const normalizeProfile = (raw: any) => {
        if (!raw) return null;
        const r = raw.company || raw || {};
        const get = (o: any, keys: string[]) => keys.reduce((acc, k) => acc ?? o?.[k], undefined);
        const pickFirstIfArray = (v: any) => Array.isArray(v) ? (v[0] ?? {}) : (v ?? {});
        const normalized: any = {
            id: get(r, ['id', 'Id', 'ID']),
            tin: get(r, ['tin', 'Tin']),
            // include raw company object when present
            company: (raw && raw.company) ? raw.company : (r || {}),
            customsAgents: get(raw, ['customsAgents', 'CustomsAgents']) || get(r, ['customsAgents']) || [],
            companyContacts: get(raw, ['companyContacts', 'CompanyContacts']) || get(r, ['companyContacts']) || [],
            // API sometimes returns companyActivities as an array — take the first record
            companyActivity: pickFirstIfArray(get(raw, ['companyActivity', 'companyActivities', 'CompanyActivity', 'CompanyActivities']) || get(r, ['companyActivity', 'companyActivities'])),
            licenseDetails: get(raw, ['licenseDetails', 'LicenseDetails']) || get(r, ['licenseDetails']) || [],
            exemptionItems: get(raw, ['exemptionItems', 'ExemptionItems']) || get(r, ['exemptionItems']) || [],
            drawbackItems: get(raw, ['drawbackItems', 'DrawbackItems']) || get(r, ['drawbackItems']) || [],
            declarations: get(raw, ['declarations', 'Declarations']) || get(r, ['declarations']) || [],
            bankingArrangements: get(raw, ['bankingArrangements', 'BankingArrangements']) || get(r, ['bankingArrangements']) || [],
            overseasPurchasers: get(raw, ['overseasPurchasers', 'OverseasPurchasers']) || get(r, ['overseasPurchasers']) || [],
            overseasSuppliers: get(raw, ['overseasSuppliers', 'OverseasSuppliers']) || get(r, ['overseasSuppliers']) || [],
            // API returns recordKeepings as an array in your sample — take first
            recordKeepings: pickFirstIfArray(get(raw, ['recordKeepings', 'RecordKeepings']) || get(r, ['recordKeepings'])),
        };
        return normalized;
    };

    const pickFlags = (obj: any, template: any) => {
        if (!obj || typeof obj !== 'object') return { ...template };
        const out: any = { ...template };
        for (const k of Object.keys(template)) {
            if (typeof obj[k] === 'boolean') out[k] = obj[k];
        }
        return out;
    };

    // Remove server-managed fields recursively before storing in state
    const stripServerFields = (v: any): any => {
        if (v === null || v === undefined) return v;
        if (Array.isArray(v)) return v.map(stripServerFields);
        if (typeof v !== 'object') return v;
        const copy: any = {};
        for (const key of Object.keys(v)) {
            if (['createdAt', 'updatedAt', 'companyId'].includes(key)) continue;
            const val = v[key];
            if (Array.isArray(val)) copy[key] = val.map(stripServerFields);
            else if (val && typeof val === 'object') copy[key] = stripServerFields(val);
            else copy[key] = val;
        }
        return copy;
    };

    useEffect(() => {
        const t = typeof window !== 'undefined' ? localStorage.getItem('Tin') : '';
        if (!t) return;
        let mounted = true;
        (async () => {
            try {
                const resp = await aeo.get(t);
                if (!mounted) return;
                const profile = normalizeProfile(resp);
                if (!profile) return;
                console.debug('Fetched AEO profile:', resp);
                if (profile.tin) setValue('tin', profile.tin);
                if (profile.company) setCompanyInfo(profile.company);
                if (profile.declarations && profile.declarations.length) setValue('declarations', profile.declarations.map(stripServerFields));
                if (profile.customsAgents) {
                    const agents = profile.customsAgents.length ? profile.customsAgents.map(stripServerFields) : [{ ...emptyAgent }];
                    setCustomsAgents(agents);
                    // Mark existing agents as already validated
                    const validatedState: {[key: number]: boolean} = {};
                    agents.forEach((_, index) => {
                        validatedState[index] = true; // Existing agents are considered validated
                    });
                    setValidatedAgents(validatedState);
                }
                if (profile.companyContacts) setCompanyContacts(profile.companyContacts.length ? profile.companyContacts.map(stripServerFields) : [{ ...emptyContact }]);
                if (profile.companyActivity) setCompanyActivity(pickFlags(profile.companyActivity, companyActivityTemplate));
                if (profile.licenseDetails) setLicenseDetails(profile.licenseDetails.length ? profile.licenseDetails.map(stripServerFields) : [{ ...emptyLicense }]);
                if (profile.exemptionItems) setExemptionItems(profile.exemptionItems.length ? profile.exemptionItems.map(stripServerFields) : [{ ...emptyExemption }]);
                if (profile.drawbackItems) setDrawbackItems(profile.drawbackItems.length ? profile.drawbackItems.map(stripServerFields) : [{ ...emptyDrawback }]);
                if (profile.bankingArrangements) setBankingArrangements(profile.bankingArrangements.length ? profile.bankingArrangements.map(stripServerFields) : [{ ...emptyBank }]);
                if (profile.overseasPurchasers) setOverseasPurchasers(profile.overseasPurchasers.length ? profile.overseasPurchasers.map(stripServerFields) : [{ ...emptyOverseas }]);
                if (profile.overseasSuppliers) setOverseasSuppliers(profile.overseasSuppliers.length ? profile.overseasSuppliers.map(stripServerFields) : [{ ...emptySupplier }]);
                if (profile.recordKeepings) setRecordKeepings(pickFlags(stripServerFields(profile.recordKeepings), recordKeepingsTemplate));
                // Accept id === 0 as valid existing id (use company.id if present)
                const idToUse = (profile.company && typeof profile.company.id !== 'undefined' && profile.company.id !== null) ? profile.company.id : profile.id;
                if (typeof idToUse !== 'undefined' && idToUse !== null) setExistingCompanyId(idToUse);
            } catch (err) {
                console.debug('No existing AEO profile or failed to fetch', err);
            }
        })();
        return () => { mounted = false; };
    }, []);
    // }, [aeo, setValue]);

    // Remove server-managed fields and undefineds
    const sanitizePayload = (p: any) => {
        if (!p) return p;
        const copy = JSON.parse(JSON.stringify(p));
        const stripFields = (obj: any) => {
            if (!obj || typeof obj !== 'object') return obj;
            for (const k of ['createdAt', 'updatedAt', 'companyId']) {
                if (k in obj) delete obj[k];
            }
            for (const key of Object.keys(obj)) {
                if (obj[key] === undefined) delete obj[key];
                else if (Array.isArray(obj[key])) {
                    obj[key] = obj[key].map((it: any) => stripFields(it)).filter((it: any) => it !== null && it !== undefined);
                } else if (typeof obj[key] === 'object') stripFields(obj[key]);
            }
            return obj;
        };
        return stripFields(copy);
    };

    // Filter out empty overseas entries
    const filterOverseas = (arr: any[], keyName: string) => (arr || []).filter(i => i && (i[keyName] || '').toString().trim() !== '');

    const handleFormSubmit = async (formData: any) => {
        setIsSubmitting(true);
        setMessage(null);

        const payload = {
                tin: formData.tin,
            customsAgents,
            companyContacts,
            companyActivities: [companyActivity],
            licenseDetails,
            exemptionItems,
            drawbackItems,
            declarations: formData.declarations,
            bankingArrangements,
            overseasPurchasers: filterOverseas(overseasPurchasers, 'purchaserName'),
            overseasSuppliers: filterOverseas(overseasSuppliers, 'supplierName'),
            recordKeepings: [recordKeepings],
        };


        try {
            const sanitized = sanitizePayload(payload);
            let data: any;
            // use company id for the PUT endpoint (even if 0)
            const companyIdForUpdate = (sanitized.company && typeof sanitized.company.id !== 'undefined' && sanitized.company.id !== null) ? sanitized.company.id : existingCompanyId;
            if (typeof companyIdForUpdate !== 'undefined' && companyIdForUpdate !== null) {
                data = await aeo.update(companyIdForUpdate, sanitized);
                setMessage('Company profile updated.');
            } else {
                data = await aeo.create(sanitized);
                setMessage('Company profile created.');
            }
            console.log('AEO profile response:', data);
            if (data && data.id) setExistingCompanyId(data.id);
            
            // Refresh the page after successful profile creation/update
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setMessage(`Submission failed: ${err?.message || err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Small helpers for dynamic arrays
    const addItem = (setter: any, template: any) => {
        setter((s: any[]) => [...s, { ...template }]);
        // Mark new agent as not validated
        if (setter === setCustomsAgents) {
            const newIndex = customsAgents.length;
            setValidatedAgents(prev => ({ ...prev, [newIndex]: false }));
        }
    };
    const removeItem = (setter: any, index: number) => {
        setter((s: any[]) => s.filter((_: any, i: number) => i !== index));
        // Clean up validation state when removing agents
        if (setter === setCustomsAgents) {
            setValidatedAgents(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
            });
        }
    };

    // Validation functions
    const validateAgentCodeField = async (agentCode: string, index: number) => {
        if (!agentCode.trim()) {
            setValidationErrors(prev => ({ 
                ...prev, 
                [`agent_${index}_code`]: 'Agent code is required' 
            }));
            return;
        }
        
        setAgentValidationLoading(prev => ({ ...prev, [index]: true }));
        setValidationErrors(prev => ({ ...prev, [`agent_${index}_code`]: '' }));
        
        try {
            const result = await agentHook.validateAgentCode(agentCode);
            
            if (result.success && result.data) {
                // Update the customs agents state
                setCustomsAgents(prev => {
                    const newAgents = [...prev];
                    newAgents[index] = {
                        ...newAgents[index],
                        agentName: result.data.name || newAgents[index].agentName,
                        agentTpin: result.data.tin || newAgents[index].agentTpin,
                        agentTelephoneNumber: result.data.phoneNumber || newAgents[index].agentTelephoneNumber,
                        agentEmailAddress: newAgents[index].agentEmailAddress
                    };
                    return newAgents;
                });
                
                // Mark agent as validated
                setValidatedAgents(prev => ({ ...prev, [index]: true }));
                
                // Clear any previous validation errors
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`agent_${index}_code`];
                    return newErrors;
                });
            } else {
                setValidationErrors(prev => ({ 
                    ...prev, 
                    [`agent_${index}_code`]: result.message || 'Invalid agent code. Please check and try again.' 
                }));
            }
        } catch (error) {
            setValidationErrors(prev => ({ 
                ...prev, 
                [`agent_${index}_code`]: 'Failed to validate agent code. Please try again.' 
            }));
        } finally {
            setAgentValidationLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    // Validation helper functions
    const validateTPIN = (tpin: string): boolean => {
        return /^\d{8}$/.test(tpin);
    };

    const validateHSCode = (hscode: string): boolean => {
        return /^\d{8}$/.test(hscode);
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateTPINField = (tpin: string, index: number) => {
        if (tpin && !validateTPIN(tpin)) {
            setValidationErrors(prev => ({ 
                ...prev, 
                [`agent_${index}_tpin`]: 'TPIN must be exactly 8 digits' 
            }));
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`agent_${index}_tpin`];
                return newErrors;
            });
        }
    };

    const validateHSCodeField = (hscode: string, index: number) => {
        if (hscode && !validateHSCode(hscode)) {
            setValidationErrors(prev => ({ 
                ...prev, 
                [`drawback_${index}_hscode`]: 'HS Code must be exactly 8 digits' 
            }));
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`drawback_${index}_hscode`];
                return newErrors;
            });
        }
    };

    const validateEmailField = (email: string, index: number, type: 'agent' | 'contact') => {
        if (email && !validateEmail(email)) {
            setValidationErrors(prev => ({ 
                ...prev, 
                [`${type}_${index}_email`]: 'Please enter a valid email address' 
            }));
        } else {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${type}_${index}_email`];
                return newErrors;
            });
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-6xl mx-auto p-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">AEO Company Profile</h1>
                            <p className="text-green-100">Malawi Revenue Authority - Advanced Economic Operator Registration</p>
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm text-green-100">
                            Complete your company profile to maintain your AEO status. All fields marked with * are required.
                        </p>
                    </div>
                    {/* Debug: show fetched state for verification */}
                    {/* <div className="mt-4">
                        <details className="text-sm text-gray-500">
                            <summary className="cursor-pointer">Debug: fetched profile state (click to expand)</summary>
                            <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2 text-xs text-gray-700 dark:text-gray-200">
{JSON.stringify({ existingCompanyId, tin: methods.getValues('tin'), customsAgents, companyContacts, companyActivity, licenseDetails, exemptionItems, drawbackItems, declarations: methods.getValues('declarations'), bankingArrangements, overseasPurchasers, overseasSuppliers, recordKeepings }, null, 2)}
                            </pre>
                        </details>
                    </div> */}
                </div>

                {/* Company Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Company Information</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Your company's basic identification details</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 md:col-span-4">
                            <FormInput
                                label="Company TIN"
                                {...register("tin")}
                                placeholder="20202020"
                                disabled
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Company Contacts */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Company Contacts</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Key personnel and contact information</p>
                            </div>
                        </div>
                        <AddButton 
                            onClick={() => addItem(setCompanyContacts, emptyContact)} 
                            text="Add Contact"
                        />
                    </div>
                    <div className="mt-3 space-y-6">
                        {companyContacts.map((c, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="col-span-12 md:col-span-2">
                                    <FormInput
                                        label="Title"
                                        value={c.title}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].title = e.target.value; return cc; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="First Name"
                                        value={c.firstName}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].firstName = e.target.value; return cc; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="Family Name"
                                        value={c.familyName}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].familyName = e.target.value; return cc; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="Position"
                                        value={c.positionTitle}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].positionTitle = e.target.value; return cc; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                    <RemoveButton onClick={() => removeItem(setCompanyContacts, i)} />
                                </div>
                                <div className="col-span-12 md:col-span-6 mt-2">
                                    <FormInput
                                        label="Email Address"
                                        type="email"
                                        value={c.emailAddress}
                                        onChange={(e) => {
                                            setCompanyContacts(s => { 
                                                const cc = [...s]; 
                                                cc[i].emailAddress = e.target.value; 
                                                return cc; 
                                            });
                                            validateEmailField(e.target.value, i, 'contact');
                                        }}
                                        placeholder="contact@company.mw"
                                        error={validationErrors[`contact_${i}_email`]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3 mt-2">
                                    <FormInput
                                        label="Direct Telephone"
                                        value={c.directTelephoneNumber}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].directTelephoneNumber = e.target.value; return cc; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3 mt-2">
                                    <FormInput
                                        label="Mobile Telephone"
                                        value={c.mobileTelephoneNumber}
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].mobileTelephoneNumber = e.target.value; return cc; })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Company Activity */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Company Activity</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Select all business activities that apply to your company</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(companyActivity).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <FormCheckbox
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                checked={value}
                                onChange={(e) => setCompanyActivity(s => ({ ...s, [key]: e.target.checked }))}
                            />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Record Keepings */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Record Keeping</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How your company maintains business records</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(recordKeepings).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <FormCheckbox
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                checked={value}
                                onChange={(e) => setRecordKeepings(s => ({ ...s, [key]: e.target.checked }))}
                            />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Banking Arrangements */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Banking Arrangements</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Provide your banking information for customs transactions</p>
                            </div>
                        </div>
                        <AddButton 
                            onClick={() => addItem(setBankingArrangements, emptyBank)} 
                            text="Add Bank Account"
                        />
                    </div>
                    <div className="mt-6 space-y-6">
                        {bankingArrangements.map((b, i) => (
                            <div key={i} className="relative p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="absolute top-4 right-4">
                                    <RemoveButton onClick={() => removeItem(setBankingArrangements, i)} />
                                </div>
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 md:col-span-4">
                                        <FormInput
                                            label="Bank Name"
                                            value={b.bankName}
                                            onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankName = e.target.value; return c; })}
                                            placeholder="e.g., National Bank of Malawi"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                    <FormInput
                                        label="Bank Branch"
                                            value={b.bankBranch}
                                            onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankBranch = e.target.value; return c; })}
                                            placeholder="e.g., Blantyre Branch"
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <FormInput
                                            label="Account Number"
                                        value={b.bankAccountNo}
                                        onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankAccountNo = e.target.value; return c; })}
                                            placeholder="123456789012"
                                    />
                                </div>
                                    <div className="col-span-12 mt-4">
                                        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <input
                                                type="checkbox"
                                                id={`malawi-banking-${i}`}
                                                checked={b.usesMalawiBankingSystem}
                                                onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].usesMalawiBankingSystem = e.target.checked; return c; })}
                                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label htmlFor={`malawi-banking-${i}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Uses Malawi Banking System
                                            </label>
                                </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Overseas Purchasers & Suppliers */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Overseas Purchasers</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">International buyers of your products</p>
                                </div>
                            </div>
                            <AddButton 
                                onClick={() => addItem(setOverseasPurchasers, { ...emptyOverseas })} 
                                text="Add Purchaser"
                            />
                        </div>
                        <div className="mt-3 space-y-4">
                            {overseasPurchasers.map((p, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="col-span-12 md:col-span-5">
                                        <FormInput
                                            label="Purchaser Name"
                                            value={p.purchaserName}
                                            onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].purchaserName = e.target.value; return c; })}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-5">
                                        <FormSelect
                                            label="Country"
                                            value={p.country}
                                            onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].country = e.target.value; return c; })}
                                            options={countries}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 flex justify-end">
                                        <RemoveButton onClick={() => removeItem(setOverseasPurchasers, i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Overseas Suppliers</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">International suppliers of your materials</p>
                                </div>
                            </div>
                            <AddButton 
                                onClick={() => addItem(setOverseasSuppliers, { ...emptySupplier })} 
                                text="Add Supplier"
                            />
                        </div>
                        <div className="mt-3 space-y-4">
                            {overseasSuppliers.map((s, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="col-span-12 md:col-span-5">
                                        <FormInput
                                            label="Supplier Name"
                                            value={s.supplierName}
                                            onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].supplierName = e.target.value; return c; })}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-5">
                                        <FormSelect
                                            label="Country"
                                            value={s.country}
                                            onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].country = e.target.value; return c; })}
                                            options={countries}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 flex justify-end">
                                        <RemoveButton onClick={() => removeItem(setOverseasSuppliers, i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* License Details & exemption/drawback */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 space-y-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">License Details</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Business licenses and approved operations</p>
                            </div>
                        </div>
                        <AddButton 
                            onClick={() => addItem(setLicenseDetails, emptyLicense)} 
                            text="Add License"
                        />
                    </div>
                    {licenseDetails.map((l, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="col-span-12 md:col-span-4">
                                <FormInput
                                    label="License Type"
                                    value={l.licenseType}
                                    onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].licenseType = e.target.value; return c; })}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-7">
                                <FormInput
                                    label="Approved Operations"
                                    value={l.approvedOperations}
                                    onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].approvedOperations = e.target.value; return c; })}
                                />
                            </div>
                            <div className="col-span-12 md:col-span-1 flex justify-end">
                                <RemoveButton onClick={() => removeItem(setLicenseDetails, i)} />
                            </div>
                        </div>
                    ))}

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Exemption Items</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items eligible for duty exemptions</p>
                                </div>
                            </div>
                            <AddButton 
                                onClick={() => addItem(setExemptionItems, emptyExemption)} 
                                text="Add Exemption"
                            />
                        </div>
                        <div className="mt-2 space-y-4">
                            {exemptionItems.map((ex, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="col-span-12 md:col-span-3">
                                        <FormInput
                                            label="CPC Code"
                                            value={ex.cpccode}
                                            onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].cpccode = e.target.value; return c; })}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <FormInput
                                            label="Description"
                                            value={ex.description}
                                            onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 flex justify-end">
                                        <RemoveButton onClick={() => removeItem(setExemptionItems, i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                    <div>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Drawback Items</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Items eligible for duty drawbacks</p>
                                </div>
                            </div>
                            <AddButton 
                                onClick={() => addItem(setDrawbackItems, emptyDrawback)} 
                                text="Add Drawback"
                            />
                        </div>
                        <div className="mt-2 space-y-4">
                            {drawbackItems.map((d, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="col-span-12 md:col-span-3">
                                        <FormInput
                                            label="HS Code"
                                            value={d.hscode}
                                            onChange={(e) => {
                                                setDrawbackItems(s => { 
                                                    const c = [...s]; 
                                                    c[i].hscode = e.target.value; 
                                                    return c; 
                                                });
                                                validateHSCodeField(e.target.value, i);
                                            }}
                                            placeholder="8 digits"
                                            maxLength={8}
                                            error={validationErrors[`drawback_${i}_hscode`]}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <FormInput
                                            label="Description"
                                            value={d.description}
                                            onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 flex justify-end">
                                        <RemoveButton onClick={() => removeItem(setDrawbackItems, i)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Customs Agents */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customs Agents</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add your authorized customs clearing agents</p>
                            </div>
                        </div>
                        <AddButton 
                            onClick={() => addItem(setCustomsAgents, emptyAgent)} 
                            text="Add Agent"
                        />
                    </div>
                    <div className="mt-6 space-y-6">
                        {customsAgents.map((a, i) => (
                            <div key={i} className="relative p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="absolute top-4 right-4">
                                    <RemoveButton onClick={() => removeItem(setCustomsAgents, i)} />
                                </div>
                                
                                {/* Agent Code and Validation Button */}
                                <div className="grid grid-cols-12 gap-4 mb-4">
                                    <div className="col-span-12 md:col-span-4">
                                    <FormInput
                                            label="Agent Code *"
                                            value={a.agentCode}
                                            onChange={(e) => {
                                                setCustomsAgents(s => { 
                                                    const c = [...s]; 
                                                    c[i].agentCode = e.target.value; 
                                                    return c; 
                                                });
                                                // Clear previous validation errors
                                                setValidationErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors[`agent_${i}_code`];
                                                    return newErrors;
                                                });
                                            }}
                                            placeholder="e.g., CA25001"
                                            error={validationErrors[`agent_${i}_code`]}
                                        />
                                    </div>
                                    {!validatedAgents[i] && (
                                        <div className="col-span-12 md:col-span-3 flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => validateAgentCodeField(a.agentCode, i)}
                                                disabled={!a.agentCode.trim() || agentValidationLoading[i]}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                                            >
                                                {agentValidationLoading[i] ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Validating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Validate
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {validatedAgents[i] && (
                                        <div className="col-span-12 md:col-span-3 flex items-end">
                                            <div className="w-full px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg font-medium flex items-center justify-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Validated
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-span-12 md:col-span-5">
                                        {validationErrors[`agent_${i}_code`] && (
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm text-red-700 dark:text-red-300">{validationErrors[`agent_${i}_code`]}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Agent Details */}
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-12 md:col-span-6">
                                        <FormInput
                                            label="Agent Name *"
                                        value={a.agentName}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentName = e.target.value; return c; })}
                                            placeholder={validatedAgents[i] ? "Pre-validated agent" : "Auto-populated from agent code"}
                                            disabled={validatedAgents[i] || !!a.agentCode}
                                    />
                                </div>
                                    <div className="col-span-12 md:col-span-6">
                                    <FormInput
                                            label="Email Address *"
                                            type="email"
                                            value={a.agentEmailAddress}
                                            onChange={(e) => {
                                                setCustomsAgents(s => { 
                                                    const c = [...s]; 
                                                    c[i].agentEmailAddress = e.target.value; 
                                                    return c; 
                                                });
                                                validateEmailField(e.target.value, i, 'agent');
                                            }}
                                            placeholder="agent@company.mw"
                                            error={validationErrors[`agent_${i}_email`]}
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-4">
                                        <FormInput
                                            label="TPIN *"
                                        value={a.agentTpin}
                                            onChange={(e) => {
                                                setCustomsAgents(s => { 
                                                    const c = [...s]; 
                                                    c[i].agentTpin = e.target.value; 
                                                    return c; 
                                                });
                                                validateTPINField(e.target.value, i);
                                            }}
                                            placeholder="8 digits"
                                            maxLength={8}
                                            error={validationErrors[`agent_${i}_tpin`]}
                                    />
                                </div>
                                    <div className="col-span-12 md:col-span-8">
                                    <FormInput
                                            label="Telephone Number *"
                                        value={a.agentTelephoneNumber}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTelephoneNumber = e.target.value; return c; })}
                                            placeholder="+265..."
                                    />
                                </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Declarations */}
                {/* <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="Declarations" />
                        <AddButton 
                            onClick={() => {
                                const arr = [...(watchDeclarations || [])];
                                arr.push({ ...emptyDeclaration });
                                setValue("declarations", arr);
                            }} 
                            text="Add declaration"
                        />
                    </div>
                    <div className="mt-3 space-y-6">
                        {watchDeclarations?.map((d: any, i: number) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="col-span-12 md:col-span-9">
                                    <DeclarationsField index={i} />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FileUpload label="Signature Image" value={d?.signatureImage || null} onChange={(base64) => setValue(`declarations.${i}.signatureImage` as any, base64)} />
                                    <div className="text-right mt-2">
                                        <button type="button" onClick={() => {
                                            const arr = [...(watchDeclarations || [])];
                                            arr.splice(i, 1);
                                            setValue("declarations", arr);
                                        }} className="text-red-500 hover:text-red-700 transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}
                
                {/* Submit Section */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                    <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Submit</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {typeof existingCompanyId !== 'undefined' && existingCompanyId !== null
                                        ? 'Update your company profile information'
                                        : 'Submit your AEO application for review'
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                        {message && (
                                <div className={`text-sm px-4 py-2 rounded-lg ${
                                    message.includes("failed") 
                                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" 
                                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                }`}>
                                {message}
                            </div>
                        )}
                    <button 
                        type="submit" 
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold flex items-center justify-center min-w-[220px] transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner />
                                        <span className="ml-3">Processing...</span>
                            </>
                        ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        {typeof existingCompanyId !== 'undefined' && existingCompanyId !== null
                                            ? 'Update Profile'
                                            : 'Submit Application'
                                        }
                                    </>
                        )}
                    </button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

// "use client";
// import React, { useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import FileUpload from "./FileUpload";
// import DeclarationsField from "./DeclarationsField";

// const emptyAgent = { agentName: "", agentTpin: "", agentTelephoneNumber: "", agentEmailAddress: "" };
// const emptyContact = { contactType: "Primary", title: "", firstName: "", familyName: "", positionTitle: "", emailAddress: "", directTelephoneNumber: "", mobileTelephoneNumber: "" };
// const emptyLicense = { licenseType: "", approvedOperations: "" };
// const emptyExemption = { cpccode: "", description: "" };
// const emptyDrawback = { hscode: "", description: "" };
// const emptyDeclaration = { isConfirmed: false, declarantFullName: "", declarantCapacity: "", signatureImage: "", declarationDate: new Date().toISOString() };
// const emptyBank = { usesMalawiBankingSystem: true, bankNameBranch: "", bankAccountNo: "" };
// const emptyOverseas = { purchaserName: "", country: "" };
// const emptySupplier = { supplierName: "", country: "" };
// const emptyRecord = { documentsRecordsKept: true, keptInHardCopy: false, keptMicrofilmed: false, keptComputerised: true, usesAccountingSystemLedger: true, usesHardCopyLedger: false, usesComputerisedLedger: true };

// export default function AEOForm() {
//     const [customsAgents, setCustomsAgents] = useState([{ ...emptyAgent }]);
//     const [companyContacts, setCompanyContacts] = useState([{ ...emptyContact }]);
//     const [companyActivity, setCompanyActivity] = useState({
//         isImporter: true,
//         isExporter: false,
//         isManufacturer: false,
//         isProcessor: false,
//         isExemptionsClaimant: false,
//         isDrawbackClaimant: false,
//         isCustomsLicenseHolder: false,
//         requiresPermits: false,
//         isCustomsClearingAgent: false,
//         isFreightForwarder: false,
//         isTransporter: false,
//     });

//      const [recordKeepings, setRecordKeepings] = useState({
//         documentsRecordsKept: true,
//         keptInHardCopy: false,
//         keptMicrofilmed: false,
//         keptComputerised: false,
//         usesAccountingSystemLedger: false,
//         usesHardCopyLedger: false,
//         usesComputerisedLedger: false
//     });
//     const [licenseDetails, setLicenseDetails] = useState([{ ...emptyLicense }]);
//     const [exemptionItems, setExemptionItems] = useState([{ ...emptyExemption }]);
//     const [drawbackItems, setDrawbackItems] = useState([{ ...emptyDrawback }]);
//     const [bankingArrangements, setBankingArrangements] = useState([{ ...emptyBank }]);
//     const [overseasPurchasers, setOverseasPurchasers] = useState([{ purchaserName: "", country: "" }]);
//     const [overseasSuppliers, setOverseasSuppliers] = useState([{ supplierName: "", country: "" }]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [message, setMessage] = useState<string | null>(null);

//     const schema = z.object({
//         tin: z.string().min(1, "TIN is required"),
//         declarations: z.array(
//             z.object({
//                 declarantFullName: z.string().optional(),
//                 declarantCapacity: z.string().optional(),
//                 declarationDate: z.string().optional(),
//                 signatureImage: z.string().nullable().optional(),
//             })
//         ),
//     });

//     const methods = useForm({
//         resolver: zodResolver(schema),
//         defaultValues: { tin: "", declarations: [{ ...emptyDeclaration }] },
//     });

//     const { register, handleSubmit, watch, setValue } = methods;
//     const watchDeclarations = watch("declarations");

//     const handleFormSubmit = async (formData: any) => {
//         setIsSubmitting(true);
//         setMessage(null);

//         const payload = {
//             tin: formData.tin,
//             customsAgents,
//             companyContacts,
//             companyActivity,
//             licenseDetails,
//             exemptionItems,
//             drawbackItems,
//             declarations: formData.declarations,
//             bankingArrangements,
//             overseasPurchasers,
//             overseasSuppliers,
//             recordKeepings,
//         };

//         try {
//             const res = await fetch("/aeo/applications/full", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(payload),
//             });
//             if (!res.ok) throw new Error(`Server responded ${res.status}`);
//             const data = await res.json();
//             setMessage("Application submitted successfully.");
//             console.log("AEO submission response:", data);
//             // Optionally reset form
//             // resetForm();
//         } catch (err: any) {
//             console.error(err);
//             setMessage(`Submission failed: ${err?.message || err}`);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Small helpers for dynamic arrays
//     const addItem = (setter: any, template: any) => setter((s: any[]) => [...s, { ...template }]);
//     const removeItem = (setter: any, index: number) => setter((s: any[]) => s.filter((_: any, i: number) => i !== index));

//     return (
//         <FormProvider {...methods}>
//             <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
//                 {/* <div className="grid grid-cols-12 gap-4">
//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Company TIN</label>
//                         <input {...register("tin")} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" placeholder="20202020" />
//                     </div>
//                 </div> */}

//                 {/* Company Contacts */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Contacts</h3>
//                         <button type="button" onClick={() => addItem(setCompanyContacts, emptyContact)} className="text-sm text-brand-500">+ Add contact</button>
//                     </div>
//                     <div className="mt-3 space-y-3">
//                         {companyContacts.map((c, i) => (
//                             <div key={i} className="grid grid-cols-12 gap-3 items-end">
//                                 <div className="col-span-12 md:col-span-2">
//                                     <label className="text-sm">Title</label>
//                                     <input value={c.title} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].title = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-3">
//                                     <label className="text-sm">First Name</label>
//                                     <input value={c.firstName} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].firstName = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-3">
//                                     <label className="text-sm">Family Name</label>
//                                     <input value={c.familyName} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].familyName = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-2">
//                                     <label className="text-sm">Position</label>
//                                     <input value={c.positionTitle} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].positionTitle = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-1">
//                                     <button type="button" onClick={() => removeItem(setCompanyContacts, i)} className="text-red-500">Remove</button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Company Activity */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Activity</h3>
//                     <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
//                         {Object.keys(companyActivity).map((k) => (
//                             <label key={k} className="flex items-center gap-2">
//                                 <input type="checkbox" checked={(companyActivity as any)[k]} onChange={(e) => setCompanyActivity(s => ({ ...s, [k]: e.target.checked }))} />
//                                 <span className="text-sm capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
//                             </label>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Record Keepings */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Record Keeping</h3>
//                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        
//                         {Object.keys(recordKeepings).map((k) => (
//                             <label key={k} className="flex items-center gap-2">
//                                 <input type="checkbox" checked={(companyActivity as any)[k]} onChange={(e) => setRecordKeepings(s => ({ ...s, [k]: e.target.checked }))} />
//                                 <span className="text-sm capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
//                             </label>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Banking Arrangements */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Banking Arrangements</h3>
//                         <button type="button" onClick={() => addItem(setBankingArrangements, emptyBank)} className="text-sm text-brand-500">+ Add</button>
//                     </div>
//                     <div className="mt-3 space-y-3">
//                         {bankingArrangements.map((b, i) => (
//                             <div key={i} className="grid grid-cols-12 gap-3 items-end">
//                                 <div className="col-span-12 md:col-span-4">
//                                     <label className="text-sm">Bank Branch</label>
//                                     <input value={b.bankNameBranch} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankNameBranch = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-4">
//                                     <label className="text-sm">Account No</label>
//                                     <input value={b.bankAccountNo} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankAccountNo = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-2">
//                                     <label className="text-sm">Uses Malawi Banking</label>
//                                     <select value={String(b.usesMalawiBankingSystem)} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].usesMalawiBankingSystem = e.target.value === 'true'; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800">
//                                         <option value="true">Yes</option>
//                                         <option value="false">No</option>
//                                     </select>
//                                 </div>
//                                 <div className="col-span-12 md:col-span-2 text-right">
//                                     <button type="button" onClick={() => removeItem(setBankingArrangements, i)} className="text-red-500">Remove</button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>

//                 {/* Overseas Purchasers & Suppliers */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow grid grid-cols-1 gap-4">
//                     <div>
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overseas Purchasers</h3>
//                             <button type="button" onClick={() => addItem(setOverseasPurchasers, { ...emptyOverseas })} className="text-sm text-brand-500">+ Add</button>
//                         </div>
//                         <div className="mt-3 space-y-2">
//                             {overseasPurchasers.map((p, i) => (
//                                 <div key={i} className="grid grid-cols-12 gap-2 items-end">
//                                     <div className="col-span-12 md:col-span-5">
//                                         <label className="text-sm">Purchaser Name</label>
//                                         <input value={p.purchaserName} onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].purchaserName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-5">
//                                         <label className="text-sm">Country</label>
//                                         <input value={p.country} onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].country = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-2 text-right">
//                                         <button type="button" onClick={() => removeItem(setOverseasPurchasers, i)} className="text-red-500">Remove</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div>
//                         <div className="flex items-center justify-between">
//                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overseas Suppliers</h3>
//                             <button type="button" onClick={() => addItem(setOverseasSuppliers, { ...emptySupplier })} className="text-sm text-brand-500">+ Add</button>
//                         </div>
//                         <div className="mt-3 space-y-2">
//                             {overseasSuppliers.map((s, i) => (
//                                 <div key={i} className="grid grid-cols-12 gap-2 items-end">
//                                     <div className="col-span-12 md:col-span-5">
//                                         <label className="text-sm">Supplier Name</label>
//                                         <input value={s.supplierName} onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].supplierName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-5">
//                                         <label className="text-sm">Country</label>
//                                         <input value={s.country} onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].country = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-2 text-right">
//                                         <button type="button" onClick={() => removeItem(setOverseasSuppliers, i)} className="text-red-500">Remove</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* License Details & exemption/drawback */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">License Details</h3>
//                         <button type="button" onClick={() => addItem(setLicenseDetails, emptyLicense)} className="text-sm text-brand-500">+ Add license</button>
//                     </div>
//                     {licenseDetails.map((l, i) => (
//                         <div key={i} className="grid grid-cols-12 gap-3 items-end">
//                             <div className="col-span-12 md:col-span-4">
//                                 <label className="text-sm">License Type</label>
//                                 <input value={l.licenseType} onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].licenseType = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                             </div>
//                             <div className="col-span-12 md:col-span-7">
//                                 <label className="text-sm">Approved Operations</label>
//                                 <input value={l.approvedOperations} onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].approvedOperations = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                             </div>
//                             <div className="col-span-12 md:col-span-1 text-right">
//                                 <button type="button" onClick={() => removeItem(setLicenseDetails, i)} className="text-red-500">Remove</button>
//                             </div>
//                         </div>
//                     ))}

//                     <div className="pt-2">
//                         <h4 className="font-medium">Exemption Items</h4>
//                         <button type="button" onClick={() => addItem(setExemptionItems, emptyExemption)} className="text-sm text-brand-500">+ Add</button>
//                         <div className="mt-2 space-y-2">
//                             {exemptionItems.map((ex, i) => (
//                                 <div key={i} className="grid grid-cols-12 gap-2 items-end">
//                                     <div className="col-span-12 md:col-span-3">
//                                         <label className="text-sm">CPC Code</label>
//                                         <input value={ex.cpccode} onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].cpccode = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-8">
//                                         <label className="text-sm">Description</label>
//                                         <input value={ex.description} onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-1 text-right">
//                                         <button type="button" onClick={() => removeItem(setExemptionItems, i)} className="text-red-500">Remove</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <div>
//                         <h4 className="font-medium">Drawback Items</h4>
//                         <button type="button" onClick={() => addItem(setDrawbackItems, emptyDrawback)} className="text-sm text-brand-500">+ Add</button>
//                         <div className="mt-2 space-y-2">
//                             {drawbackItems.map((d, i) => (
//                                 <div key={i} className="grid grid-cols-12 gap-2 items-end">
//                                     <div className="col-span-12 md:col-span-3">
//                                         <label className="text-sm">HS Code</label>
//                                         <input value={d.hscode} onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].hscode = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-8">
//                                         <label className="text-sm">Description</label>
//                                         <input value={d.description} onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                     </div>
//                                     <div className="col-span-12 md:col-span-1 text-right">
//                                         <button type="button" onClick={() => removeItem(setDrawbackItems, i)} className="text-red-500">Remove</button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </section>

//                 {/* Customs Agents */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customs Agents</h3>
//                         <button type="button" onClick={() => addItem(setCustomsAgents, emptyAgent)} className="text-sm text-brand-500">+ Add agent</button>
//                     </div>
//                     <div className="mt-3 space-y-3">
//                         {customsAgents.map((a, i) => (
//                             <div key={i} className="grid grid-cols-12 gap-3 items-end">
//                                 <div className="col-span-12 md:col-span-3">
//                                     <label className="text-sm">Agent Name</label>
//                                     <input value={a.agentName} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-2">
//                                     <label className="text-sm">TPIN</label>
//                                     <input value={a.agentTpin} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTpin = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-3">
//                                     <label className="text-sm">Telephone</label>
//                                     <input value={a.agentTelephoneNumber} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTelephoneNumber = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-3">
//                                     <label className="text-sm">Email</label>
//                                     <input value={a.agentEmailAddress} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentEmailAddress = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-1">
//                                     <button type="button" onClick={() => removeItem(setCustomsAgents, i)} className="text-red-500">Remove</button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//                 {/* Declarations */}
//                 <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Declarations</h3>
//                         <button type="button" onClick={() => {
//                             const arr = [...(watchDeclarations || [])];
//                             arr.push({ ...emptyDeclaration });
//                             setValue("declarations", arr);
//                         }} className="text-sm text-brand-500">+ Add</button>
//                     </div>
//                     <div className="mt-3 space-y-3">
//                         {watchDeclarations?.map((d: any, i: number) => (
//                             <div key={i} className="grid grid-cols-12 gap-3 items-end">
//                                 <div className="col-span-12 md:col-span-9">
//                                     <DeclarationsField index={i} />
//                                 </div>
//                                 <div className="col-span-12 md:col-span-3">
//                                     <FileUpload label="Signature Image" value={d?.signatureImage || null} onChange={(base64) => setValue(`declarations.${i}.signatureImage` as any, base64)} />
//                                     <div className="text-right mt-2">
//                                         <button type="button" onClick={() => {
//                                             const arr = [...(watchDeclarations || [])];
//                                             arr.splice(i, 1);
//                                             setValue("declarations", arr);
//                                         }} className="text-red-500">Remove</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </section>
//                 <div className="flex items-center gap-3">
//                     <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit AEO Application'}</button>
//                     {message && <div className="text-sm text-gray-600">{message}</div>}
//                 </div>
//             </form>
//         </FormProvider>
//     );
// }
