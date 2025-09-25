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
