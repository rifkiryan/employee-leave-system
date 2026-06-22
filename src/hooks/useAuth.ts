"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthStorageService } from "@/services/auth-storage";
import type { AuthSession, LoginCredentials } from "@/types/auth";

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => boolean;
  logout: () => void;
  session: AuthSession | null;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const currentSession = AuthStorageService.getSession();
    const authenticated = AuthStorageService.isAuthenticated();
    setSession(currentSession);
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (credentials: LoginCredentials): boolean => {
      const success = AuthStorageService.login(credentials);
      if (success) {
        const currentSession = AuthStorageService.getSession();
        setSession(currentSession);
        setIsAuthenticated(true);
        router.push("/dashboard");
      }
      return success;
    },
    [router]
  );

  const logout = useCallback(() => {
    AuthStorageService.logout();
    setSession(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    session,
  };
}
