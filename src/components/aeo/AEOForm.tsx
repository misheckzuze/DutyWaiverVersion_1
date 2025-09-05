"use client";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "./FileUpload";
import DeclarationsField from "./DeclarationsField";

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
            overseasPurchasers,
            overseasSuppliers,
            recordKeepings,
        };

        try {
            const res = await fetch("/aeo/applications/full", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Server responded ${res.status}`);
            const data = await res.json();
            setMessage("Application submitted successfully.");
            console.log("AEO submission response:", data);
            // Optionally reset form
            // resetForm();
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
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Company TIN</label>
                        <input {...register("tin")} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" placeholder="20202020" />
                    </div>
                </div> */}

                {/* Company Contacts */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Contacts</h3>
                        <button type="button" onClick={() => addItem(setCompanyContacts, emptyContact)} className="text-sm text-brand-500">+ Add contact</button>
                    </div>
                    <div className="mt-3 space-y-3">
                        {companyContacts.map((c, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 md:col-span-2">
                                    <label className="text-sm">Title</label>
                                    <input value={c.title} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].title = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-sm">First Name</label>
                                    <input value={c.firstName} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].firstName = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-sm">Family Name</label>
                                    <input value={c.familyName} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].familyName = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <label className="text-sm">Position</label>
                                    <input value={c.positionTitle} onChange={(e) => setCompanyContacts(s => { const cc = [...s]; cc[i].positionTitle = e.target.value; return cc; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-1">
                                    <button type="button" onClick={() => removeItem(setCompanyContacts, i)} className="text-red-500">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Company Activity */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Activity</h3>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.keys(companyActivity).map((k) => (
                            <label key={k} className="flex items-center gap-2">
                                <input type="checkbox" checked={(companyActivity as any)[k]} onChange={(e) => setCompanyActivity(s => ({ ...s, [k]: e.target.checked }))} />
                                <span className="text-sm capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Record Keepings */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Company Record Keeping</h3>
                     <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        
                        {Object.keys(recordKeepings).map((k) => (
                            <label key={k} className="flex items-center gap-2">
                                <input type="checkbox" checked={(companyActivity as any)[k]} onChange={(e) => setRecordKeepings(s => ({ ...s, [k]: e.target.checked }))} />
                                <span className="text-sm capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Banking Arrangements */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Banking Arrangements</h3>
                        <button type="button" onClick={() => addItem(setBankingArrangements, emptyBank)} className="text-sm text-brand-500">+ Add</button>
                    </div>
                    <div className="mt-3 space-y-3">
                        {bankingArrangements.map((b, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-sm">Bank Branch</label>
                                    <input value={b.bankNameBranch} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankNameBranch = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <label className="text-sm">Account No</label>
                                    <input value={b.bankAccountNo} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].bankAccountNo = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <label className="text-sm">Uses Malawi Banking</label>
                                    <select value={String(b.usesMalawiBankingSystem)} onChange={(e) => setBankingArrangements(s => { const c = [...s]; c[i].usesMalawiBankingSystem = e.target.value === 'true'; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800">
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div className="col-span-12 md:col-span-2 text-right">
                                    <button type="button" onClick={() => removeItem(setBankingArrangements, i)} className="text-red-500">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Overseas Purchasers & Suppliers */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow grid grid-cols-1 gap-4">
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overseas Purchasers</h3>
                            <button type="button" onClick={() => addItem(setOverseasPurchasers, { ...emptyOverseas })} className="text-sm text-brand-500">+ Add</button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {overseasPurchasers.map((p, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="text-sm">Purchaser Name</label>
                                        <input value={p.purchaserName} onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].purchaserName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="text-sm">Country</label>
                                        <input value={p.country} onChange={(e) => setOverseasPurchasers(s => { const c = [...s]; c[i].country = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 text-right">
                                        <button type="button" onClick={() => removeItem(setOverseasPurchasers, i)} className="text-red-500">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overseas Suppliers</h3>
                            <button type="button" onClick={() => addItem(setOverseasSuppliers, { ...emptySupplier })} className="text-sm text-brand-500">+ Add</button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {overseasSuppliers.map((s, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="text-sm">Supplier Name</label>
                                        <input value={s.supplierName} onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].supplierName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-5">
                                        <label className="text-sm">Country</label>
                                        <input value={s.country} onChange={(e) => setOverseasSuppliers(ss => { const c = [...ss]; c[i].country = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-2 text-right">
                                        <button type="button" onClick={() => removeItem(setOverseasSuppliers, i)} className="text-red-500">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* License Details & exemption/drawback */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">License Details</h3>
                        <button type="button" onClick={() => addItem(setLicenseDetails, emptyLicense)} className="text-sm text-brand-500">+ Add license</button>
                    </div>
                    {licenseDetails.map((l, i) => (
                        <div key={i} className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-12 md:col-span-4">
                                <label className="text-sm">License Type</label>
                                <input value={l.licenseType} onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].licenseType = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                            </div>
                            <div className="col-span-12 md:col-span-7">
                                <label className="text-sm">Approved Operations</label>
                                <input value={l.approvedOperations} onChange={(e) => setLicenseDetails(s => { const c = [...s]; c[i].approvedOperations = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                            </div>
                            <div className="col-span-12 md:col-span-1 text-right">
                                <button type="button" onClick={() => removeItem(setLicenseDetails, i)} className="text-red-500">Remove</button>
                            </div>
                        </div>
                    ))}

                    <div className="pt-2">
                        <h4 className="font-medium">Exemption Items</h4>
                        <button type="button" onClick={() => addItem(setExemptionItems, emptyExemption)} className="text-sm text-brand-500">+ Add</button>
                        <div className="mt-2 space-y-2">
                            {exemptionItems.map((ex, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="text-sm">CPC Code</label>
                                        <input value={ex.cpccode} onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].cpccode = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <label className="text-sm">Description</label>
                                        <input value={ex.description} onChange={(e) => setExemptionItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 text-right">
                                        <button type="button" onClick={() => removeItem(setExemptionItems, i)} className="text-red-500">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium">Drawback Items</h4>
                        <button type="button" onClick={() => addItem(setDrawbackItems, emptyDrawback)} className="text-sm text-brand-500">+ Add</button>
                        <div className="mt-2 space-y-2">
                            {drawbackItems.map((d, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-12 md:col-span-3">
                                        <label className="text-sm">HS Code</label>
                                        <input value={d.hscode} onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].hscode = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-8">
                                        <label className="text-sm">Description</label>
                                        <input value={d.description} onChange={(e) => setDrawbackItems(s => { const c = [...s]; c[i].description = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                    </div>
                                    <div className="col-span-12 md:col-span-1 text-right">
                                        <button type="button" onClick={() => removeItem(setDrawbackItems, i)} className="text-red-500">Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Customs Agents */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customs Agents</h3>
                        <button type="button" onClick={() => addItem(setCustomsAgents, emptyAgent)} className="text-sm text-brand-500">+ Add agent</button>
                    </div>
                    <div className="mt-3 space-y-3">
                        {customsAgents.map((a, i) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-sm">Agent Name</label>
                                    <input value={a.agentName} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentName = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-2">
                                    <label className="text-sm">TPIN</label>
                                    <input value={a.agentTpin} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTpin = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-sm">Telephone</label>
                                    <input value={a.agentTelephoneNumber} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentTelephoneNumber = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-3">
                                    <label className="text-sm">Email</label>
                                    <input value={a.agentEmailAddress} onChange={(e) => setCustomsAgents(s => { const c = [...s]; c[i].agentEmailAddress = e.target.value; return c; })} className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-gray-800" />
                                </div>
                                <div className="col-span-12 md:col-span-1">
                                    <button type="button" onClick={() => removeItem(setCustomsAgents, i)} className="text-red-500">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Declarations */}
                <section className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Declarations</h3>
                        <button type="button" onClick={() => {
                            const arr = [...(watchDeclarations || [])];
                            arr.push({ ...emptyDeclaration });
                            setValue("declarations", arr);
                        }} className="text-sm text-brand-500">+ Add</button>
                    </div>
                    <div className="mt-3 space-y-3">
                        {watchDeclarations?.map((d: any, i: number) => (
                            <div key={i} className="grid grid-cols-12 gap-3 items-end">
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
                                        }} className="text-red-500">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="flex items-center gap-3">
                    <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit AEO Application'}</button>
                    {message && <div className="text-sm text-gray-600">{message}</div>}
                </div>
            </form>
        </FormProvider>
    );
}
