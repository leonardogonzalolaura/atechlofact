import React from 'react';

interface CompanyRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

const CompanyRequiredModal = ({ isOpen, onClose, onOpenSettings }: CompanyRequiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Empresa Requerida
            </h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Para crear documentos necesitas configurar al menos una empresa. 
            Ve a Configuración para registrar los datos de tu empresa.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Ir a Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyRequiredModal;