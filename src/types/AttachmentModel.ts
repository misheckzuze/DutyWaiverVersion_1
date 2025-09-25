export interface Attachment {
  id: string;
  type: string;
  // Can be a File (new upload) or a string filename when loaded from the API
  file: File | string | null;
  // New fields populated after successful upload
  attachmentId?: number;
  relativePath?: string;
  uploaded?: boolean;
  progress?: number;
}