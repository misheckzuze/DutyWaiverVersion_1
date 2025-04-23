// types/UserModel.ts
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  roles?: string[];
  password?: string | null;
  companyTIN?: string | null;
};

// Type for API response user data
export type ApiUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: string[];
  username?: string | null;
  password?: string | null;
};