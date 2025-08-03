'use client'
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/userService';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const Profile = ({ isOpen, onClose }: ProfileProps) => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && !profileLoaded) {
      console.log('Profile modal abierto - cargando perfil por primera vez');
      loadProfile();
    } else if (isOpen && profileLoaded) {
      console.log('Profile modal abierto - usando datos en caché');
      setLoading(false);
    }
  }, [isOpen, profileLoaded]);

  const loadProfile = async () => {
    try {
      console.log('Cargando perfil...');
      setLoading(true);
      const response = await userService.getProfile();
      console.log('Respuesta del perfil:', response);
      setUserData({
        username: response.data.user.username,
        fullName: response.data.user.fullname || response.data.user.username,
        email: response.data.user.email,
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        language: 'es',
        timezone: 'America/Lima',
        emailNotifications: true,
        systemNotifications: false,
        subscription_plan: response.data.user.subscription_plan,
        is_trial: response.data.user.is_trial,
        trial_end_date: response.data.user.trial_end_date,
        profile_picture: response.data.user.profile_picture,
        auth_provider: response.data.user.auth_provider
      });
      setProfileLoaded(true); // Marcar como cargado
      setImageError(false); // Resetear error de imagen
      console.log('Perfil cargado exitosamente');
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError(error instanceof Error ? error.message : 'Error cargando perfil');
    } finally {
      setLoading(false);
    }
  };

  console.log('Profile isOpen:', isOpen);
  
  if (!isOpen) return null;

  const handleSave = () => {
    console.log('Guardando perfil...', userData);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin text-4xl mr-4">⚙️</div>
            <span className="text-lg">Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {/* Información de Suscripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Plan: {userData.subscription_plan} {userData.is_trial && '(Trial)'}
                    </p>
                    {userData.is_trial && (
                      <p className="text-sm text-blue-700">
                        Válido hasta: {new Date(userData.trial_end_date).toLocaleDateString('es-PE')}
                      </p>
                    )}
                  </div>
                  {userData.profile_picture && !imageError ? (
                    <img 
                      src={userData.profile_picture} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                  <input
                    type="text"
                    value={userData.username}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={userData.fullName}
                    onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      userData.auth_provider !== 'manual' ? 'bg-gray-100' : ''
                    }`}
                    disabled={userData.auth_provider !== 'manual'}
                  />
                  {userData.auth_provider !== 'manual' && (
                    <p className="text-xs text-gray-500 mt-1">Este campo se gestiona a través de {userData.auth_provider}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                      userData.auth_provider !== 'manual' ? 'bg-gray-100' : ''
                    }`}
                    disabled={userData.auth_provider !== 'manual'}
                  />
                  {userData.auth_provider !== 'manual' && (
                    <p className="text-xs text-gray-500 mt-1">Este campo se gestiona a través de {userData.auth_provider}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña - Solo para usuarios con registro manual */}
            {userData.auth_provider === 'manual' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                    <input
                      type="password"
                      value={userData.currentPassword}
                      onChange={(e) => setUserData({...userData, currentPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Ingrese su contraseña actual"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={userData.newPassword}
                        onChange={(e) => setUserData({...userData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Nueva contraseña"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={userData.confirmPassword}
                        onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Confirme la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mensaje para usuarios OAuth */}
            {userData.auth_provider !== 'manual' && (
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Autenticación con {userData.auth_provider}</p>
                      <p className="text-sm text-blue-700">Tu contraseña se gestiona a través de {userData.auth_provider}. No es necesario cambiarla aquí.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferencias */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select
                    value={userData.language}
                    onChange={(e) => setUserData({...userData, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                  <select
                    value={userData.timezone}
                    onChange={(e) => setUserData({...userData, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="America/Lima">Lima (UTC-5)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="Europe/Madrid">Madrid (UTC+1)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={userData.emailNotifications}
                    onChange={(e) => setUserData({...userData, emailNotifications: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Notificaciones por email</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={userData.systemNotifications}
                    onChange={(e) => setUserData({...userData, systemNotifications: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Notificaciones del sistema</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
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
            Guardar Cambios
          </button>
        </div>
      </div>

    </div>
  );
};

export default Profile;