"use client";

import { useState, useEffect } from "react";
import type { UserProfile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  return {
    user,
    token,
    isLoading,
    logout,
    authHeaders,
    isAuthenticated: !!user,
  };
}
