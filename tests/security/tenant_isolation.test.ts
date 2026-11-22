import { describe, it, expect } from 'vitest';
import { gymStore } from '../../src/lib/supabase/store';

describe('Multi-Tenant Data Isolation Tests', () => {
  const gymAId = 'gym-001-olympia';

  it('provisions a second tenant and isolates member rosters', () => {
    // 1. Create Tenant B (Matrix Fitness Pune)
    const gymB = gymStore.createGym({
      name: 'Matrix Fitness Club',
      slug: 'matrix-fitness-pune',
      phone: '+91 98989 12345',
      email: 'pune@matrixfitness.in',
      address_line1: 'FC Road, Shivaji Nagar',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411005',
      country: 'India',
      timezone: 'Asia/Kolkata',
    });

    expect(gymB.id).toBeDefined();
    expect(gymB.slug).toBe('matrix-fitness-pune');

    // 2. Add member to Tenant B
    const memberB = gymStore.createMember(gymB.id, {
      full_name: 'Tanmay Bhat',
      phone: '+91 97777 66666',
      gender: 'Male',
      joining_date: '2026-11-22',
    });

    expect(memberB.gym_id).toBe(gymB.id);

    // 3. Verify Gym A members do NOT contain Tanmay Bhat
    const gymAMembers = gymStore.getMembers(gymAId);
    const leakedInA = gymAMembers.find(m => m.id === memberB.id || m.full_name === 'Tanmay Bhat');
    expect(leakedInA).toBeUndefined();

    // 4. Verify Gym B members ONLY contain its own members
    const gymBMembers = gymStore.getMembers(gymB.id);
    expect(gymBMembers.length).toBe(1);
    expect(gymBMembers[0].full_name).toBe('Tanmay Bhat');

    // 5. Verify Attendance Isolation
    gymStore.checkInMember(gymB.id, memberB.id, 'reception_manual', 'Pune Reception');
    const todayGymAAttendance = gymStore.getTodayAttendance(gymAId);
    const leakedAttendance = todayGymAAttendance.find(a => a.member_id === memberB.id);
    expect(leakedAttendance).toBeUndefined();
  });
});
