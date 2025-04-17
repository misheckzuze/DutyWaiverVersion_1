export interface ProjectDetails {
    projectName: string;
    projectDescription: string;
    projectType: string;
    projectLocation: string;
    reasonForApplying: string;
    projectValue: string;
    projectDuration: string;    
    startDate: Date | null;
    endDate: Date | null;
  }