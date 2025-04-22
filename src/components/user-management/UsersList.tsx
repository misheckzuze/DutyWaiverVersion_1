'use client';
import React, { useState } from 'react';
import { User } from '@/types/UserModel';
import { UsersTable } from './UsersTable';
import UserModal from './UserModal';
import { v4 as uuidv4 } from 'uuid';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '0991234567',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
    },
  ]);

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
      />
    </div>
  );
};

export default UsersList;