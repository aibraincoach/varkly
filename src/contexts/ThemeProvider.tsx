import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/app';
import {
  nextPreference,
  readStoredPreference,
  resolveTheme,
  THEME_COLORS,
  ThemeContext,
  type ThemePreference,
} from './theme-context';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function readInitialPreference(): ThemePreference {
  try {
    return readStoredPreference(localStorage.getItem(STORAGE_KEYS.theme));
  } catch {
    return 'auto';
  }
}

function readSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

function persistPreference(preference: ThemePreference): void {
  try {
    if (preference === 'auto') {
      localStorage.removeItem(STORAGE_KEYS.theme);
    } else {
      localStorage.setItem(STORAGE_KEYS.theme, preference);
    }
  } catch {
    // Storage can be unavailable (private mode, blocked); the theme still applies for this visit.
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(readInitialPreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(readSystemPrefersDark);
  const theme = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key !== null && event.key !== STORAGE_KEYS.theme) return;

      try {
        setPreference(readStoredPreference(localStorage.getItem(STORAGE_KEYS.theme)));
      } catch {
        // Storage can be unavailable; leave the in-memory preference alone.
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = nextPreference(theme);
    setPreference(next);
    persistPreference(next);
  }, [theme]);

  const value = useMemo(() => ({ theme, preference, toggleTheme }), [theme, preference, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
