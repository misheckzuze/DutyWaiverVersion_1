'use client';
import React, { useState, useEffect } from 'react';
import { User, ApiUser } from '@/types/UserModel';
import { UsersTable } from './UsersTable';
import UserModal from './UserModal';
import { v4 as uuidv4 } from 'uuid';
import { useUsers } from '@/hooks/useUsers';
import Input from '@/components/ui-utils/input/InputField';
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
  const [tin, setTin] = useState(''); // State for TIN input
  const { getUsersByTin, isLoading, error } = useUsers();

  // Function to map API user to local User type
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

  // Fetch users by TIN
  const fetchUsersByTin = async () => {
    if (!tin) return;
    
    const response = await getUsersByTin(tin);
    if (response.success && response.data) {
      const mappedUsers = response.data.map(mapApiUserToLocal);
      setUsers(mappedUsers);
    }
  };

  // Optionally fetch users on component mount with a default TIN
  useEffect(() => {
    // You can set a default TIN here or leave it empty
    // fetchUsersByTin();
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <button 
          onClick={handleAdd} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add User
        </button>
      </div>

      {/* TIN Search Input */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-1">
            Search by TIN
          </label>
          <div className="flex gap-2">
            <Input
              id="tin"
              type="text"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder="Enter TIN (Tax Identification Number)"
              className="flex-1"
            />
            <Button
              onClick={fetchUsersByTin}
              disabled={isLoading || !tin.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
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
        tin={tin}
      />
    </div>
  );
};

export default UsersList;