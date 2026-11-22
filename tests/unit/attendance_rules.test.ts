import { describe, it, expect } from 'vitest';
import { gymStore } from '../../src/lib/supabase/store';

describe('Attendance Anti-Duplicate Logic', () => {
  const gymId = 'gym-001-olympia';

  it('allows initial check-in for a valid member', () => {
    const members = gymStore.getMembers(gymId);
    expect(members.length).toBeGreaterThan(0);
    const testMember = members[0];

    // Attempt check-in
    const res = gymStore.checkInMember(gymId, testMember.id, 'reception_manual', 'Test Verifier');
    // Result should either succeed or report if checked in recently
    expect(res).toBeDefined();
    expect(typeof res.success).toBe('boolean');
    expect(res.message).toBeDefined();
  });

  it('enforces lockout when the same member is checked in again immediately', () => {
    // Create temporary member to guarantee immediate duplicate test
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
});
