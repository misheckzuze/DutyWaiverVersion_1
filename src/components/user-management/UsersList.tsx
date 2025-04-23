'use client';
import React, { useEffect, useState } from 'react';
import { User, ApiUser } from '@/types/UserModel';
import { UsersTable } from './UsersTable';
import UserModal from './UserModal';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/components/ui/button/Button';
import Loader from '../ui-utils/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
    clearError,
    toggleUserStatus 
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

  const fetchUsersByStoredTin = async () => {
    const authData = JSON.parse(localStorage.getItem('authData') || '{}');
    const tin = authData?.companyTIN;
    
    if (!tin) {
      console.error('No TIN found in authData');
      return;
    }

    await getUsersByTin(tin);
  };

  useEffect(() => {
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
    // You can implement create/update logic here
    setShowModal(false);
  };

  const handleToggleActive = async (id: string) => {
    const userToToggle = apiUsers.find((u) => u.id.toString() === id);
    if (!userToToggle) return;
  
    const newStatus = !userToToggle.isActive;
    const actionText = newStatus ? 'activate' : 'deactivate';
  
    const confirm = window.confirm(`Are you sure you want to ${actionText} this user?`);
    if (!confirm) return;
  
    const res = await toggleUserStatus(id, newStatus);
  
    if (res.success) {
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchUsersByStoredTin(); // Refresh users list
    } else {
      toast.error(`Failed to ${actionText} user: ${res.message}`);
    }
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
          <button onClick={clearError} className="text-red-700 font-bold">×</button>
        </div>
      )}

      {isLoading ? (
        <Loader />
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
