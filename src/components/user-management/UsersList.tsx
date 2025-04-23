'use client';
import React, { useEffect, useState } from 'react';
import { User, ApiUser } from '@/types/UserModel';
import { UsersTable } from './UsersTable';
import UserModal from './UserModal';
import { v4 as uuidv4 } from 'uuid';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/components/ui/button/Button';
import Loader from '../ui-utils/Loader';

const UsersList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id' | 'createdAt'> & { password: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    isActive: true,
    password: '',
  });

  const { 
    getUsersByTin, 
    users: apiUsers, 
    isLoading, 
    error,
    clearError
  } = useUsers();

  const mapApiUserToLocal = (apiUser: ApiUser): User => ({
    id: apiUser.id.toString(),
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    phoneNumber: apiUser.phoneNumber || '',
    role: apiUser.roles?.[0] || 'user',
    isActive: apiUser.isActive,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
    lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined,
    roles: apiUser.roles,
  });

  useEffect(() => {
    const fetchUsersByStoredTin = async () => {
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const tin = authData?.companyTIN || authData?.companyTIN;
      
      if (!tin) {
        console.error('No TIN found in authData');
        return;
      }

      await getUsersByTin(tin);
    };

    fetchUsersByStoredTin();
  }, []);

  const handleAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'user',
      isActive: true,
      password: '',
    });
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    const { id, createdAt, ...userData } = user;
    setFormData({
      ...userData,
      password: '',
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSave = (userData: Omit<User, 'id' | 'createdAt'>) => {
    // This should be updated to use the API instead of local state
    // For now, keeping the local state update
    if (selectedUser) {
      // In a real app, you would call updateUser API here
    } else {
      // In a real app, you would call createUser API here
    }
    setShowModal(false);
  };

  const handleToggleActive = (id: string) => {
    // This should be updated to use the API
    // For now, keeping the local state update
  };

  return (
    <div className="px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add User
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-700 font-bold">
            ×
          </button>
        </div>
      )}

{isLoading ? (
       <Loader/>
      ) : (
        <UsersTable 
          users={apiUsers.map(mapApiUserToLocal)} 
          onEdit={handleEdit} 
          onToggleActive={handleToggleActive} 
        />
      )}

      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        tin={JSON.parse(localStorage.getItem('authData') || '{}')?.tin || ''}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default UsersList;