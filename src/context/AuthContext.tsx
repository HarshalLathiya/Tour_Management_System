"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { tokenManager, authApi, type UserData } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = () => {
      const decoded = tokenManager.decodeToken();

      if (decoded && !tokenManager.isTokenExpired()) {
        const storedUser = tokenManager.getUser();
        setState({
          user: storedUser || {
            id: decoded.id,
            email: decoded.email,
            name: decoded.email,
            role: decoded.role as UserData["role"],
            created_at: "",
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        tokenManager.removeToken();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);

      if (!result.success || !result.data) {
        return { success: false, error: result.error || "Login failed" };
      }

      const { token, user } = result.data;

      tokenManager.setToken(token);
      tokenManager.setUser(user);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }, []);

  // Register function
  const register = useCallback(
    async (data: { email: string; password: string; name: string; role: string }) => {
      try {
        const result = await authApi.register(data);

        if (!result.success || !result.data) {
          return { success: false, error: result.error || "Registration failed" };
        }

        const { token, user } = result.data;

        tokenManager.setToken(token);
        tokenManager.setUser(user);

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Registration failed",
        };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    tokenManager.removeToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/auth/login");
  }, [router]);

  // Refresh user data from API
  const refreshUser = useCallback(async () => {
    if (!tokenManager.getToken()) return;

    const result = await authApi.getProfile();
    if (result.success && result.data) {
      tokenManager.setUser(result.data);
      setState((prev) => ({
        ...prev,
        user: result.data!,
      }));
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================================================
// Higher Order Component for protected routes
// ============================================================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/auth/login");
      }

      if (!isLoading && isAuthenticated && allowedRoles && user) {
        if (!allowedRoles.includes(user.role)) {
          router.push("/dashboard");
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="spinner" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
