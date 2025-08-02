'use client'
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from "../components/login"; 

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si hay token de Google OAuth en la URL
    const token = searchParams.get('token');
    if (token) {
      // Guardar token y redirigir al dashboard
      localStorage.setItem('token', token);
      router.push('/dashboard');
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
