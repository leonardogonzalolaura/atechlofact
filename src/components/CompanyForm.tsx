'use client'
import { useState } from 'react';
import { userService } from '../services/userService';

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CompanyForm = ({ isOpen, onClose, onSuccess }: CompanyFormProps) => {
  const [formData, setFormData] = useState({
    ruc: '',
    name: '',
    business_name: '',
    legal_representative: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    industry: '',
    tax_regime: 'general',
    currency: 'PEN',
    logo_url: '',
    sunat_user: '',
    sunat_password: '',
    role: 'owner'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Si hay archivo de logo, convertir a base64
      let finalFormData = { ...formData };
      if (logoFile) {
        const reader = new FileReader();
        const logoBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logoFile);
        });
        finalFormData.logo_url = logoBase64;
      }
      
      // Preparar datos para la API
      const companyData = {
        ruc: finalFormData.ruc,
        name: finalFormData.name,
        business_name: finalFormData.business_name,
        legal_representative: finalFormData.legal_representative,
        phone: finalFormData.phone,
        email: finalFormData.email,
        website: finalFormData.website,
        address: finalFormData.address,
        industry: finalFormData.industry,
        tax_regime: finalFormData.tax_regime,
        currency: finalFormData.currency,
        logo_url: finalFormData.logo_url,
        sunat_user: finalFormData.sunat_user,
        sunat_password: finalFormData.sunat_password,
        role: finalFormData.role
      };
      
      await userService.registerCompany(companyData);
      onSuccess();
      onClose();
      // Limpiar formulario
      setFormData({
        ruc: '',
        name: '',
        business_name: '',
        legal_representative: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        industry: '',
        tax_regime: 'general',
        currency: 'PEN',
        logo_url: '',
        sunat_user: '',
        sunat_password: '',
        role: 'owner'
      });
      setLogoFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error registrando empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Empresa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-hidden flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ruc}
                  onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="20123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Comercial <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Mi Empresa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Mi Empresa SAC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Representante Legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.legal_representative}
                  onChange={(e) => setFormData({...formData, legal_representative: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="+51 999 888 777"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="empresa@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industria</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Tecnología"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Régimen Tributario</label>
                <select
                  value={formData.tax_regime}
                  onChange={(e) => setFormData({...formData, tax_regime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="general">Régimen General</option>
                  <option value="especial">Régimen Especial</option>
                  <option value="mype">Régimen MYPE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario SUNAT</label>
                <input
                  type="text"
                  value={formData.sunat_user}
                  onChange={(e) => setFormData({...formData, sunat_user: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Usuario SUNAT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña SUNAT</label>
                <input
                  type="password"
                  value={formData.sunat_password}
                  onChange={(e) => setFormData({...formData, sunat_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Contraseña SUNAT"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Av. Principal 123, Lima"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
              <div className="space-y-3">
                {(formData.logo_url || logoFile) && (
                  <div className="flex items-center space-x-3">
                    <img 
                      src={logoFile ? URL.createObjectURL(logoFile) : formData.logo_url} 
                      alt="Logo preview" 
                      className="w-16 h-16 object-contain border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setFormData({...formData, logo_url: ''});
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
                <div className="flex space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setFormData({...formData, logo_url: ''});
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div className="text-center text-gray-500 text-sm">o</div>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => {
                    setFormData({...formData, logo_url: e.target.value});
                    setLogoFile(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="O ingresa URL del logo: https://ejemplo.com/logo.png"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="owner">Propietario</option>
                <option value="admin">Administrador</option>
                <option value="accountant">Contador</option>
                <option value="sales">Ventas</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Registrar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;