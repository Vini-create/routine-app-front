"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginRequest } from "@/lib/authApi";
import { apiToAppLanguage, type UserMe } from "@/lib/api-contracts";
import { clearLegacyUserData, clearSession, getRefreshToken, hasSession, saveSession } from "@/lib/session";
import { useLanguage } from "./LanguageProvider";

type AuthStatus = "loading" | "authenticated" | "anonymous";
type AuthContextValue = {
  status: AuthStatus;
  user: UserMe | null;
  login: (request: LoginRequest) => Promise<UserMe>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<UserMe>;
  setUser: (user: UserMe) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { setLanguage } = useLanguage();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserMe | null>(null);

  const becomeAnonymous = useCallback(() => {
    clearSession();
    queryClient.clear();
    setUser(null);
    setStatus("anonymous");
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
    if (currentUser.language) setLanguage(apiToAppLanguage[currentUser.language]);
    setStatus("authenticated");
    return currentUser;
  }, [setLanguage]);

  useEffect(() => {
    let active = true;
    if (!hasSession()) {
      clearLegacyUserData();
      queueMicrotask(() => { if (active) setStatus("anonymous"); });
      return () => { active = false; };
    }
    authApi.me()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        if (currentUser.language) setLanguage(apiToAppLanguage[currentUser.language]);
        setStatus("authenticated");
      })
      .catch(() => {
        if (active) becomeAnonymous();
      });
    return () => { active = false; };
  }, [becomeAnonymous, setLanguage]);

  useEffect(() => {
    window.addEventListener("rotina-ai:session-expired", becomeAnonymous);
    function handleUnverified() {
      becomeAnonymous();
      window.location.replace("/verify-email");
    }
    window.addEventListener("rotina-ai:email-unverified", handleUnverified);
    return () => {
      window.removeEventListener("rotina-ai:session-expired", becomeAnonymous);
      window.removeEventListener("rotina-ai:email-unverified", handleUnverified);
    };
  }, [becomeAnonymous]);

  async function login(request: LoginRequest) {
    const tokens = await authApi.login(request);
    saveSession({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    return refreshUser();
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      becomeAnonymous();
    }
  }

  async function deleteAccount() {
    await authApi.deleteAccount();
    becomeAnonymous();
  }

  const value: AuthContextValue = {
    status, user, login, logout, deleteAccount, refreshUser, setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
