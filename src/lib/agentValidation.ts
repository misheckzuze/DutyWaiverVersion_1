import axios from './axios';

export interface AgentValidationResponse {
  success: boolean;
  data?: {
    agentCode: string;
    agentName: string;
    agentTpin?: string;
    agentTelephoneNumber?: string;
    agentEmailAddress?: string;
  };
  message?: string;
}

export const validateAgentCode = async (agentCode: string): Promise<AgentValidationResponse> => {
  try {
    const response = await axios.post('/api/v1/agents', {
      agentCode: agentCode
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Agent code validation failed'
    };
  }
};

export const validateTPIN = (tpin: string): boolean => {
  return /^\d{8}$/.test(tpin);
};

export const validateHSCode = (hscode: string): boolean => {
  return /^\d{8}$/.test(hscode);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
