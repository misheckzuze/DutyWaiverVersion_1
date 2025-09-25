import { useCallback, useState } from 'react';

interface TaxpayerResponse {
  TaxpayerName: string;
  ContactNumber: string | null;
  TPIN: string;
  idType: string;
  idNumber: string;
  TaxOffice: string;
  TradingName: string;
  PrimarySector: string;
  RegisteredTaxTypes: { TaxType: string; CommencementDate: string }[];
  EmailAddress: string;
  BusinessRegistrationNumber: string;
}

export function useTaxpayerService() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateTIN = useCallback(async (tin: string): Promise<TaxpayerResponse | null> => {
    if (!/^\d{8}$/.test(tin)) {
      setError('TIN must be exactly 8 digits');
      return null;
    }
    setIsValidating(true);
    setError(null);
    try {
      // Call internal POST proxy to avoid CORS
      const resp = await fetch('/api/esb/validateTIN', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ TIN: tin })
      });

      if (resp.ok) {
        const data: TaxpayerResponse = await resp.json();
        return data;
      }

      // ESB returns 404 with plain text "TIN was not found"
      const text = await resp.text();
      if (resp.status === 404 && text?.toLowerCase().includes('tin was not found')) {
        setError('TIN was not found');
        return null;
      }
      setError(text || `Validation failed (${resp.status})`);
      return null;
    } catch (e: any) {
      setError(e?.message || 'Failed to validate TIN');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { validateTIN, isValidating, error };
}


