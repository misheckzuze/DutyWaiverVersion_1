'use client';
import { User } from '@/types/UserModel';
import React, { useState } from 'react';
import Label from '@/components/ui-utils/Label';
import Input from '@/components/ui-utils/input/InputField';
import Select from '@/components/ui-utils/Select';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { ChevronDownIcon } from '@/icons';
import { useUsers } from '@/hooks/useUsers';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'createdAt'>) => void;
  formData: Omit<User, 'id' | 'createdAt'> & { password: string; id?: string };
  setFormData: React.Dispatch<React.SetStateAction<Omit<User, 'id' | 'createdAt'> & { password: string; id?: string }>>;
  tin: string;
  selectedUser: User | null;
};

const roleOptions = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Moderator' },
  { value: '3', label: 'User' },
];

const UserModal = ({ isOpen, onClose, onSave, formData, setFormData, tin, selectedUser }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { createUser, updateUser } = useUsers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.role
    ) {
      setError('Please fill all required fields');
      return;
    }

    // Only require password for new users
    if (!selectedUser && (!formData.password || formData.password.length < 8)) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const companyTin = authData?.companyTIN || authData?.companyTIN;

      if (!companyTin) {
        setError('No company TIN found');
        return;
      }

      const basePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phonenumber: formData.phoneNumber,
        roleId: parseInt(formData.role),
      };

      let response;
      
      if (selectedUser) {
        // Update existing user
        response = await updateUser(selectedUser.id, {
          ...basePayload,
          // Only include password if it was changed (not empty)
          ...(formData.password && { password: formData.password })
        });
      } else {
        // Create new user
        response = await createUser({
          ...basePayload,
          tin: companyTin,
          password: formData.password
        });
      }

      if (response.success) {
        const localUserData: Omit<User, 'id' | 'createdAt'> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: roleOptions.find(r => r.value === formData.role)?.label || 'User',
          isActive: formData.isActive,
        };

        onSave(localUserData);
        onClose();
      } else {
        setError(response.message || 'Failed to save user');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[584px] p-5 lg:p-10"
    >
      <div className="space-y-4">
        <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          {selectedUser ? 'Edit User' : 'Add User'}
        </h4>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
            {error}
          </div>
        )}

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

        {/* Password field - only required for new users or when changing password */}
        <div>
          <Label>{selectedUser ? 'New Password (leave blank to keep current)' : 'Password*'}</Label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder={selectedUser ? "Enter new password" : "Enter password (min 8 characters)"}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div className="relative">
          <Label>Role*</Label>
          <Select
            options={roleOptions}
            placeholder="Select role"
            onChange={handleRoleChange}
            className="w-full dark:bg-dark-900"
            defaultValue={formData.role}
          />
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={
              isSubmitting ||
              !formData.firstName ||
              !formData.lastName ||
              !formData.email ||
              !formData.phoneNumber ||
              !formData.role ||
              (!selectedUser && (!formData.password || formData.password.length < 8))
            }
          >
            {isSubmitting ? 'Saving...' : 'Save User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;