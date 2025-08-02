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
    // Redirigir a tu API para manejar Google OAuth
    window.location.href = 'https://tools.apis.atechlo.com/apisunat/google/login';
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

      {/* Botón de Google removido - usar solo desde login */}

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