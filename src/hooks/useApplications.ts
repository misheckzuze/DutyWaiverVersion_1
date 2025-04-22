import axios from '@/lib/axios';
import { useState } from 'react';
import { ApplicationProps, ApplicationSubmissionResponse } from '@/types/Application';

export default function useApplication() {
    const [data, setData] = useState<ApplicationSubmissionResponse | null>(null);
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

    const clearApplication = () => {
        setData(null);
        setError(null);
    };

    return { 
        application: data, 
        error, 
        isLoading, 
        createDraft, 
        submitApplication,
        clearApplication
    };
}