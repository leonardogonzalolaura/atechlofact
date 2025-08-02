'use client'
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emailService } from '../services/emailService';
import Login from "../components/login"; 

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si hay token de Google OAuth en la URL
    const token = searchParams.get('token');
    if (token) {
      // Guardar token
      localStorage.setItem('token', token);
      
      // Redirigir al dashboard inmediatamente
      router.push('/dashboard');
      
      // Enviar email de bienvenida solo para usuarios nuevos (no bloqueante)
      setTimeout(() => {
        try {
          const isNewUser = searchParams.get('isNewUser');
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Solo enviar email si es un usuario nuevo (registro)
          if (isNewUser === 'true') {
            emailService.sendWelcomeEmail({
              email: payload.email,
              username: payload.username,
              trial_end_date: payload.trial_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }).catch(error => {
              console.error('Error enviando email de bienvenida:', error);
            });
          }
        } catch (error) {
          console.error('Error procesando token:', error);
        }
      }, 100);
    }
  }, [searchParams, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Login />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
