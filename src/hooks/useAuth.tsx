"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProps } from "@/types/RegistrationModel";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface AuthContextProps {
  token: string | null;
  login: (tin: string, email: string, password: string) => Promise<void>;
  register: (
    { tin,
      tradingName,
      address,
      businessEmail,
      phoneNumber,
      firstName,
      lastName,
      email,
      password }: RegistrationProps
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const handleSuccessfulAuth = (authData: { token: string; tokenExpires: string }, tin: string) => {
    setToken(authData.token);
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("authData", JSON.stringify(authData));
    localStorage.setItem("Tin", tin);
    document.cookie = `accessToken=${authData.token}; path=/; expires=${new Date(authData.tokenExpires).toUTCString()}`;
    router.push("/"); // Redirect to home page
  };

  const login = async (tin: string, email: string, password: string) => {
    try {
      // Show loading toast
      const toastId = toast.loading("Signing in...");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tin, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update toast to success
        toast.update(toastId, {
          render: "Successfully signed in!",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        handleSuccessfulAuth(data.data, tin);
      } else {
        // Update toast to error
        toast.update(toastId, {
          render: data.message || "Login failed",
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // Show error toast if not already shown
      if (!toast.isActive("login-error")) {
        toast.error(error.message || "Login failed", { toastId: "login-error" });
      }
      throw error;
    }
  };

  const register = async (
    { tin,
      tradingName,
      address,
      businessEmail,
      phoneNumber,
      firstName,
      lastName,
      email,
      password }: RegistrationProps

  ) => {
    try {
      // Show loading toast
      const toastId = toast.loading("Creating your account...");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tin,
          tradingName,
          address,
          businessEmail,
          phoneNumber,
          firstName,
          lastName,
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update toast to success
        toast.update(toastId, {
          render: "Account created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        // Reuse token logic directly instead of calling login again
        handleSuccessfulAuth(data.data, tin);
      } else {
        // Update toast to error
        toast.update(toastId, {
          render: data.message || "Registration failed",
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
        throw new Error(data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      // Show error toast if not already shown
      if (!toast.isActive("register-error")) {
        toast.error(error.message || "Registration failed", { toastId: "register-error" });
      }
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    toast.success("You have been logged out successfully");
    router.push("/signin");
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};