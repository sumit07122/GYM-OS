import { describe, it, expect } from 'vitest';
import { gymosRepository } from '../../src/lib/supabase/repository';

describe('Supabase Data Repository Layer', () => {
  const gymSlug = 'olympia-fitness';

  it('retrieves gym profile with fallback gracefully', async () => {
    const gym = await gymosRepository.getGym(gymSlug);
    expect(gym).toBeDefined();
    expect(gym?.slug).toBe(gymSlug);
    expect(gym?.name).toBe('Olympia Elite Fitness');
  });

  it('retrieves member list with active plans', async () => {
    const members = await gymosRepository.getMembers('gym-001-olympia');
    expect(members).toBeDefined();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);
    expect(members[0].member_code).toBeDefined();
  });

  it('retrieves financial payments and expenses', async () => {
    const payments = await gymosRepository.getPayments('gym-001-olympia');
    const expenses = await gymosRepository.getExpenses('gym-001-olympia');

    expect(Array.isArray(payments)).toBe(true);
    expect(Array.isArray(expenses)).toBe(true);
    expect(payments.length).toBeGreaterThan(0);
    expect(expenses.length).toBeGreaterThan(0);
  });
});
