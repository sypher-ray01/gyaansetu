import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200 overflow-hidden"
      aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
      title={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
    >
      <div
        className={`absolute transition-all duration-300 ease-in-out transform ${
          isDarkMode ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
        aria-hidden={isDarkMode}
      >
        <MoonIcon />
      </div>
      <div
        className={`absolute transition-all duration-300 ease-in-out transform ${
          isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
        aria-hidden={!isDarkMode}
      >
        <SunIcon />
      </div>
    </button>
  );
};