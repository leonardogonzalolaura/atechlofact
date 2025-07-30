'use client'
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAlert } from './Alert';

interface CustomerRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    razonSocial?: string;
    tipoDocumento?: string;
    numeroDocumento?: string;
    direccion?: string;
  };
  onSave?: (customerData: any) => void;
}

const CustomerRegistration = ({ isOpen, onClose, initialData, onSave }: CustomerRegistrationProps) => {
  const { theme } = useTheme();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [customerData, setCustomerData] = useState({
    tipoDocumento: 'RUC',
    numeroDocumento: '',
    razonSocial: initialData?.razonSocial || '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: ''
  });

  // Actualizar datos cuando cambie initialData
  React.useEffect(() => {
    if (initialData?.razonSocial) {
      setCustomerData(prev => ({
        ...prev,
        razonSocial: initialData.razonSocial || ''
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const validateCustomer = () => {
    const errors = [];
    
    // Validar campos obligatorios
    if (!customerData.numeroDocumento.trim()) errors.push('Número de documento es requerido');
    if (!customerData.razonSocial.trim()) errors.push('Razón social es requerida');
    if (!customerData.direccion.trim()) errors.push('Dirección es requerida');
    
    // Validar formato de documento
    if (customerData.tipoDocumento === 'RUC' && customerData.numeroDocumento.length !== 11) {
      errors.push('RUC debe tener 11 dígitos');
    }
    if (customerData.tipoDocumento === 'DNI' && customerData.numeroDocumento.length !== 8) {
      errors.push('DNI debe tener 8 dígitos');
    }
    
    // Validar email si se proporciona
    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push('Email no tiene formato válido');
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateCustomer();
    
    if (errors.length > 0) {
      showError('Errores en el registro', errors);
      return;
    }
    
    console.log('Guardando cliente...', customerData);
    // Aquí iría la lógica para guardar el cliente en la API
    
    showSuccess('Cliente registrado', 'El cliente se ha registrado correctamente');
    
    // Si hay callback onSave, ejecutarlo con los datos del cliente
    setTimeout(() => {
      if (onSave) {
        onSave(customerData);
      } else {
        onClose();
      }
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Registro de Cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Información de Identificación */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Identificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                  <select
                    value={customerData.tipoDocumento}
                    onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                    <option value="CE">Carnet de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento</label>
                  <input
                    type="text"
                    value={customerData.numeroDocumento}
                    onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Ingrese el número de documento"
                  />
                </div>
              </div>
            </div>

            {/* Información de la Empresa/Persona */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {customerData.tipoDocumento === 'RUC' ? 'Razón Social' : 'Nombres y Apellidos'}
                  </label>
                  <input
                    type="text"
                    value={customerData.razonSocial}
                    onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder={customerData.tipoDocumento === 'RUC' ? 'Ingrese la razón social' : 'Ingrese nombres y apellidos'}
                  />
                </div>
                {customerData.tipoDocumento === 'RUC' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial</label>
                    <input
                      type="text"
                      value={customerData.nombreComercial}
                      onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Nombre comercial (opcional)"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <textarea
                    value={customerData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Ingrese la dirección completa"
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={customerData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Número de teléfono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Persona de Contacto</label>
                  <input
                    type="text"
                    value={customerData.contacto}
                    onChange={(e) => handleInputChange('contacto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Nombre de la persona de contacto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Guardar Cliente
          </button>
        </div>
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default CustomerRegistration;