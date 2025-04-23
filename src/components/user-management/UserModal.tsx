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
  formData: Omit<User, 'id' | 'createdAt'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<User, 'id' | 'createdAt'>>>;
  tin: string; // Add TIN prop
};

// Extended role options to match API roleId
const roleOptions = [
  { value: '1', label: 'Admin' },
  { value: '2', label: 'Moderator' },
  { value: '3', label: 'User' },
];

const UserModal = ({ isOpen, onClose, onSave, formData, setFormData, tin }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createUser } = useUsers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
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

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the API payload
      const apiPayload = {
        tin: tin,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phonenumber: formData.phoneNumber,
        password: 'defaultPassword', // You might want to add password field
        roleId: parseInt(formData.role),
      };

      const response = await createUser(apiPayload);

      if (response.success) {
        // Map the API response to our local user format
        const localUserData: Omit<User, 'id' | 'createdAt'> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          role: roleOptions.find(r => r.value === formData.role)?.label || 'User',
          isActive: true,
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
          {formData.firstName ? 'Edit User' : 'Add User'}
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
              !formData.role
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