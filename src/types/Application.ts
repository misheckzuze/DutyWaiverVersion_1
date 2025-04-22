export interface ApplicationItem {
    description: string;
    hscode: string;
    quantity: number;
    value: number;
    currency: string;
    dutyAmount: number;
    uomId: number;
}

export interface ApplicationAttachment {
    documentType: string;
    filePath: string;
}

export interface ApplicationProps {
    userId: number;
    tin: string;
    submissionDate: string;
    applicationTypeId: number;
    status: "Draft" | "Submitted" | "Approved" | "Rejected";
    projectName: string;
    projectDescription: string;
    projectDistrict: string;
    projectPhysicalAddress: string;
    reasonForApplying: string;
    projectValue: number;
    currency: string;
    startDate: string;
    endDate: string;
    attachments: ApplicationAttachment[];
    items: ApplicationItem[];
}

export interface ApplicationSubmissionResponse extends ApplicationProps {
    id: number;
    referenceNumber: string;
    createdAt?: string;
    updatedAt?: string;
}