import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { gymStore } from '@/lib/supabase/store';
import { generateGymSlug } from '@/lib/auth/helpers';
import type { GymRole, UserProfile } from '@/types';

export const AUTH_STORAGE_KEY = 'gymos_auth_session_v1';

export interface AuthSession {
  user: UserProfile;
  role: GymRole;
  gymId: string;
  gymSlug: string;
}

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string, role?: GymRole) => Promise<{ success: boolean; error?: string; gymSlug?: string; role?: GymRole }>;
  signUpOwner: (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    gymName: string;
    city: string;
    state: string;
    address: string;
  }) => Promise<{ success: boolean; error?: string; gymSlug?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Storage unavailable
    }
    // Secure by default: unauthenticated visitors must log in
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync session state to storage
  const persistSession = (newSession: AuthSession | null) => {
    setSession(newSession);
    try {
      if (newSession) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable
    }
  };

  const signIn = async (
    email: string,
    password: string,
    requestedRole?: GymRole
  ): Promise<{ success: boolean; error?: string; gymSlug?: string; role?: GymRole }> => {
    setIsLoading(true);
    try {
      // 1. If real Supabase credentials are configured in .env, attempt real Supabase Auth
      const isRealSupabase = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('local-demo');
      if (isRealSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        // Fetch user profile and gym tenancy from Supabase
        if (data.user) {
          const { data: staffData } = await supabase
            .from('gym_staff')
            .select('role, gym_id, gyms(slug)')
            .eq('user_id', data.user.id)
            .single();

          const gymRole: GymRole = staffData?.role || 'gym_owner';
          const gymId = staffData?.gym_id || 'gym-001-olympia';
          const gymSlug = (staffData as any)?.gyms?.slug || 'olympia-fitness';

          const newSession: AuthSession = {
            user: {
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || 'Gym Administrator',
              is_active: true,
              created_at: data.user.created_at,
            },
            role: gymRole,
            gymId,
            gymSlug,
          };
          persistSession(newSession);
          setIsLoading(false);
          return { success: true, gymSlug, role: gymRole };
        }
      }

      // 2. Local Resilient Authentication Mode (Demo / Test Credentials)
      const gyms = gymStore.getAllGyms();
      const gym = gyms[0];

      if (email.toLowerCase().includes('member') || email.toLowerCase().includes('aarav') || requestedRole === 'member') {
        const newSession: AuthSession = {
          user: {
            id: 'user-member-1',
            email: 'aarav.mehta@gmail.com',
            full_name: 'Aarav Mehta',
            phone: '+91 98200 44551',
            is_active: true,
            created_at: '2024-01-10',
          },
          role: 'member',
          gymId: gym.id,
          gymSlug: gym.slug,
        };
        persistSession(newSession);
        setIsLoading(false);
        return { success: true, gymSlug: gym.slug, role: 'member' };
      }

      // Default to Gym Owner
      const newSession: AuthSession = {
        user: {
          id: 'owner-authenticated-session',
          email: email.trim().toLowerCase(),
          full_name: 'Vikramaditya Singhania',
          phone: '+91 98201 12345',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        role: 'gym_owner',
        gymId: gym.id,
        gymSlug: gym.slug,
      };
      persistSession(newSession);
      setIsLoading(false);
      return { success: true, gymSlug: gym.slug, role: 'gym_owner' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'An error occurred during authentication.' };
    }
  };

  const signUpOwner = async (params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    gymName: string;
    city: string;
    state: string;
    address: string;
  }): Promise<{ success: boolean; error?: string; gymSlug?: string }> => {
    setIsLoading(true);
    try {
      const slug = generateGymSlug(params.gymName);

      // Create new Gym tenant in the system
      const newGym = gymStore.createGym({
        name: params.gymName,
        slug,
        phone: params.phone,
        email: params.email,
        address_line1: params.address,
        city: params.city,
        state: params.state,
        pincode: '400001',
        country: 'India',
        timezone: 'Asia/Kolkata',
      });

      const newSession: AuthSession = {
        user: {
          id: `user-${Date.now()}`,
          email: params.email,
          full_name: params.fullName,
          phone: params.phone,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        role: 'gym_owner',
        gymId: newGym.id,
        gymSlug: newGym.slug,
      };

      persistSession(newSession);
      setIsLoading(false);
      return { success: true, gymSlug: newGym.slug };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Onboarding registration failed.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Supabase signOut error ignored
    }
    persistSession(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        signIn,
        signUpOwner,
        signOut,
        resetPassword,
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
