import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 hover:bg-[var(--bg-tertiary)] group active:scale-95"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 group-hover:rotate-45 transition-all" />
      ) : (
        <Moon className="w-5 h-5 text-blue-500 group-hover:scale-110 group-hover:-rotate-12 transition-all" />
      )}
    </button>
  );
};

export default ThemeToggle;
