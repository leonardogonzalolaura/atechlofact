'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import Register from './Register';

const Login = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [credentials, setCredentials] = useState({ user: '', password: '' });
    const [showRegister, setShowRegister] = useState(false);
    const router = useRouter();
    console.log('URL de API:', process.env.NEXT_PUBLIC_API_BASE_URL);

    useEffect(() => {
        const savedCredentials = localStorage.getItem('rememberedCredentials');
        if (savedCredentials) {
            const parsed = JSON.parse(savedCredentials);
            setCredentials(parsed);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        const formData = new FormData(e.target as HTMLFormElement);
        const user = formData.get('user') as string;
        const password = formData.get('password') as string;

        try {
            const data = await authService.login({ user, password });
            localStorage.setItem('token', data.token);
            
            if (rememberMe) {
                localStorage.setItem('rememberedCredentials', JSON.stringify({ user, password }));
            } else {
                localStorage.removeItem('rememberedCredentials');
            }
            
            router.push('/dashboard');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error de conexión. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (showRegister) {
        return <Register onBackToLogin={() => setShowRegister(false)} />;
    }

    return (
        <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-2xl animate-fade-in-scale" style={{transform: 'scale(0.8)', transformOrigin: 'center'}}>
            <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Login</h1>
            
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="transform transition-all duration-200 hover:scale-105">
                    <label htmlFor="user" className="block text-sm font-semibold text-gray-700 mb-2">User</label>
                    <input 
                        type="text" 
                        id="user" 
                        name="user"
                        value={credentials.user}
                        onChange={(e) => setCredentials({...credentials, user: e.target.value})}
                        className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md text-gray-900 placeholder-gray-500" 
                        required
                    />
                </div>
                <div className="transform transition-all duration-200 hover:scale-105">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        className="w-full px-6 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:shadow-md text-gray-900 placeholder-gray-500" 
                        required
                    />
                </div>
                <div className="flex items-center">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Recordar credenciales</span>
                    </label>
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </div>
                    ) : 'Login'}
                </button>
            </form>
            <div className="mt-8 text-center space-y-3">
                <button 
                    onClick={() => setShowRegister(true)}
                    className="block w-full text-green-600 hover:text-green-800 transition-colors duration-200 font-medium hover:underline"
                >
                    ¿No tienes cuenta? Regístrate aquí
                </button>
                <a href="/forgot-password" className="block text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium hover:underline">Forgot password?</a>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="text-xs text-gray-400 space-y-1">
                        <div>AtechloFact - Sistema de Facturación Electrónica</div>
                        <div>Desarrollado con ❤️ por <span className="font-medium text-gray-600">Atechlo</span></div>
                        <div>© 2024 Atechlo. Todos los derechos reservados.</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;
