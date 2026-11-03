'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
}) => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering placeholder with matching dimensions
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-[var(--border)] glass-panel ${className}`}
      />
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex p-1 rounded-2xl glass-panel border border-[var(--border)] gap-1 ${className}`}
      >
        <button
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            theme === 'light'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light Canvas</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            theme === 'dark'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--text)]'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Cyber Dark</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-[var(--border)] transition-all cursor-pointer ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-300 transition-transform duration-300 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
        )}
      </div>
    </button>
  );
};

