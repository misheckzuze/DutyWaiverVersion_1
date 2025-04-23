// hooks/useUsers.ts
import { useState } from 'react';

type UserResponse = {
  success: boolean;
  message: string;
  data?: any;
};

type CreateUserPayload = {
  tin: string;
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: string;
  password: string;
  roleId: number;
};

type UsersByTinPayload = {
  Tin: string;
};

export const useUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: CreateUserPayload): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      return {
        success: true,
        message: data.message || 'Registration successful',
        data: data.data,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getUsersByTin = async (tin: string): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/users/by-tin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tin: tin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users by TIN');
      }

      return {
        success: true,
        message: data.message || `Users for TIN '${tin}' retrieved`,
        data: data.data,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch users by TIN';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = async (userId: string): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return {
        success: true,
        message: data.message || 'User retrieved successfully',
        data: data.data,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    getUsersByTin,
    getUserById,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};