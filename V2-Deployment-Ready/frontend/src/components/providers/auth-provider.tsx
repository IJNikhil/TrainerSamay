"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import type { User } from "../../lib/types";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("trainersamay-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("trainersamay-user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((user: User) => {
    setUser(user);
    localStorage.setItem("trainersamay-user", JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("trainersamay-user");
    navigate("/login");
  }, [navigate]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...data };
      localStorage.setItem("trainersamay-user", JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
