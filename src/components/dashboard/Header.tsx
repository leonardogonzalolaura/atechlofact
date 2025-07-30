'use client'
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  user: string;
  onProfileOpen: () => void;
  onThemeSettingsOpen: () => void;
  onSettingsOpen: () => void;
  onLogout: () => void;
}

const Header = ({ user, onProfileOpen, onThemeSettingsOpen, onSettingsOpen, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className={`${theme.header} shadow-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className={`text-xl sm:text-2xl font-bold ${theme.header === 'bg-white' ? 'text-gray-900' : 'text-white'}`}>
              AtechloFact
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className={`hidden sm:block ${theme.header === 'bg-white' ? 'text-gray-700' : 'text-gray-200'}`}>
              Bienvenido, {user}
            </span>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${theme.colors.button}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${theme.colors.avatar} ${
                  theme.header === 'bg-white' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.charAt(0).toUpperCase()}
                </div>
                <svg className={`w-4 h-4 ${theme.header === 'bg-white' ? 'text-gray-600' : 'text-white'}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50 ${
                  theme.header === 'bg-white' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-600'
                }`}>
                  <button onClick={onProfileOpen} className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                    theme.header === 'bg-white' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-gray-700'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Perfil</span>
                  </button>
                  <button onClick={onThemeSettingsOpen} className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                    theme.header === 'bg-white' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-gray-700'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h10a2 2 0 002-2V7a2 2 0 00-2-2z" />
                    </svg>
                    <span>Temas</span>
                  </button>
                  <button onClick={onSettingsOpen} className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                    theme.header === 'bg-white' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-gray-700'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Configuración</span>
                  </button>
                  <hr className="my-1" />
                  <button onClick={onLogout} className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;