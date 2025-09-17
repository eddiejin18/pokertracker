import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const STORAGE_KEY = 'pokerTracker_theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;


