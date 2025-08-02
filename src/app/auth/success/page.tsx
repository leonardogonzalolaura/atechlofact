'use client'
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      // Si no hay token, redirigir al login
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [searchParams, router]);

  const token = searchParams.get('token');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        {token ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Registro exitoso!</h1>
            <p className="text-gray-600 mb-4">Te has registrado correctamente con Google.</p>
            <p className="text-sm text-gray-500">Redirigiendo al dashboard...</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">No se recibió token de autenticación.</p>
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Procesando...</h1>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}