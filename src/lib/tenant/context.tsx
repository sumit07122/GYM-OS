import React, { createContext, useContext, useState, useEffect } from 'react';
import { Gym, GymRole, GymSettings, GymBranding, UserProfile } from '@/types';
import { gymStore } from '@/lib/supabase/store';
import { gymosRepository } from '@/lib/supabase/repository';
import { useAuth } from '@/lib/auth/context';

interface TenantContextType {
  currentGym: Gym;
  allGyms: Gym[];
  settings: GymSettings;
  branding: GymBranding;
  activeRole: GymRole;
  currentUser: UserProfile;
  setGym: (gym: Gym) => void;
  setActiveRole: (role: GymRole) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Gracefully handle useAuth if TenantProvider is wrapped by AuthProvider
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    authContext = useAuth();
  } catch {
    // Auth context not present in isolated unit test environments
  }

  const allGyms = gymStore.getAllGyms();
  const [currentGym, setCurrentGym] = useState<Gym>(() => {
    if (authContext?.session?.gymSlug) {
      const found = gymStore.getGymBySlug(authContext.session.gymSlug);
      if (found) return found;
    }
    return allGyms[0];
  });

  const [activeRole, setActiveRole] = useState<GymRole>(() => {
    return authContext?.session?.role || 'gym_owner';
  });

  // Sync role and gym whenever auth session changes
  useEffect(() => {
    if (authContext?.session) {
      if (authContext.session.role && authContext.session.role !== activeRole) {
        setActiveRole(authContext.session.role);
      }
      if (authContext.session.gymSlug && authContext.session.gymSlug !== currentGym.slug) {
        const found = gymStore.getGymBySlug(authContext.session.gymSlug);
        if (found) setCurrentGym(found);
      }
    }
  }, [authContext?.session]);

  const settings = gymStore.getSettings(currentGym.id);
  const branding = gymStore.getBranding(currentGym.id);

  const currentUser: UserProfile = authContext?.session?.user || {
    id: 'user-active-session',
    email: activeRole === 'member' ? 'aarav.mehta@gmail.com' : 'owner@olympiafitness.in',
    full_name: activeRole === 'member' ? 'Aarav Mehta' : 'Vikramaditya Singhania',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  useEffect(() => {
    // Inject dynamic branding colors into DOM
    document.documentElement.style.setProperty('--tenant-primary', branding.primary_color || '#10B981');
    document.documentElement.style.setProperty('--tenant-accent', branding.accent_color || '#059669');
  }, [branding]);

  const setGym = (gym: Gym) => {
    setCurrentGym(gym);
  };

  const refreshTenant = async () => {
    try {
      const liveGym = await gymosRepository.getGym(currentGym.id);
      if (liveGym) {
        setCurrentGym({ ...liveGym });
        return;
      }
    } catch {
      // Fallback
    }
    const updated = gymStore.getGym(currentGym.id);
    if (updated) setCurrentGym({ ...updated });
  };

  return (
    <TenantContext.Provider
      value={{
        currentGym,
        allGyms,
        settings,
        branding,
        activeRole,
        currentUser,
        setGym,
        setActiveRole,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
