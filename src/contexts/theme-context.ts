import { createContext } from 'react';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export type ThemeContextType = {
  theme: ResolvedTheme;
  preference: ThemePreference;
  toggleTheme: () => void;
};

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f3f3f5',
  dark: '#121216',
};

export function readStoredPreference(raw: string | null): ThemePreference {
  return raw === 'dark' || raw === 'light' ? raw : 'auto';
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'auto') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

/** The toggle always writes an explicit value; clearing storage returns to auto. */
export function nextPreference(current: ResolvedTheme): ThemePreference {
  return current === 'dark' ? 'light' : 'dark';
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
