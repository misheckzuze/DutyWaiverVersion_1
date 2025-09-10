import axios from '@/lib/axios';
import { useState, useCallback } from 'react';
import { ApplicationProps, ApplicationSubmissionResponse } from '@/types/Application';

export default function useApplication() {
    const [data, setData] = useState<ApplicationSubmissionResponse | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createDraft = useCallback(async (applicationData: ApplicationProps) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/v1/applications', applicationData); 
            setData(response.data.data);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to create draft');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateApplication = useCallback(async (id: number, applicationData: any) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await axios.post(`/api/v1/applications/update`, applicationData);
    setData(response.data.data);
    return response.data;
  } catch (error: any) {
    setError(error.response?.data?.message || error.message || 'Failed to update application');
    throw error;
  } finally {
    setIsLoading(false);
  }
}, []);


    const submitApplication = useCallback(async (applicationId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`/api/v1/applications/${applicationId}/submit`);
            setData(response.data.data);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to submit application');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getApplicationsByUser = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const authData = JSON.parse(localStorage.getItem('authData') || '{}');
            const userId = authData?.userId;

            if (!userId) throw new Error('User ID not found.');

            const response = await axios.get(`/api/v1/applications/user/${userId}`);
            setApplications(response.data.data);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to retrieve applications');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getApplicationsByTIN = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const authData = JSON.parse(localStorage.getItem('authData') || '{}');
            const tin = authData?.id;
            console.log("the tin is: " + tin);

            if (!tin) throw new Error('TIN not found.');

            const response = await axios.get(`/api/v1/applications/user/${tin}`);
            setApplications(response.data.data);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to retrieve applications');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getApplicationsByCompanyId = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const authData = JSON.parse(localStorage.getItem('authData') || '{}');
            const companyId = authData?.companyId || 0; 
            console.log("The company ID is: " + companyId);

            if (companyId === undefined || companyId === null) {
                throw new Error('Company ID not found.');
            }
            console.log("hitted");
            const response = await axios.get(`/api/v1/applications/company/${companyId}`);
            setApplications(response.data.data);
            console.log("hitted");
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to retrieve applications');
            console.log("hitted " + error.response?.data?.message || error.message );
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // This is the key function causing your infinite loop
    const getApplicationById = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/v1/applications/${id}`);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch application');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed

    const clearApplication = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    const getApplicationTypes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/v1/applicationtypes`);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch application types');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getDistricts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/v1/districts`);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch districts');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getUnitOfMeasure = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/v1/unitofmeasure`);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch districts');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAttachmentTypes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/api/v1/attachmenttypes`);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to fetch districts');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        application: data,
        applications,
        error,
        isLoading,
        createDraft,
        updateApplication,
        submitApplication,
        getApplicationsByTIN,
        getApplicationById,
        clearApplication,
        getApplicationTypes,
        getDistricts,
        getUnitOfMeasure,
        getAttachmentTypes,
        getApplicationsByCompanyId,
    };
}