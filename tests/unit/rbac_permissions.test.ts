import { describe, it, expect } from 'vitest';
import { hasPermission, PERMISSIONS } from '../../src/lib/permissions/rbac';

describe('Role-Based Access Control (RBAC) Matrix', () => {
  it('platform_super_admin has global access to all permissions', () => {
    expect(hasPermission('platform_super_admin', PERMISSIONS.PLATFORM_ADMIN)).toBe(true);
    expect(hasPermission('platform_super_admin', PERMISSIONS.FINANCE_VIEW_REVENUE)).toBe(true);
    expect(hasPermission('platform_super_admin', PERMISSIONS.MEMBERS_DELETE)).toBe(true);
  });

  it('gym_owner has full operational and financial access for their gym', () => {
    expect(hasPermission('gym_owner', PERMISSIONS.FINANCE_VIEW_REVENUE)).toBe(true);
    expect(hasPermission('gym_owner', PERMISSIONS.FINANCE_COLLECT)).toBe(true);
    expect(hasPermission('gym_owner', PERMISSIONS.MEMBERS_CREATE)).toBe(true);
    expect(hasPermission('gym_owner', PERMISSIONS.STAFF_MANAGE)).toBe(true);
    // Cannot access platform super admin features
    expect(hasPermission('gym_owner', PERMISSIONS.PLATFORM_ADMIN)).toBe(false);
  });

  it('receptionist can collect payments and mark attendance but cannot view gym revenue or delete members', () => {
    expect(hasPermission('receptionist', PERMISSIONS.ATTENDANCE_CHECKIN)).toBe(true);
    expect(hasPermission('receptionist', PERMISSIONS.FINANCE_COLLECT)).toBe(true);
    expect(hasPermission('receptionist', PERMISSIONS.FINANCE_VIEW_REVENUE)).toBe(false);
    expect(hasPermission('receptionist', PERMISSIONS.MEMBERS_DELETE)).toBe(false);
    expect(hasPermission('receptionist', PERMISSIONS.STAFF_MANAGE)).toBe(false);
  });

  it('trainer can manage workouts and diets but cannot collect payments or view revenue', () => {
    expect(hasPermission('trainer', PERMISSIONS.WORKOUTS_MANAGE)).toBe(true);
    expect(hasPermission('trainer', PERMISSIONS.DIETS_MANAGE)).toBe(true);
    expect(hasPermission('trainer', PERMISSIONS.FINANCE_COLLECT)).toBe(false);
    expect(hasPermission('trainer', PERMISSIONS.FINANCE_VIEW_REVENUE)).toBe(false);
    expect(hasPermission('trainer', PERMISSIONS.STAFF_MANAGE)).toBe(false);
  });

  it('member has restricted self-service access', () => {
    expect(hasPermission('member', PERMISSIONS.ATTENDANCE_CHECKIN)).toBe(true);
    expect(hasPermission('member', PERMISSIONS.MEMBERS_CREATE)).toBe(false);
    expect(hasPermission('member', PERMISSIONS.FINANCE_COLLECT)).toBe(false);
  });
});
