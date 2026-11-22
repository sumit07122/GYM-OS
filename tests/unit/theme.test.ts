import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredTheme, resolveTheme, THEME_STORAGE_KEY } from '../../src/lib/theme/context';

// Ensure localStorage polyfill for Node.js test runner
const memoryStore = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (k: string) => memoryStore.get(k) ?? null,
    setItem: (k: string, v: string) => memoryStore.set(k, String(v)),
    removeItem: (k: string) => memoryStore.delete(k),
    clear: () => memoryStore.clear(),
  };
}

describe('Theme Engine & System Adaptation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to system when no preference is saved', () => {
    expect(getStoredTheme()).toBe('system');
  });

  it('reads stored user preference when set', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(getStoredTheme()).toBe('light');

    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('resolves dark theme directly for dark mode', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('dark', true)).toBe('dark');
  });

  it('resolves light theme directly for light mode', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('resolves system mode based on system prefers-color-scheme media query', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
