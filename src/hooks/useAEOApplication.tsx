"use client";
import { createContext, useContext, ReactNode, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function createApplication(payload: any) {
  const url = BASE ? `${BASE}/api/v1/applications` : `/api/v1/applications`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create application: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getApplication(id: number | string) {
  const url = BASE ? `${BASE}/api/v1/applications/${id}` : `/api/v1/applications/${id}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch application: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateApplication(id: number | string, payload: any) {
  const url = BASE ? `${BASE}/api/v1/applications/${id}` : `/api/v1/applications/${id}`;
  const res = await fetch(url, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to update application: ${res.status} ${text}`);
  }
  return res.json();
}

// lightweight hook
export default function useAEOApplication() {
  const create = useCallback((payload: any) => createApplication(payload), []);
  const get = useCallback((id: number | string) => getApplication(id), []);
  const update = useCallback((id: number | string, payload: any) => updateApplication(id, payload), []);
  return { create, get, update };
}
