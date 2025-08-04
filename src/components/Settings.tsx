'use client'
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import { useCompany } from '../contexts/CompanyContext';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import { notificationApiService } from '../services/notificationApiService';
import { NOTIFICATION_DEFAULTS, getDefaultNotificationPreferences } from '../config/notificationDefaults';
import CompanyForm from './CompanyForm';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { theme } = useTheme();
  const { taxConfig, updateTaxConfig } = useTax();
  const { companyData, updateCompanyData, reloadCompanies } = useCompany();
  const [activeTab, setActiveTab] = useState('company');
  const [localCompanyData, setLocalCompanyData] = useState(companyData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

  const [billingConfig, setBillingConfig] = useState({
    serieFactura: 'F001',
    serieBoleta: 'B001',
    serieNota: 'N001',
    numeracionAutomatica: true,
    igv: Math.round(taxConfig.igvRate * 100) // Convertir de decimal a porcentaje
  });

  const [notificationConfig, setNotificationConfig] = useState({
    enableDesktop: NOTIFICATION_DEFAULTS.enable_desktop,
    enableInApp: NOTIFICATION_DEFAULTS.enable_in_app,
    autoCloseDelay: NOTIFICATION_DEFAULTS.auto_close_delay,
    maxNotifications: NOTIFICATION_DEFAULTS.max_notifications,
    enableStockAlerts: NOTIFICATION_DEFAULTS.enable_stock_alerts,
    enableInvoiceAlerts: NOTIFICATION_DEFAULTS.enable_invoice_alerts,
    enablePaymentAlerts: NOTIFICATION_DEFAULTS.enable_payment_alerts,
    enableSystemAlerts: NOTIFICATION_DEFAULTS.enable_system_alerts
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
        
        // Load notification config with smart caching
        const loadNotificationConfig = () => {
          const notifConfig = notificationService.getConfig();
          const storedNotifPrefs = localStorage.getItem('notificationPreferences');
          const preferences = storedNotifPrefs ? JSON.parse(storedNotifPrefs) : getDefaultNotificationPreferences();
          
          return {
            enableDesktop: notifConfig.enableDesktop,
            enableInApp: notifConfig.enableInApp,
            autoCloseDelay: notifConfig.autoCloseDelay,
            maxNotifications: notifConfig.maxNotifications,
            enableStockAlerts: preferences.enableStockAlerts,
            enableInvoiceAlerts: preferences.enableInvoiceAlerts,
            enablePaymentAlerts: preferences.enablePaymentAlerts,
            enableSystemAlerts: preferences.enableSystemAlerts
          };
        };
        
        // Set initial config immediately
        setNotificationConfig(loadNotificationConfig());
        
        // Check if we need to sync with backend (only if cache is old)
        const lastConfigSync = localStorage.getItem('notificationConfigTimestamp');
        const shouldSync = !lastConfigSync || (Date.now() - parseInt(lastConfigSync)) > 300000; // 5 minutes
        
        if (shouldSync) {
          notificationApiService.getSettings()
            .then(backendSettings => {
              setNotificationConfig({
                enableDesktop: backendSettings.enable_desktop,
                enableInApp: backendSettings.enable_in_app,
                autoCloseDelay: backendSettings.auto_close_delay,
                maxNotifications: backendSettings.max_notifications,
                enableStockAlerts: backendSettings.enable_stock_alerts,
                enableInvoiceAlerts: backendSettings.enable_invoice_alerts,
                enablePaymentAlerts: backendSettings.enable_payment_alerts,
                enableSystemAlerts: backendSettings.enable_system_alerts
              });
              localStorage.setItem('notificationConfigTimestamp', Date.now().toString());
            })
            .catch(error => {
              console.warn('Could not sync notification settings:', error);
            });
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

  const handleSave = async () => {
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
      
      // Save notification config
      await notificationService.updateConfig({
        enableDesktop: notificationConfig.enableDesktop,
        enableInApp: notificationConfig.enableInApp,
        autoCloseDelay: notificationConfig.autoCloseDelay,
        maxNotifications: notificationConfig.maxNotifications
      });
      
      // Save alert preferences to backend
      try {
        await notificationApiService.updateSettings({
          enable_stock_alerts: notificationConfig.enableStockAlerts,
          enable_invoice_alerts: notificationConfig.enableInvoiceAlerts,
          enable_payment_alerts: notificationConfig.enablePaymentAlerts,
          enable_system_alerts: notificationConfig.enableSystemAlerts
        });
      } catch (error) {
        console.error('Error saving notification preferences:', error);
      }
      
      localStorage.setItem('notificationPreferences', JSON.stringify({
        enableStockAlerts: notificationConfig.enableStockAlerts,
        enableInvoiceAlerts: notificationConfig.enableInvoiceAlerts,
        enablePaymentAlerts: notificationConfig.enablePaymentAlerts,
        enableSystemAlerts: notificationConfig.enableSystemAlerts
      }));
      
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
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'notifications' 
                    ? `${theme.colors.primary} text-white` 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notificaciones</span>
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
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">RUC</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.ruc || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, ruc: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Ingrese RUC"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.name || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Nombre comercial"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.business_name || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, business_name: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Razón social"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Representante Legal</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.legal_representative || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, legal_representative: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Representante legal"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.phone || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, phone: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Teléfono"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    value={editingCompany.email || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="email@empresa.com"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                                <div className="relative">
                                  <input
                                    type="url"
                                    value={editingCompany.website || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, website: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="https://empresa.com"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Industria</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.industry || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, industry: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Sector o industria"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Régimen Tributario</label>
                                <div className="relative">
                                  <select
                                    value={editingCompany.tax_regime || 'general'}
                                    onChange={(e) => setEditingCompany({...editingCompany, tax_regime: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                  >
                                    <option value="general">General</option>
                                    <option value="especial">Especial</option>
                                    <option value="mype">MYPE</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                                <div className="relative">
                                  <select
                                    value={editingCompany.currency || 'PEN'}
                                    onChange={(e) => setEditingCompany({...editingCompany, currency: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                  >
                                    <option value="PEN">Soles (PEN)</option>
                                    <option value="USD">Dólares (USD)</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario SUNAT</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.sunat_user || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, sunat_user: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Usuario SUNAT"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña SUNAT</label>
                                <div className="relative">
                                  <input
                                    type="password"
                                    value={editingCompany.sunat_password || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, sunat_password: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Contraseña SUNAT"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                                <div className="relative">
                                  <select
                                    value={editingCompany.role}
                                    onChange={(e) => setEditingCompany({...editingCompany, role: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400 appearance-none"
                                  >
                                    <option value="owner">Propietario</option>
                                    <option value="admin">Administrador</option>
                                    <option value="accountant">Contador</option>
                                    <option value="sales">Ventas</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={editingCompany.address || ''}
                                    onChange={(e) => setEditingCompany({...editingCompany, address: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                    placeholder="Dirección completa"
                                  />
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
                                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                  {(editingCompany.logo_url || editLogoFile) && (
                                    <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                                      <img 
                                        src={editLogoFile ? URL.createObjectURL(editLogoFile) : editingCompany.logo_url} 
                                        alt="Logo preview" 
                                        className="w-16 h-16 object-contain border rounded-lg"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Logo actual</p>
                                        <p className="text-xs text-gray-500">Vista previa del logo</p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditLogoFile(null);
                                          setEditingCompany({...editingCompany, logo_url: ''});
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  )}
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-2">Subir archivo</label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setEditLogoFile(file);
                                            setEditingCompany({...editingCompany, logo_url: ''});
                                          }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                      />
                                    </div>
                                    <div className="relative">
                                      <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                      </div>
                                      <div className="relative flex justify-center text-xs">
                                        <span className="bg-gray-50 px-2 text-gray-500">o ingresa URL</span>
                                      </div>
                                    </div>
                                    <div>
                                      <input
                                        type="url"
                                        value={editingCompany.logo_url || ''}
                                        onChange={(e) => {
                                          setEditingCompany({...editingCompany, logo_url: e.target.value});
                                          setEditLogoFile(null);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                                        placeholder="https://ejemplo.com/logo.png"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                              <button
                                onClick={() => setEditingCompany(null)}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    
                                    // Si hay archivo de logo, convertir a base64
                                    let finalEditData = { ...editingCompany };
                                    if (editLogoFile) {
                                      const reader = new FileReader();
                                      const logoBase64 = await new Promise<string>((resolve) => {
                                        reader.onload = (e) => resolve(e.target?.result as string);
                                        reader.readAsDataURL(editLogoFile);
                                      });
                                      finalEditData.logo_url = logoBase64;
                                    }
                                    
                                    // Preparar datos para la API (sin campos internos)
                                    const updateData = {
                                      name: finalEditData.name,
                                      business_name: finalEditData.business_name,
                                      ruc: finalEditData.ruc,
                                      legal_representative: finalEditData.legal_representative,
                                      phone: finalEditData.phone,
                                      email: finalEditData.email,
                                      website: finalEditData.website,
                                      address: finalEditData.address,
                                      industry: finalEditData.industry,
                                      tax_regime: finalEditData.tax_regime,
                                      currency: finalEditData.currency,
                                      logo_url: finalEditData.logo_url,
                                      sunat_user: finalEditData.sunat_user,
                                      sunat_password: finalEditData.sunat_password
                                    };
                                    
                                    await userService.updateCompany(editingCompany.id, updateData);
                                    
                                    setEditingCompany(null);
                                    setEditLogoFile(null);
                                    loadCompanies();
                                  } catch (error) {
                                    console.error('Error actualizando empresa:', error);
                                    alert(error instanceof Error ? error.message : 'Error actualizando empresa');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                              >
                                {loading && (
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                )}
                                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
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
                                  <span className="font-medium text-gray-700">RUC:</span>
                                  <span className="ml-2 text-gray-900">{company.ruc}</span>
                                </div>
                                {company.business_name && (
                                  <div>
                                    <span className="font-medium text-gray-700">Razón Social:</span>
                                    <span className="ml-2 text-gray-900">{company.business_name}</span>
                                  </div>
                                )}
                                {company.legal_representative && (
                                  <div>
                                    <span className="font-medium text-gray-700">Representante:</span>
                                    <span className="ml-2 text-gray-900">{company.legal_representative}</span>
                                  </div>
                                )}
                                {company.phone && (
                                  <div>
                                    <span className="font-medium text-gray-700">Teléfono:</span>
                                    <span className="ml-2 text-gray-900">{company.phone}</span>
                                  </div>
                                )}
                                {company.email && (
                                  <div>
                                    <span className="font-medium text-gray-700">Email:</span>
                                    <span className="ml-2 text-gray-900">{company.email}</span>
                                  </div>
                                )}
                                {company.website && (
                                  <div>
                                    <span className="font-medium text-gray-700">Web:</span>
                                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">{company.website}</a>
                                  </div>
                                )}
                                {company.industry && (
                                  <div>
                                    <span className="font-medium text-gray-700">Industria:</span>
                                    <span className="ml-2 text-gray-900">{company.industry}</span>
                                  </div>
                                )}
                                {company.tax_regime && (
                                  <div>
                                    <span className="font-medium text-gray-700">Régimen:</span>
                                    <span className="ml-2 text-gray-900">
                                      {company.tax_regime === 'general' ? 'General' :
                                       company.tax_regime === 'especial' ? 'Especial' : 'MYPE'}
                                    </span>
                                  </div>
                                )}
                                {company.currency && (
                                  <div>
                                    <span className="font-medium text-gray-700">Moneda:</span>
                                    <span className="ml-2 text-gray-900">{company.currency}</span>
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
                              onClick={() => {
                                setEditingCompany({...company});
                                setEditLogoFile(null);
                              }}
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
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Factura</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={billingConfig.serieFactura}
                        onChange={(e) => setBillingConfig({...billingConfig, serieFactura: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                        placeholder="F001"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Boleta</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={billingConfig.serieBoleta}
                        onChange={(e) => setBillingConfig({...billingConfig, serieBoleta: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                        placeholder="B001"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serie Nota</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={billingConfig.serieNota}
                        onChange={(e) => setBillingConfig({...billingConfig, serieNota: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                        placeholder="N001"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">IGV (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={billingConfig.igv}
                        onChange={(e) => {
                          const newIgv = Number(e.target.value);
                          setBillingConfig({...billingConfig, igv: newIgv});
                        }}
                        min="0"
                        max="100"
                        step="1"
                        className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm transition-all duration-200 hover:border-gray-400"
                        placeholder="18"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingConfig.numeracionAutomatica}
                        onChange={(e) => setBillingConfig({...billingConfig, numeracionAutomatica: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Numeración automática</span>
                        <p className="text-xs text-gray-500">Los números de comprobantes se generarán automáticamente</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
                
                {/* General Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Configuración General</h4>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enableDesktop}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enableDesktop: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notificaciones de Escritorio</span>
                        <p className="text-xs text-gray-500">Mostrar notificaciones del sistema operativo</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enableInApp}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enableInApp: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Notificaciones en la Aplicación</span>
                        <p className="text-xs text-gray-500">Mostrar notificaciones dentro del sistema</p>
                      </div>
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo de Auto-cierre (ms)</label>
                        <input
                          type="number"
                          value={notificationConfig.autoCloseDelay}
                          onChange={(e) => setNotificationConfig({...notificationConfig, autoCloseDelay: parseInt(e.target.value) || 5000})}
                          min="1000"
                          max="30000"
                          step="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Notificaciones</label>
                        <input
                          type="number"
                          value={notificationConfig.maxNotifications}
                          onChange={(e) => setNotificationConfig({...notificationConfig, maxNotifications: parseInt(e.target.value) || 50})}
                          min="10"
                          max="200"
                          step="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alert Types */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Tipos de Alertas</h4>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enableStockAlerts}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enableStockAlerts: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⚠️</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Alertas de Stock</span>
                          <p className="text-xs text-gray-500">Notificar cuando productos tengan stock bajo o estén agotados</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enableInvoiceAlerts}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enableInvoiceAlerts: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📄</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Alertas de Facturas</span>
                          <p className="text-xs text-gray-500">Notificar sobre facturas creadas, vencimientos y estados</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enablePaymentAlerts}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enablePaymentAlerts: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">💰</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Alertas de Pagos</span>
                          <p className="text-xs text-gray-500">Notificar sobre pagos recibidos y pendientes</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationConfig.enableSystemAlerts}
                        onChange={(e) => setNotificationConfig({...notificationConfig, enableSystemAlerts: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">⚙️</span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Alertas del Sistema</span>
                          <p className="text-xs text-gray-500">Notificar sobre actualizaciones, backups y errores del sistema</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Test Notification */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-md font-medium text-blue-900 mb-2">Probar Notificaciones</h4>
                  <p className="text-sm text-blue-700 mb-4">Envía una notificación de prueba para verificar tu configuración</p>
                  <button
                    onClick={() => {
                      notificationService.info(
                        'Notificación de Prueba',
                        'Esta es una notificación de prueba para verificar tu configuración',
                        {
                          desktopOptions: {
                            requireInteraction: false
                          }
                        }
                      );
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enviar Notificación de Prueba
                  </button>
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
            reloadCompanies();
          }}
        />
      </div>
    </div>
  );
};

export default Settings;
