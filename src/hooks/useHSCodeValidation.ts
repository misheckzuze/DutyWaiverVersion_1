import { useState } from 'react';
import axiosInstance from '@/lib/axios';

interface HSCodeValidationResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    code: string;
    description: string;
    unitOfMeasureId: number;
    isValid: boolean;
    createdAt: string;
    updatedAt: string | null;
    deleted: boolean;
    unitOfMeasures: {
      id: number;
      code: string;
      description: string;
      deleted: boolean;
    }[];
  } | null;
}

interface HSCodeValidationResult {
  isValid: boolean;
  description: string;
  unitOfMeasure: string;
  unitOfMeasureId: number;
}

export const useHSCodeValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateHSCode = async (hsCode: string): Promise<HSCodeValidationResult | null> => {
    if (!hsCode || hsCode.length !== 8 || !/^\d+$/.test(hsCode)) {
      setValidationError('HS Code must be exactly 8 digits');
      return null;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await axiosInstance.post<HSCodeValidationResponse>('/api/v1/hscode/validate', {
        hsCode: hsCode
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        return {
          isValid: true,
          description: data.description,
          unitOfMeasure: data.unitOfMeasures[0]?.code || '',
          unitOfMeasureId: data.unitOfMeasureId
        };
      } else {
        setValidationError(response.data.message || 'HS Code is not available or invalid');
        return null;
      }
    } catch (error: any) {
      console.error('HS Code validation error:', error);
      setValidationError(error.response?.data?.message || 'Failed to validate HS Code');
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  const clearValidationError = () => {
    setValidationError(null);
  };

  return {
    validateHSCode,
    isValidating,
    validationError,
    clearValidationError
  };
};

export interface BatchValidationItem {
  input: string;
  success: boolean;
  message: string;
  data: HSCodeValidationResponse['data'];
}

interface HSCodeBatchValidationResponse {
  success: boolean;
  message: string;
  data: BatchValidationItem[];
}

export const useHSCodeBatchValidation = () => {
  const [isBatchValidating, setIsBatchValidating] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const validateBatch = async (hsCodes: string[]): Promise<BatchValidationItem[] | null> => {
    const filtered = hsCodes.filter(code => /^\d{8}$/.test(code));
    if (filtered.length === 0) {
      setBatchError('No valid 8-digit HS Codes found');
      return null;
    }

    setIsBatchValidating(true);
    setBatchError(null);

    try {
      const response = await axiosInstance.post<HSCodeBatchValidationResponse>('/api/v1/hscode/validate/batch', {
        hsCodes: filtered
      });
      if (response.data.success) {
        return response.data.data;
      }
      setBatchError(response.data.message || 'Batch validation failed');
      return null;
    } catch (error: any) {
      console.error('HS Code batch validation error:', error);
      setBatchError(error.response?.data?.message || 'Failed to validate HS Codes');
      return null;
    } finally {
      setIsBatchValidating(false);
    }
  };

  const clearBatchError = () => setBatchError(null);

  return { validateBatch, isBatchValidating, batchError, clearBatchError };
};
