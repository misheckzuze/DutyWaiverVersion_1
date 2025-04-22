import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Metadata } from 'next';
import React from 'react';
import UsersList from '@/components/user-management/UsersList';

export const metadata: Metadata = {
  title: 'User Management | Duty Waiver System',
  description: 'Manage system users in the Duty Waiver System',
  keywords: 'User Management, Admin, Duty Waiver',
};

export default function UserManagementPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="User Management" />
      <UsersList />
    </div>
  );
}
