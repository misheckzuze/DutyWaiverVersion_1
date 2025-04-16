"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RegistrationProps } from "@/types/Registration";

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

  const handleSuccessfulAuth = (authData: { token: string; tokenExpires: string }) => {
    setToken(authData.token);
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("authData", JSON.stringify(authData));
    document.cookie = `accessToken=${authData.token}; path=/; expires=${new Date(authData.tokenExpires).toUTCString()}`;
    router.push("/"); // Redirect to home page
  };

  const login = async (tin: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tin, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        handleSuccessfulAuth(data.data);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
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
        // Reuse token logic directly instead of calling login again
        handleSuccessfulAuth(data.data);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("accessToken");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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