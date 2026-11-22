import React, { createContext, useContext, useState, useEffect } from 'react';
import { Gym, GymRole, GymSettings, GymBranding, GymStaff, UserProfile } from '@/types';
import { gymStore } from '@/lib/supabase/store';

interface TenantContextType {
  currentGym: Gym;
  allGyms: Gym[];
  settings: GymSettings;
  branding: GymBranding;
  activeRole: GymRole;
  currentUser: UserProfile;
  setGym: (gym: Gym) => void;
  setActiveRole: (role: GymRole) => void;
  refreshTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const allGyms = gymStore.getAllGyms();
  const [currentGym, setCurrentGym] = useState<Gym>(allGyms[0]);
  const [activeRole, setActiveRole] = useState<GymRole>('gym_owner');

  const settings = gymStore.getSettings(currentGym.id);
  const branding = gymStore.getBranding(currentGym.id);

  const currentUser: UserProfile = {
    id: 'user-active-session',
    email: activeRole === 'gym_owner' ? 'owner@olympiafitness.in' : `${activeRole}@olympiafitness.in`,
    full_name: activeRole === 'gym_owner' ? 'Vikramaditya Singhania' : activeRole === 'trainer' ? 'Kabir Sharma' : activeRole === 'receptionist' ? 'Pooja Verma' : 'Aarav Mehta',
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

  const refreshTenant = () => {
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
