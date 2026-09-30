import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PublicSettings } from '../types/index';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isPro: boolean;
  isAdmin: boolean;
  settings: PublicSettings | null;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  loginWithGoogle: (email: string, name?: string, avatar?: string, isLynkBuyer?: boolean, orderId?: string) => Promise<void>;
  autoActivateLynkBuyer: (email: string, name?: string, orderId?: string) => Promise<void>;
  switchDemoAccount: (role: 'ADMIN' | 'PRO' | 'USER') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  showProUpgradeModal: boolean;
  setShowProUpgradeModal: (open: boolean) => void;
  openGoogleLoginModal: boolean;
  setOpenGoogleLoginModal: (open: boolean) => void;
  initialLynkBuyerMode: boolean;
  setInitialLynkBuyerMode: (mode: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('om_gio_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState<boolean>(false);
  const [openGoogleLoginModal, setOpenGoogleLoginModal] = useState<boolean>(false);
  const [initialLynkBuyerMode, setInitialLynkBuyerMode] = useState<boolean>(false);
  const { showToast } = useToast();

  // Load public settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getPublicSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('om_gio_auth_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err: any) {
      console.warn('Session expired or invalid, logging out:', err.message);
      localStorage.removeItem('om_gio_auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (
    email: string,
    name?: string,
    avatar?: string,
    isLynkBuyer?: boolean,
    orderId?: string
  ) => {
    try {
      setIsLoading(true);
      const res = await api.loginWithGoogle(email, name, avatar, isLynkBuyer, orderId);
      localStorage.setItem('om_gio_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setOpenGoogleLoginModal(false);
      showToast(res.message || `Selamat datang, ${res.user.name}!`, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal login: ${err.message}`, 'ERROR');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const autoActivateLynkBuyer = async (email: string, name?: string, orderId?: string) => {
    try {
      setIsLoading(true);
      const res = await api.autoActivateLynkBuyer(email, name, orderId);
      localStorage.setItem('om_gio_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setOpenGoogleLoginModal(false);
      showToast(res.message, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal auto-aktivasi: ${err.message}`, 'ERROR');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    refreshUser();

    // Check if buyer redirected from Lynk
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isLynkRedirect = searchParams.get('lynk_paid') || searchParams.get('lynk_success') || searchParams.get('status') === 'paid' || searchParams.get('status') === 'success';
      const emailParam = searchParams.get('email') || searchParams.get('customer_email') || searchParams.get('buyer_email');
      const orderParam = searchParams.get('order_id') || searchParams.get('transaction_id') || '';

      if (isLynkRedirect && emailParam) {
        autoActivateLynkBuyer(emailParam, undefined, orderParam);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (isLynkRedirect) {
        setInitialLynkBuyerMode(true);
        setOpenGoogleLoginModal(true);
        showToast('Pembayaran Lynk terdeteksi! Masukkan akun Google Anda untuk auto-aktivasi PRO LIFETIME.', 'INFO');
      }
    } catch {}
  }, [loadSettings, refreshUser]);

  const switchDemoAccount = async (role: 'ADMIN' | 'PRO' | 'USER') => {
    try {
      setIsLoading(true);
      const res = await api.switchDemoAccount(role);
      localStorage.setItem('om_gio_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      showToast(res.message, 'SUCCESS');
    } catch (err: any) {
      showToast(`Gagal beralih akun: ${err.message}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('om_gio_auth_token');
      setToken(null);
      setUser(null);
      showToast('Anda telah keluar dari sesi.', 'INFO');
    }
  };

  const isPro = Boolean(user && (user.role === 'PRO' || user.role === 'ADMIN' || user.lifetime_access));
  const isAdmin = Boolean(user && user.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isPro,
        isAdmin,
        settings,
        activeProjectId,
        setActiveProjectId,
        loginWithGoogle,
        switchDemoAccount,
        logout,
        refreshUser,
        showProUpgradeModal,
        setShowProUpgradeModal,
        openGoogleLoginModal,
        setOpenGoogleLoginModal,
        autoActivateLynkBuyer,
        initialLynkBuyerMode,
        setInitialLynkBuyerMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
