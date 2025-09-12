import { useCallback } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '';

function authHeaders(contentType = 'application/json'): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': contentType };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function apiUrl(path: string) {
  return BASE ? `${BASE}${path}` : path;
}

export async function getAttachmentTypes() {
  const url = apiUrl(`/aeo/attachments`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch attachment types: ${res.status} ${text}`);
  }
  return res.json();
}

// Upload a file using multipart/form-data; API returns uploaded file info including url/id
export async function uploadAttachment(file: File, attachmentId?: number) {
  const url = apiUrl(`/aeo/attachments`);
  const fd = new FormData();
  fd.append('file', file);
  if (typeof attachmentId !== 'undefined') fd.append('attachmentId', String(attachmentId));

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { method: 'POST', headers, body: fd });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to upload attachment: ${res.status} ${text}`);
  }
  return res.json();
}

export async function createApplication(payload: any) {
  const url = apiUrl(`/aeo/applications`);
  const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create application: ${res.status} ${text}`);
  }
  return res.json();
}

/** Get all AEO applications by TIN stored in localStorage under key "Tin" */
export async function getAllAEOApplications() {
  if (typeof window === 'undefined') {
    throw new Error('getAllAEOApplications must be called in the browser.');
  }
  const tin = localStorage.getItem('Tin');
  if (!tin) throw new Error('TIN not found in localStorage under key "Tin".');

  const url = apiUrl(`/aeo/applications/by-tin/${encodeURIComponent(tin)}`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch AEO applications: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getAEOApplicationById(id: number) {
  const url = apiUrl(`/aeo/applications/${id}`);
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch AEO application: ${res.status} ${text}`);
  }
  return res.json();
}

export default function useAEOApplication() {
  return {
    getAttachmentTypes: useCallback(() => getAttachmentTypes(), []),
    uploadAttachment: useCallback((file: File, id?: number) => uploadAttachment(file, id), []),
    createApplication: useCallback((payload: any) => createApplication(payload), []),
    getAllAEOApplications: useCallback(() => getAllAEOApplications(), []),
    getAEOApplicationById: useCallback((id: number) => getAEOApplicationById(id), []),
  };
}
