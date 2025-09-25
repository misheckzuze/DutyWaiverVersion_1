import axios from '@/lib/axios';
import { useState } from 'react';

export interface AgentData {
    agentCode: string;
    name: string;
    address: string;
    address2: string;
    address3: string;
    address4: string;
    phoneNumber: string;
    tin: string | null;
    isActive: boolean;
    isBroker: boolean;
}

export interface AgentValidationResponse {
    success: boolean;
    message: string;
    data: AgentData;
}

export default function useAgent() {
    const [data, setData] = useState<AgentData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validateAgentCode = async (agentCode: string): Promise<AgentValidationResponse> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/v1/agents', {
                agentCode: agentCode
            });
            
            const result: AgentValidationResponse = {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
            
            setData(response.data.data);
            return result;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to validate agent code';
            setError(errorMessage);
            
            const result: AgentValidationResponse = {
                success: false,
                message: errorMessage,
                data: {} as AgentData
            };
            
            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const clearAgent = () => {
        setData(null);
        setError(null);
    };

    return {
        agent: data,
        error,
        isLoading,
        validateAgentCode,
        clearAgent,
    };
}
