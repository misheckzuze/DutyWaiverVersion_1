"use client";
import { useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '';

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getProfileByTin(tin?: string) {
  const t = tin ?? (typeof window !== 'undefined' ? localStorage.getItem('Tin') : '');
  const url = BASE ? `${BASE}/aeo/profile/company/tin/${t}` : `/aeo/profile/company/tin/${t}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch profile: ${res.status} ${text}`);
  }
  return res.json();
}

export async function createProfile(payload: any) {
  const url = BASE ? `${BASE}/aeo/profile/company` : `/aeo/profile/company`;
  const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to create profile: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateProfile(id: number | string, payload: any) {
  const url = BASE ? `${BASE}/aeo/profile/company/${id}` : `/aeo/profile/company/${id}`;
  const res = await fetch(url, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to update profile: ${res.status} ${text}`);
  }
  return res.json();
}

// Lightweight hook-style wrapper for convenience
export default function useAEOProfile() {
  const get = useCallback((tin?: string) => getProfileByTin(tin), []);
  const create = useCallback((payload: any) => createProfile(payload), []);
  const update = useCallback((id: number | string, payload: any) => updateProfile(id, payload), []);
  return { get, create, update };
}
