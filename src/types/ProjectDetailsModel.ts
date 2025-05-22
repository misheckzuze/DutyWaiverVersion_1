export interface ProjectDetails {
  projectName: string;
  projectDescription: string;
  projectType: string;
  projectDistrict: string;
  projectPhysicalAddress: string;
  reasonForApplying: string;
  projectValue: string;
  projectDurationYears: string;
  projectDurationMonths: string;
  startDate: Date | null;
  endDate: Date | null;
}