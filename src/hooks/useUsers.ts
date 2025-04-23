import axios from '@/lib/axios';
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

export const useUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);

  const createUser = async (userData: CreateUserPayload): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/v1/users', userData);
      return {
        success: true,
        message: response.data.message || 'Registration successful',
        data: response.data.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create user';
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
      const response = await axios.post('/api/v1/users/by-tin', { Tin: tin });
      setUsers(response.data.data);
      return {
        success: true,
        message: response.data.message || `Users for TIN '${tin}' retrieved`,
        data: response.data.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch users by TIN';
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
      const response = await axios.get(`/api/v1/users/${userId}`);
      setUser(response.data.data);
      return {
        success: true,
        message: response.data.message || 'User retrieved successfully',
        data: response.data.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    userData: Partial<CreateUserPayload>
  ): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/v1/users/${userId}`, userData);
      return {
        success: true,
        message: response.data.message || 'User updated successfully',
        data: response.data.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Toggle user status (activate/deactivate)
  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<UserResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/v1/users/${userId}/change-status`, { isActive });
      return {
        success: true,
        message: response.data.message || `User has been ${isActive ? 'activated' : 'deactivated'}`,
        data: response.data.data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to change user status';
      setError(message);
      return {
        success: false,
        message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearUser = () => setUser(null);
  const clearUsers = () => setUsers([]);

  return {
    createUser,
    updateUser,
    getUsersByTin,
    getUserById,
    toggleUserStatus,
    users,
    user,
    isLoading,
    error,
    clearError,
    clearUser,
    clearUsers,
  };
};
