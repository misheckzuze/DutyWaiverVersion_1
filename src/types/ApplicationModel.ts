// types.ts or at the top of your file
export interface Application {
    id: string;
    projectName: string;
    projectType: string;
    projectValue: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
  }
  