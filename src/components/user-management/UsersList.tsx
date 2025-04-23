'use client';
import React, { useState, useEffect } from 'react';
import { User, ApiUser } from '@/types/UserModel';
import { UsersTable } from './UsersTable';
import UserModal from './UserModal';
import { v4 as uuidv4 } from 'uuid';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/components/ui/button/Button';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id' | 'createdAt'>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'user',
    isActive: true,
  });

  const { getUsersByTin, isLoading, error } = useUsers();

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

  // Fetch users automatically on mount using TIN from localStorage
  useEffect(() => {
    const fetchUsersByStoredTin = async () => {
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const tin = authData?.tin || authData?.Tin;

      if (!tin) return;

      const response = await getUsersByTin(tin);
      if (response.success && response.data) {
        const mappedUsers = response.data.map(mapApiUserToLocal);
        setUsers(mappedUsers);
      }
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
    });
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    const { id, createdAt, ...userData } = user;
    setFormData(userData);
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSave = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: uuidv4(),
          createdAt: new Date(),
          ...userData,
        },
      ]);
    }
    setShowModal(false);
  };

  const handleToggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
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
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <UsersTable 
        users={users} 
        onEdit={handleEdit} 
        onToggleActive={handleToggleActive} 
      />

      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        tin={JSON.parse(localStorage.getItem('authData') || '{}')?.tin || ''}
      />
    </div>
  );
};

export default UsersList;
