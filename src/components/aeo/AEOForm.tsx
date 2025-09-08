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
import DatePicker from "./DatePicker";

const emptyAgent = { agentName: "", agentTpin: "", agentTelephoneNumber: "", agentEmailAddress: "" };
const emptyContact = { contactType: "Primary", title: "", firstName: "", familyName: "", positionTitle: "", emailAddress: "", directTelephoneNumber: "", mobileTelephoneNumber: "" };
const emptyLicense = { licenseType: "", approvedOperations: "" };
const emptyExemption = { cpccode: "", description: "" };
const emptyDrawback = { hscode: "", description: "" };
const emptyDeclaration = { isConfirmed: false, declarantFullName: "", declarantCapacity: "", signatureImage: "", declarationDate: new Date().toISOString() };
const emptyBank = { usesMalawiBankingSystem: true, bankNameBranch: "", bankAccountNo: "" };
const emptyOverseas = { purchaserName: "", country: "" };
const emptySupplier = { supplierName: "", country: "" };
const emptyRecord = { documentsRecordsKept: true, keptInHardCopy: false, keptMicrofilmed: false, keptComputerised: true, usesAccountingSystemLedger: true, usesHardCopyLedger: false, usesComputerisedLedger: true };

export default function AEOForm() {
    const [customsAgents, setCustomsAgents] = useState([{ ...emptyAgent }]);
    const [companyContacts, setCompanyContacts] = useState([{ ...emptyContact }]);
    const [companyActivity, setCompanyActivity] = useState({
        isImporter: true,
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
    });

     const [recordKeepings, setRecordKeepings] = useState({
        documentsRecordsKept: true,
        keptInHardCopy: false,
        keptMicrofilmed: false,
        keptComputerised: false,
        usesAccountingSystemLedger: false,
        usesHardCopyLedger: false,
        usesComputerisedLedger: false
    });
    const [licenseDetails, setLicenseDetails] = useState([{ ...emptyLicense }]);
    const [exemptionItems, setExemptionItems] = useState([{ ...emptyExemption }]);
    const [drawbackItems, setDrawbackItems] = useState([{ ...emptyDrawback }]);
    const [bankingArrangements, setBankingArrangements] = useState([{ ...emptyBank }]);
    const [overseasPurchasers, setOverseasPurchasers] = useState([{ purchaserName: "", country: "" }]);
    const [overseasSuppliers, setOverseasSuppliers] = useState([{ supplierName: "", country: "" }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

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
    const [existingCompanyId, setExistingCompanyId] = useState<number | null>(null);

    // Normalize API response accepting camelCase or PascalCase
    const normalizeProfile = (raw: any) => {
        if (!raw) return null;
        const r = raw.company || raw || {};
        const get = (o: any, keys: string[]) => keys.reduce((acc, k) => acc ?? o?.[k], undefined);
        const pickFirstIfArray = (v: any) => Array.isArray(v) ? (v[0] ?? {}) : (v ?? {});
        const normalized: any = {
            id: get(r, ['id', 'Id', 'ID']),
            tin: get(r, ['tin', 'Tin']),
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
                if (profile.declarations && profile.declarations.length) setValue('declarations', profile.declarations);
                if (profile.customsAgents) setCustomsAgents(profile.customsAgents.length ? profile.customsAgents : [{ ...emptyAgent }]);
                if (profile.companyContacts) setCompanyContacts(profile.companyContacts.length ? profile.companyContacts : [{ ...emptyContact }]);
                if (profile.companyActivity) setCompanyActivity(profile.companyActivity);
                if (profile.licenseDetails) setLicenseDetails(profile.licenseDetails.length ? profile.licenseDetails : [{ ...emptyLicense }]);
                if (profile.exemptionItems) setExemptionItems(profile.exemptionItems.length ? profile.exemptionItems : [{ ...emptyExemption }]);
                if (profile.drawbackItems) setDrawbackItems(profile.drawbackItems.length ? profile.drawbackItems : [{ ...emptyDrawback }]);
                if (profile.bankingArrangements) setBankingArrangements(profile.bankingArrangements.length ? profile.bankingArrangements : [{ ...emptyBank }]);
                if (profile.overseasPurchasers) setOverseasPurchasers(profile.overseasPurchasers.length ? profile.overseasPurchasers : [{ ...emptyOverseas }]);
                if (profile.overseasSuppliers) setOverseasSuppliers(profile.overseasSuppliers.length ? profile.overseasSuppliers : [{ ...emptySupplier }]);
                if (profile.recordKeepings) setRecordKeepings(profile.recordKeepings);
                // Accept id === 0 as valid existing id
                if (profile.id !== undefined && profile.id !== null) setExistingCompanyId(profile.id);
            } catch (err) {
                console.debug('No existing AEO profile or failed to fetch', err);
            }
        })();
        return () => { mounted = false; };
    }, [aeo, setValue]);

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
            companyActivity,
            licenseDetails,
            exemptionItems,
            drawbackItems,
            declarations: formData.declarations,
            bankingArrangements,
            overseasPurchasers: filterOverseas(overseasPurchasers, 'purchaserName'),
            overseasSuppliers: filterOverseas(overseasSuppliers, 'supplierName'),
            recordKeepings,
        };

        try {
            const sanitized = sanitizePayload(payload);
            let data: any;
            if (existingCompanyId) {
                data = await aeo.update(existingCompanyId, sanitized);
                setMessage('Company profile updated.');
            } else {
                data = await aeo.create(sanitized);
                setMessage('Company profile created.');
            }
            console.log('AEO profile response:', data);
            if (data && data.id) setExistingCompanyId(data.id);
        } catch (err: any) {
            console.error(err);
            setMessage(`Submission failed: ${err?.message || err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Small helpers for dynamic arrays
    const addItem = (setter: any, template: any) => setter((s: any[]) => [...s, { ...template }]);
    const removeItem = (setter: any, index: number) => setter((s: any[]) => s.filter((_: any, i: number) => i !== index));

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-6xl mx-auto p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">AEO Application</h1>
                    <p className="text-gray-600 dark:text-gray-300">Advanced Economic Operator Registration Form</p>
                    {/* Debug: show fetched state for verification */}
                    <div className="mt-4">
                        <details className="text-sm text-gray-500">
                            <summary className="cursor-pointer">Debug: fetched profile state (click to expand)</summary>
                            <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded mt-2 text-xs text-gray-700 dark:text-gray-200">
{JSON.stringify({ existingCompanyId, tin: methods.getValues('tin'), customsAgents, companyContacts, companyActivity, licenseDetails, exemptionItems, drawbackItems, declarations: methods.getValues('declarations'), bankingArrangements, overseasPurchasers, overseasSuppliers, recordKeepings }, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>

                {/* TIN Field */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <SectionHeader title="Company Information" />
                    <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-12 md:col-span-4">
                            <FormInput
                                label="Company TIN"
                                {...register("tin")}
                                placeholder="20202020"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Company Contacts */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="Company Contacts" />
                        <AddButton 
                            onClick={() => addItem(setCompanyContacts, emptyContact)} 
                            text="Add contact"
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
                                        onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].emailAddress = e.target.value; return cc; })}
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
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <SectionHeader title="Company Activity" />
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(companyActivity).map(([key, value]) => (
                            <FormCheckbox
                                key={key}
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                checked={value}
                                onChange={(e) => setCompanyActivity(s => ({ ...s, [key]: e.target.checked }))}
                            />
                        ))}
                    </div>
                </section>

                {/* Record Keepings */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <SectionHeader title="Company Record Keeping" />
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(recordKeepings).map(([key, value]) => (
                            <FormCheckbox
                                key={key}
                                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                checked={value}
                                onChange={(e) => setRecordKeepings(s => ({ ...s, [key]: e.target.checked }))}
                            />
                        ))}
                    </div>
                </section>

                {/* Banking Arrangements */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="Banking Arrangements" />
                        <AddButton 
                            onClick={() => addItem(setBankingArrangements, emptyBank)} 
                            text="Add bank"
                        />
                    </div>
                    <div className="mt-3 space-y-6">
                        {bankingArrangements.map((b, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="col-span-12 md:col-span-5">
                                    <FormInput
                                        label="Bank Branch"
                                        value={b.bankNameBranch}
                                        onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankNameBranch = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <FormInput
                                        label="Account No"
                                        value={b.bankAccountNo}
                                        onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankAccountNo = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <FormSelect
                                        label="Uses Malawi Banking"
                                        value={String(b.usesMalawiBankingSystem)}
                                        onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].usesMalawiBankingSystem = e.target.value === 'true'; return c; })}
                                        options={[
                                            { value: "true", label: "Yes" },
                                            { value: "false", label: "No" }
                                        ]}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                    <RemoveButton onClick={() => removeItem(setBankingArrangements, i)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Overseas Purchasers & Suppliers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader title="Overseas Purchasers" />
                            <AddButton 
                                onClick={() => addItem(setOverseasPurchasers, { ...emptyOverseas })} 
                                text="Add purchaser"
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

                    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader title="Overseas Suppliers" />
                            <AddButton 
                                onClick={() => addItem(setOverseasSuppliers, { ...emptySupplier })} 
                                text="Add supplier"
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
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="License Details" />
                        <AddButton 
                            onClick={() => addItem(setLicenseDetails, emptyLicense)} 
                            text="Add license"
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

                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader title="Exemption Items" />
                            <AddButton 
                                onClick={() => addItem(setExemptionItems, emptyExemption)} 
                                text="Add exemption"
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

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader title="Drawback Items" />
                            <AddButton 
                                onClick={() => addItem(setDrawbackItems, emptyDrawback)} 
                                text="Add drawback"
                            />
                        </div>
                        <div className="mt-2 space-y-4">
                            {drawbackItems.map((d, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="col-span-12 md:col-span-3">
                                        <FormInput
                                            label="HS Code"
                                            value={d.hscode}
                                            onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].hscode = e.target.value; return c; })}
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
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="Customs Agents" />
                        <AddButton 
                            onClick={() => addItem(setCustomsAgents, emptyAgent)} 
                            text="Add agent"
                        />
                    </div>
                    <div className="mt-3 space-y-6">
                        {customsAgents.map((a, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="Agent Name"
                                        value={a.agentName}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentName = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <FormInput
                                        label="TPIN"
                                        value={a.agentTpin}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTpin = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="Telephone"
                                        value={a.agentTelephoneNumber}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTelephoneNumber = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <FormInput
                                        label="Email"
                                        type="email"
                                        value={a.agentEmailAddress}
                                        onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentEmailAddress = e.target.value; return c; })}
                                    />
                                </div>
                                <div className="col-span-12 md:col-span-1 flex justify-end">
                                    <RemoveButton onClick={() => removeItem(setCustomsAgents, i)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Declarations */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
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
                </section>
                
                {/* Submit Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center justify-between">
                    <div>
                        {message && (
                            <div className={`text-sm ${message.includes("failed") ? "text-red-600" : "text-green-600"}`}>
                                {message}
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center min-w-[200px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner />
                                <span className="ml-2">Submitting...</span>
                            </>
                        ) : (
                            'Submit AEO Application'
                        )}
                    </button>
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
