import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Login } from '@/pages/Login';
import { RegisterOwner } from '@/pages/RegisterOwner';
import { ForgotPassword } from '@/pages/ForgotPassword';
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
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterOwner />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Root redirects to default gym dashboard */}
      <Route path="/" element={<Navigate to="/gym/olympia-fitness/dashboard" replace />} />

      {/* Main Protected Tenant ERP Application Shell */}
      <Route
        path="/gym/:slug"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
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
      <Route
        path="/super-admin"
        element={
          <AuthGuard allowedRoles={['platform_super_admin', 'gym_owner']}>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<SuperAdmin />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/gym/olympia-fitness/dashboard" replace />} />
    </Routes>
  );
};
