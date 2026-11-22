// Authentication & Onboarding Utilities for GymOS

/**
 * Generates a clean URL-safe slug from a gym business name
 * e.g. "Gold's Gym Bandra West!" -> "golds-gym-bandra-west"
 */
export function generateGymSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '') // remove apostrophes without spaces
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // strip leading/trailing hyphens
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates password strength (minimum 8 characters)
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long.',
    };
  }
  return { valid: true };
}
