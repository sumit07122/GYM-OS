// Role-Based Access Control (RBAC) Permissions Engine

import { GymRole } from '@/types';

export const PERMISSIONS = {
  // Members
  MEMBERS_VIEW: 'members.view',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_UPDATE: 'members.update',
  MEMBERS_DELETE: 'members.delete',
  MEMBERS_IMPORT: 'members.import',
  MEMBERS_EXPORT: 'members.export',

  // Attendance
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_CHECKIN: 'attendance.checkin',
  ATTENDANCE_OVERRIDE: 'attendance.override',

  // Finance & POS
  FINANCE_COLLECT: 'finance.collect',
  FINANCE_VIEW_REVENUE: 'finance.view_revenue',
  FINANCE_REFUND: 'finance.refund',
  FINANCE_EXPENSES_VIEW: 'finance.expenses_view',
  FINANCE_EXPENSES_CREATE: 'finance.expenses_create',

  // Fitness
  WORKOUTS_MANAGE: 'workouts.manage',
  DIETS_MANAGE: 'diets.manage',
  PROGRESS_RECORD: 'progress.record',

  // Leads
  LEADS_MANAGE: 'leads.manage',

  // Staff & Settings
  STAFF_MANAGE: 'staff.manage',
  SETTINGS_MANAGE: 'settings.manage',
  SUBSCRIPTION_MANAGE: 'subscription.manage',
  AUDIT_VIEW: 'audit.view',

  // Platform Super Admin
  PLATFORM_ADMIN: 'platform.admin',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<GymRole, PermissionKey[]> = {
  platform_super_admin: Object.values(PERMISSIONS),

  owner: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.PLATFORM_ADMIN),

  gym_owner: Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.PLATFORM_ADMIN),

  gym_manager: [
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_CREATE,
    PERMISSIONS.MEMBERS_UPDATE,
    PERMISSIONS.MEMBERS_DELETE,
    PERMISSIONS.MEMBERS_IMPORT,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CHECKIN,
    PERMISSIONS.ATTENDANCE_OVERRIDE,
    PERMISSIONS.FINANCE_COLLECT,
    PERMISSIONS.FINANCE_EXPENSES_VIEW,
    PERMISSIONS.FINANCE_EXPENSES_CREATE,
    PERMISSIONS.WORKOUTS_MANAGE,
    PERMISSIONS.DIETS_MANAGE,
    PERMISSIONS.PROGRESS_RECORD,
    PERMISSIONS.LEADS_MANAGE,
  ],

  receptionist: [
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_CREATE,
    PERMISSIONS.MEMBERS_UPDATE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_CHECKIN,
    PERMISSIONS.FINANCE_COLLECT,
    PERMISSIONS.LEADS_MANAGE,
  ],

  trainer: [
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.WORKOUTS_MANAGE,
    PERMISSIONS.DIETS_MANAGE,
    PERMISSIONS.PROGRESS_RECORD,
  ],

  member: [
    PERMISSIONS.ATTENDANCE_CHECKIN, // via self QR and GPS geofence
  ],
};

export function hasPermission(role: GymRole | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
