import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-theme-toggle=""
      className="h-9 w-9 flex-shrink-0 rounded-[10px] border-[1.5px] border-line bg-surface text-ink cursor-pointer flex items-center justify-center hover:border-ink"
    >
      <Icon className="w-4 h-4" strokeWidth={2} aria-hidden />
    </button>
  );
};

export default ThemeToggle;
