'use client'
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import { useCompany } from '../contexts/CompanyContext';
import { userService } from '../services/userService';
import CompanyForm from './CompanyForm';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme } = useTheme();
  const { taxConfig, updateTaxConfig } = useTax();
  const { companyData, updateCompanyData } = useCompany();
  const [activeTab, setActiveTab] = useState('company');
  const [localCompanyData, setLocalCompanyData] = useState(companyData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  const [billingConfig, setBillingConfig] = useState({
    serieFactura: 'F001',
    serieBoleta: 'B001',
    serieNota: 'N001',
    numeracionAutomatica: true,
    igv: Math.round(taxConfig.igvRate * 100) // Convertir de decimal a porcentaje
  });

  // Cargar configuración y empresas al abrir
  useEffect(() => {
    if (isOpen) {
      setLocalCompanyData(companyData);
      loadCompanies();
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('billingConfig');
        if (stored) {
          const config = JSON.parse(stored);
          setBillingConfig(prev => ({ ...prev, ...config }));
        }
      }
    }
  }, [isOpen, companyData]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setUserData(response.data.user);
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error cargando empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLocalCompanyData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Guardando configuración...', { localCompanyData, billingConfig });
    
    // Actualizar contexto de empresa
    updateCompanyData(localCompanyData);
    
    // Guardar en localStorage
    if (typeof window !== 'undefined') {
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
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Mis Empresas</h3>
                  {userData && (!userData.is_trial || companies.length === 0) && (
                    <button
                      onClick={() => setShowCompanyForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      + Agregar Empresa
                    </button>
                  )}
                </div>
                
                {userData && userData.is_trial && companies.length >= 1 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Límite Trial:</strong> Solo puedes tener 1 empresa en el plan trial. Actualiza tu plan para agregar más empresas.
                    </p>
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin text-2xl">⚙️</div>
                  </div>
                ) : companies.length > 0 ? (
                  <div className="space-y-4">
                    {companies.map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                        {editingCompany?.id === company.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                                <input
                                  type="text"
                                  value={editingCompany.rut}
                                  onChange={(e) => setEditingCompany({...editingCompany, rut: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                  type="text"
                                  value={editingCompany.name}
                                  onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                  type="text"
                                  value={editingCompany.phone || ''}
                                  onChange={(e) => setEditingCompany({...editingCompany, phone: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                  value={editingCompany.role}
                                  onChange={(e) => setEditingCompany({...editingCompany, role: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                >
                                  <option value="owner">Propietario</option>
                                  <option value="admin">Administrador</option>
                                  <option value="accountant">Contador</option>
                                  <option value="sales">Ventas</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                  type="text"
                                  value={editingCompany.address || ''}
                                  onChange={(e) => setEditingCompany({...editingCompany, address: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                              <button
                                onClick={() => setEditingCompany(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Guardando empresa:', editingCompany);
                                  // TODO: Implementar API de actualización
                                  setEditingCompany(null);
                                  loadCompanies();
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">{company.name}</h4>
                                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                                  {company.role === 'owner' ? 'Propietario' : 
                                   company.role === 'admin' ? 'Administrador' :
                                   company.role === 'accountant' ? 'Contador' : 'Ventas'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">RUT:</span>
                                  <span className="ml-2 text-gray-900">{company.rut}</span>
                                </div>
                                {company.phone && (
                                  <div>
                                    <span className="font-medium text-gray-700">Teléfono:</span>
                                    <span className="ml-2 text-gray-900">{company.phone}</span>
                                  </div>
                                )}
                                {company.address && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-gray-700">Dirección:</span>
                                    <span className="ml-2 text-gray-900">{company.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => setEditingCompany({...company})}
                              className="ml-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar empresa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">No tienes empresas registradas</p>
                    <button
                      onClick={() => setShowCompanyForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Registrar mi primera empresa
                    </button>
                  </div>
                )}
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
        
        <CompanyForm 
          isOpen={showCompanyForm}
          onClose={() => setShowCompanyForm(false)}
          onSuccess={() => {
            console.log('Empresa registrada - recargando empresas');
            loadCompanies();
          }}
        />
      </div>
    </div>
  );
};

export default Settings;