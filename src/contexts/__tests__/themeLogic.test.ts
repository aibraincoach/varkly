import { describe, it, expect } from 'vitest';
import { nextPreference, readStoredPreference, resolveTheme } from '../theme-context';

describe('readStoredPreference', () => {
  it('accepts only light and dark, everything else is auto', () => {
    expect(readStoredPreference('dark')).toBe('dark');
    expect(readStoredPreference('light')).toBe('light');
    expect(readStoredPreference(null)).toBe('auto');
    expect(readStoredPreference('auto')).toBe('auto');
    expect(readStoredPreference('purple')).toBe('auto');
  });
});

describe('resolveTheme', () => {
  it('auto follows the system', () => {
    expect(resolveTheme('auto', true)).toBe('dark');
    expect(resolveTheme('auto', false)).toBe('light');
  });

  it('explicit preference wins over the system', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });
});

describe('nextPreference', () => {
  it('flips the resolved theme to an explicit opposite', () => {
    expect(nextPreference('light')).toBe('dark');
    expect(nextPreference('dark')).toBe('light');
  });
});
