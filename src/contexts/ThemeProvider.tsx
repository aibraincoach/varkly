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
    try {
      if (preference === 'auto') {
        localStorage.removeItem(STORAGE_KEYS.theme);
      } else {
        localStorage.setItem(STORAGE_KEYS.theme, preference);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked); the theme still applies for this visit.
    }
  }, [preference]);

  const toggleTheme = useCallback(() => {
    setPreference(nextPreference(theme));
  }, [theme]);

  const value = useMemo(() => ({ theme, preference, toggleTheme }), [theme, preference, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
