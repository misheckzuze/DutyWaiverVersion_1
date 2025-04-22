export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: 'admin' | 'user' | 'moderator';
    isActive: boolean;
    createdAt: Date;
  }
  