import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Members } from '@/pages/Members';
import { Attendance } from '@/pages/Attendance';
import { Finance } from '@/pages/Finance';
import { Expenses } from '@/pages/Expenses';
import { MembershipPlans } from '@/pages/MembershipPlans';
import { Leads } from '@/pages/Leads';
import { Staff } from '@/pages/Staff';
import { Fitness } from '@/pages/Fitness';
import { TrainerPortal } from '@/pages/TrainerPortal';
import { MemberPortal } from '@/pages/MemberPortal';
import { SuperAdmin } from '@/pages/SuperAdmin';
import { Settings } from '@/pages/Settings';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Root redirects to default gym dashboard */}
      <Route path="/" element={<Navigate to="/gym/olympia-fitness/dashboard" replace />} />

      {/* Main Tenant ERP Application Shell */}
      <Route path="/gym/:slug" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="plans" element={<MembershipPlans />} />
        <Route path="finance" element={<Finance />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="leads" element={<Leads />} />
        <Route path="staff" element={<Staff />} />
        <Route path="workouts" element={<Fitness />} />
        <Route path="diets" element={<Fitness />} />
        <Route path="trainer" element={<TrainerPortal />} />
        <Route path="member" element={<MemberPortal />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Platform SaaS Super Admin */}
      <Route path="/super-admin" element={<DashboardLayout />}>
        <Route index element={<SuperAdmin />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/gym/olympia-fitness/dashboard" replace />} />
    </Routes>
  );
};
