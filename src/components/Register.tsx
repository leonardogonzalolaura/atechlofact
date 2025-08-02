'use client'
import { useState } from 'react';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';

interface RegisterProps {
  onBackToLogin: () => void;
}

const Register = ({ onBackToLogin }: RegisterProps) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleRegister = () => {
    // Configurar Google OAuth usando variable de entorno
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!googleClientId) {
      setError('Google OAuth no está configurado');
      return;
    }
    
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/google/callback');
    const scope = encodeURIComponent('email profile');
    
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = googleAuthUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        company_id: null
      });

      // Enviar email de bienvenida usando tu API
      try {
        await emailService.sendWelcomeEmail({
          email: response.data.email,
          username: response.data.username,
          trial_end_date: response.data.trial_end_date
        });
      } catch (emailError) {
        console.error('Error enviando email:', emailError);
      }

      setSuccess('¡Registro exitoso! Se ha enviado un correo de bienvenida. Puedes iniciar sesión ahora.');
      
      // Limpiar formulario
      setFormData({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      });

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        onBackToLogin();
      }, 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-2xl animate-fade-in-scale" style={{transform: 'scale(0.8)', transformOrigin: 'center'}}>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Registro</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
          <p className="text-sm text-green-700 font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            id="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            required
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">Usuario</label>
          <input 
            type="text" 
            id="username" 
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Contraseña</label>
          <input 
            type="password" 
            id="confirmPassword" 
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 font-semibold"
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      {/* TODO: Habilitar registro con Google después */}
      {/* <div className="mt-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="px-3 text-gray-500 text-sm">o</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        
        <button 
          onClick={handleGoogleRegister}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 font-semibold flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Registrarse con Google</span>
        </button>
      </div> */}

      <div className="mt-6 text-center">
        <button 
          onClick={onBackToLogin}
          className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          ← Volver al Login
        </button>
      </div>
    </div>
  );
};

export default Register;