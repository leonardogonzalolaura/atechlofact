'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const themes = {
  default: {
    name: 'Predeterminado',
    primary: 'blue',
    secondary: 'gray',
    accent: 'green',
    background: 'gray-50',
    card: 'white',
    header: 'bg-white',
    colors: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      secondary: 'bg-gray-600 hover:bg-gray-700',
      accent: 'bg-green-600 hover:bg-green-700',
      stats: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'],
      avatar: 'bg-blue-600',
      button: 'bg-gray-100 hover:bg-gray-200',
      tableDivider: 'divide-gray-200',
      tableBorder: 'border-gray-200',
      tableHeader: 'bg-gray-50',
      tableHover: 'hover:bg-gray-50'
    }
  },
  corporate: {
    name: 'Corporativo',
    primary: 'slate',
    secondary: 'gray',
    accent: 'blue',
    background: 'slate-50',
    card: 'white',
    header: 'bg-slate-800',
    colors: {
      primary: 'bg-slate-600 hover:bg-slate-700',
      secondary: 'bg-gray-600 hover:bg-gray-700',
      accent: 'bg-blue-600 hover:bg-blue-700',
      stats: ['bg-slate-500', 'bg-blue-500', 'bg-gray-500', 'bg-indigo-500'],
      avatar: 'bg-slate-600',
      button: 'bg-slate-700 bg-opacity-30 hover:bg-opacity-50',
      tableDivider: 'divide-slate-200',
      tableBorder: 'border-slate-200',
      tableHeader: 'bg-slate-100',
      tableHover: 'hover:bg-slate-100'
    }
  },
  modern: {
    name: 'Moderno',
    primary: 'indigo',
    secondary: 'gray',
    accent: 'emerald',
    background: 'indigo-50',
    card: 'white',
    header: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    colors: {
      primary: 'bg-indigo-600 hover:bg-indigo-700',
      secondary: 'bg-gray-600 hover:bg-gray-700',
      accent: 'bg-emerald-600 hover:bg-emerald-700',
      stats: ['bg-indigo-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'],
      avatar: 'bg-indigo-600',
      button: 'bg-indigo-800 bg-opacity-30 hover:bg-opacity-50',
      tableDivider: 'divide-indigo-200',
      tableBorder: 'border-indigo-200',
      tableHeader: 'bg-indigo-100',
      tableHover: 'hover:bg-indigo-100'
    }
  },
  elegant: {
    name: 'Elegante',
    primary: 'purple',
    secondary: 'gray',
    accent: 'teal',
    background: 'purple-50',
    card: 'white',
    header: 'bg-gradient-to-r from-purple-600 to-pink-600',
    colors: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      secondary: 'bg-gray-600 hover:bg-gray-700',
      accent: 'bg-teal-600 hover:bg-teal-700',
      stats: ['bg-purple-500', 'bg-teal-500', 'bg-pink-500', 'bg-violet-500'],
      avatar: 'bg-purple-600',
      button: 'bg-purple-800 bg-opacity-30 hover:bg-opacity-50',
      tableDivider: 'divide-purple-200',
      tableBorder: 'border-purple-200',
      tableHeader: 'bg-purple-100',
      tableHover: 'hover:bg-purple-100'
    }
  }
};

type ThemeName = keyof typeof themes;

interface ThemeContextType {
  currentTheme: ThemeName;
  theme: typeof themes.default;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      theme: themes[currentTheme],
      setTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};