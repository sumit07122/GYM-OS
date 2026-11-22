import { describe, it, expect, beforeEach } from 'vitest';
import { generateGymSlug, validatePasswordStrength } from '../../src/lib/auth/helpers';

describe('Authentication & Onboarding Helpers', () => {
  it('generates URL-safe and unique gym slugs from gym names', () => {
    expect(generateGymSlug('Olympia Fitness Club')).toBe('olympia-fitness-club');
    expect(generateGymSlug('Gold\'s Gym Bandra West!')).toBe('golds-gym-bandra-west');
    expect(generateGymSlug('  Iron & Steel Fitness 24/7  ')).toBe('iron-steel-fitness-24-7');
  });

  it('validates password security requirements', () => {
    // Too short
    expect(validatePasswordStrength('12345').valid).toBe(false);
    expect(validatePasswordStrength('12345').error).toContain('at least 8 characters');

    // Valid password
    expect(validatePasswordStrength('GymOwner@2026!').valid).toBe(true);
    expect(validatePasswordStrength('GymOwner@2026!').error).toBeUndefined();
  });
});
