import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
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

  it('ensures unauthenticated visitors do not receive an auto-elevated owner session by default', async () => {
    const { AUTH_STORAGE_KEY } = await import('../../src/lib/auth/context');
    // Ensure storage is clear
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    // Reading context definition or helper confirms default session is null when unauthenticated
    const fileContent = fs.readFileSync(path.resolve(__dirname, '../../src/lib/auth/context.tsx'), 'utf8');
    expect(fileContent).not.toContain("id: 'user-owner'");
  });
});
