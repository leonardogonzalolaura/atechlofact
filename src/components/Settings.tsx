'use client'
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme } = useTheme();
  const { taxConfig, updateTaxConfig } = useTax();
  const [activeTab, setActiveTab] = useState('company');

  const [companyData, setCompanyData] = useState({
    ruc: '20123456789',
    razonSocial: 'Mi Empresa S.A.C.',
    direccion: 'Av. Principal 123, Lima',
    telefono: '01-234-5678',
    email: 'contacto@miempresa.com'
  });

  const [billingConfig, setBillingConfig] = useState({
    serieFactura: 'F001',
    serieBoleta: 'B001',
    serieNota: 'N001',
    numeracionAutomatica: true,
    igv: Math.round(taxConfig.igvRate * 100) // Convertir de decimal a porcentaje
  });

  // Cargar configuración desde localStorage al abrir
  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const stored = localStorage.getItem('billingConfig');
      if (stored) {
        const config = JSON.parse(stored);
        setBillingConfig(prev => ({ ...prev, ...config }));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    console.log('Guardando configuración...', { companyData, billingConfig });
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('companyData', JSON.stringify(companyData));
      localStorage.setItem('billingConfig', JSON.stringify(billingConfig));
      
      // Actualizar contexto de impuestos
      updateTaxConfig({
        igvRate: billingConfig.igv / 100 // Convertir porcentaje a decimal
      });
      
      // Disparar evento para notificar cambios
      window.dispatchEvent(new Event('billingConfigChanged'));
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          <div className="w-full sm:w-64 bg-gray-50 p-4 flex-shrink-0">
            <nav className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-x-visible">
              <button
                onClick={() => setActiveTab('company')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'company' 
                    ? `${theme.colors.primary} text-white` 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Datos de Empresa</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'billing' 
                    ? `${theme.colors.primary} text-white` 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Facturación</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RUC</label>
                    <input
                      type="text"
                      value={companyData.ruc}
                      onChange={(e) => setCompanyData({...companyData, ruc: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social</label>
                    <input
                      type="text"
                      value={companyData.razonSocial}
                      onChange={(e) => setCompanyData({...companyData, razonSocial: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={companyData.direccion}
                      onChange={(e) => setCompanyData({...companyData, direccion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="text"
                      value={companyData.telefono}
                      onChange={(e) => setCompanyData({...companyData, telefono: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Facturación</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Factura</label>
                    <input
                      type="text"
                      value={billingConfig.serieFactura}
                      onChange={(e) => setBillingConfig({...billingConfig, serieFactura: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Boleta</label>
                    <input
                      type="text"
                      value={billingConfig.serieBoleta}
                      onChange={(e) => setBillingConfig({...billingConfig, serieBoleta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Nota</label>
                    <input
                      type="text"
                      value={billingConfig.serieNota}
                      onChange={(e) => setBillingConfig({...billingConfig, serieNota: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IGV (%)</label>
                    <input
                      type="number"
                      value={billingConfig.igv}
                      onChange={(e) => {
                        const newIgv = Number(e.target.value);
                        setBillingConfig({...billingConfig, igv: newIgv});
                      }}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={billingConfig.numeracionAutomatica}
                        onChange={(e) => setBillingConfig({...billingConfig, numeracionAutomatica: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Numeración automática</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`${theme.colors.primary} text-white px-6 py-2 rounded-lg transition-colors font-medium`}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;