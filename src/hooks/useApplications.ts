import axios from '@/lib/axios';
import { useState } from 'react';
import { ApplicationProps, ApplicationSubmissionResponse } from '@/types/Application';

export default function useApplication() {
    const [data, setData] = useState<ApplicationSubmissionResponse | null>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const createDraft = async (applicationData: ApplicationProps) => {
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
    };

    const submitApplication = async (applicationId: number) => {
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
    };

    const getApplicationsByTIN = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const authData = JSON.parse(localStorage.getItem('authData') || '{}');
            const tin = authData?.tin || authData?.Tin;

            if (!tin) throw new Error('TIN not found in local storage.');

            const response = await axios.post('/api/v1/applications/by-tin', { Tin: tin });
            setApplications(response.data.data);
            return response.data.data;
        } catch (error: any) {
            setError(error.response?.data?.message || error.message || 'Failed to retrieve applications');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const clearApplication = () => {
        setData(null);
        setError(null);
    };

    return {
        application: data,
        applications,
        error,
        isLoading,
        createDraft,
        submitApplication,
        getApplicationsByTIN,
        clearApplication
    };
}
