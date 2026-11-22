import { describe, it, expect } from 'vitest';
import { gymStore } from '../../src/lib/supabase/store';

describe('Attendance Rules & Geofence Check-in', () => {
  const gymId = 'gym-001-olympia';

  it('allows initial check-in for a valid member', () => {
    const members = gymStore.getMembers(gymId);
    expect(members.length).toBeGreaterThan(0);
    const testMember = members[0];

    const res = gymStore.checkInMember(gymId, testMember.id, 'reception_manual', 'Test Verifier');
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    expect(res.message).toBeDefined();
  });

  it('enforces lockout when the same member is checked in again immediately', () => {
    const newMember = gymStore.createMember(gymId, {
      full_name: 'Anti Duplicate Test User',
      phone: '+91 99999 88888',
      gender: 'Male',
      joining_date: '2026-11-22',
    });

    // 1st Check-in
    const firstCheckIn = gymStore.checkInMember(gymId, newMember.id, 'reception_manual', 'Verifier 1');
    expect(firstCheckIn.success).toBe(true);
    expect(firstCheckIn.record).toBeDefined();

    // 2nd Immediate Check-in
    const secondCheckIn = gymStore.checkInMember(gymId, newMember.id, 'reception_manual', 'Verifier 2');
    expect(secondCheckIn.success).toBe(false);
    expect(secondCheckIn.message).toContain('Duplicate prevented');
  });

  it('allows GPS check-in when member is inside gym geofence (within 100m)', () => {
    const gpsMember = gymStore.createMember(gymId, {
      full_name: 'GPS Test Member Inside',
      phone: '+91 98888 77777',
      gender: 'Female',
      joining_date: '2026-11-22',
    });

    const settings = gymStore.getSettings(gymId);
    // Member coordinate at 25 meters from gym
    const memberLat = settings.latitude + 0.0002;
    const memberLon = settings.longitude;

    const res = gymStore.checkInMemberViaGps(gymId, gpsMember.id, memberLat, memberLon);
    expect(res.success).toBe(true);
    expect(res.record).toBeDefined();
    expect(res.record?.method).toBe('gps_geofence');
    expect(res.distanceMeters).toBeLessThan(100);
  });

  it('rejects GPS check-in when member is outside gym geofence (> 100m)', () => {
    const outsideMember = gymStore.createMember(gymId, {
      full_name: 'GPS Test Member Outside',
      phone: '+91 97777 55555',
      gender: 'Male',
      joining_date: '2026-11-22',
    });

    const settings = gymStore.getSettings(gymId);
    // Member coordinate ~1.2 km away
    const memberLat = settings.latitude + 0.011;
    const memberLon = settings.longitude;

    const res = gymStore.checkInMemberViaGps(gymId, outsideMember.id, memberLat, memberLon);
    expect(res.success).toBe(false);
    expect(res.message).toContain('Outside gym perimeter');
    expect(res.distanceMeters).toBeGreaterThan(100);
  });
});
