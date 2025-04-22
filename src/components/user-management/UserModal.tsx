'use client';

import { User } from '@/types/UserModel';
import React, { useState } from 'react';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ChevronDownIcon } from '@/icons';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt'>) => void;
  formData: Omit<User, 'id' | 'createdAt'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<User, 'id' | 'createdAt'>>>;
};

const UserModal = ({ isOpen, onClose, onSave, formData, setFormData }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : name === 'role'
        ? (value as 'admin' | 'user' | 'moderator')
        : value;

    setFormData({ ...formData, [name]: newValue });
  };

  // Role Select handler
const handleSelectChange = (value: string) => {
    setFormData({ ...formData, role: value as 'admin' | 'moderator' | 'user' });
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <div className="space-y-4">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {formData.firstName ? 'Edit User' : 'Add User'}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name*</Label>
            <Input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label>Last Name*</Label>
            <Input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div>
          <Label>Email*</Label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>

        <div>
          <Label>Phone Number*</Label>
          <Input
            name="phoneNumber"
            type="text"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="relative">
          <Label>Role*</Label>
          {/* <Select
            name="role"
            value={formData.role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange(e)}
            className="w-full dark:bg-dark-900"
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </Select> */}
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="accent-blue-600"
          />
          <Label className="text-sm">Active</Label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.phoneNumber ||
              !formData.role
            }
          >
            Save User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;
