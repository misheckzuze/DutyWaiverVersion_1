export interface Attachment {
    id: string;
    type: string;
    documentType: string;
    filePath: string;
    file: File | null;
  }