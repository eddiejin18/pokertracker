import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Theme menu"
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/30 bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-900"
      >
        <Icon className="h-5 w-5" />
        <ChevronDown className="h-4 w-4 opacity-60" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg border border-black/10 dark:border-white/30 bg-white dark:bg-black shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-900 ${theme === 'light' ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
          <button
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-900 ${theme === 'dark' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;


