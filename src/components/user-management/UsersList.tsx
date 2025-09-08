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
import ConfirmationDialog from '../ui-utils/ConfirmationDialog';

const UsersList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tin, setTin] = useState<string>(''); 
  const [formData, setFormData] = useState<Omit<User, 'id' | 'createdAt'> & { password: string }>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    isActive: true,
    password: '',
  });

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {},
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const storedTin = authData?.companyTIN || authData?.tin || '';
      setTin(storedTin);

      if (storedTin) {
        getUsersByTin(storedTin);
      } else {
        console.error('No TIN found in authData');
      }
    }
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

    setConfirmationDialog({
      isOpen: true,
      message: `Are you sure you want to ${actionText} this user?`,
      onConfirm: async () => {
        const res = await toggleUserStatus(id, newStatus);

        if (res.success) {
          toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
          await getUsersByTin(tin);
        } else {
          toast.error(`Failed to ${actionText} user: ${res.message}`);
        }

        setConfirmationDialog({ ...confirmationDialog, isOpen: false });
      },
    });
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
        tin={tin}
        selectedUser={selectedUser}
      />

      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        message={confirmationDialog.message}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ ...confirmationDialog, isOpen: false })}
      />
    </div>
  );
};

export default UsersList;
