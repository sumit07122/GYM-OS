import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth/context';
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

// Dynamic Index Redirector for /gym/:slug based on role
const GymIndexRedirect: React.FC = () => {
  const { session } = useAuth();
  if (session?.role === 'member') {
    return <Navigate to="member" replace />;
  }
  return <Navigate to="dashboard" replace />;
};

// Root Redirector based on authentication state
const RootRedirect: React.FC = () => {
  const { session, isAuthenticated } = useAuth();
  if (isAuthenticated && session) {
    const target = session.role === 'member' ? 'member' : 'dashboard';
    return <Navigate to={`/gym/${session.gymSlug || 'olympia-fitness'}/${target}`} replace />;
  }
  return <Navigate to="/login" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterOwner />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Root Route: Auth-aware redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Main Tenant Application Shell */}
      <Route
        path="/gym/:slug"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<GymIndexRedirect />} />

        {/* Owner ERP Routes: Restricted to Gym Owner & Staff */}
        <Route
          path="dashboard"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="members"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Members />
            </AuthGuard>
          }
        />
        <Route
          path="attendance"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Attendance />
            </AuthGuard>
          }
        />
        <Route
          path="plans"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <MembershipPlans />
            </AuthGuard>
          }
        />
        <Route
          path="finance"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Finance />
            </AuthGuard>
          }
        />
        <Route
          path="expenses"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Expenses />
            </AuthGuard>
          }
        />
        <Route
          path="leads"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Leads />
            </AuthGuard>
          }
        />
        <Route
          path="staff"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Staff />
            </AuthGuard>
          }
        />
        <Route
          path="settings"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}>
              <Settings />
            </AuthGuard>
          }
        />
        <Route
          path="trainer"
          element={
            <AuthGuard allowedRoles={['gym_owner', 'gym_manager', 'trainer', 'platform_super_admin']}>
              <TrainerPortal />
            </AuthGuard>
          }
        />

        {/* Member Self-Service Pass: Restricted to Member and Owner */}
        <Route
          path="member"
          element={
            <AuthGuard allowedRoles={['member', 'gym_owner', 'gym_manager', 'platform_super_admin']}>
              <MemberPortal />
            </AuthGuard>
          }
        />

        {/* Fitness & Nutrition Routines (Shared between Member & Owner) */}
        <Route path="workouts" element={<Fitness />} />
        <Route path="diets" element={<Fitness />} />
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
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};
