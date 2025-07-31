import React from 'react';

interface NavigationButtonsProps {
  activeTab: string;
  tabs: string[];
  onTabChange: (tab: string) => void;
  onClose: () => void;
  onSave: () => void;
  saveButtonText?: string;
  saveButtonIcon?: React.ReactNode;
}

const NavigationButtons = ({ 
  activeTab, 
  tabs, 
  onTabChange, 
  onClose, 
  onSave, 
  saveButtonText = "Guardar",
  saveButtonIcon
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between items-center p-4 sm:p-6 border-t bg-gray-50">
      <div className="flex space-x-2">
        {activeTab !== tabs[0] && (
          <button
            onClick={() => {
              const currentIndex = tabs.indexOf(activeTab);
              onTabChange(tabs[currentIndex - 1]);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>
        )}
        {activeTab !== tabs[tabs.length - 1] && (
          <button
            onClick={() => {
              const currentIndex = tabs.indexOf(activeTab);
              onTabChange(tabs[currentIndex + 1]);
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium flex items-center rounded-lg"
          >
            Siguiente
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
        >
          {saveButtonIcon}
          <span>{saveButtonText}</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationButtons;