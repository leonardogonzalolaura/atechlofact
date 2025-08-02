'use client'
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const code = searchParams.get('code');

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Google Callback</h1>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <h4 className="font-bold text-red-800">Error:</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {code && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h4 className="font-bold text-green-800">✓ Código recibido</h4>
          <p className="text-green-700 text-sm">Procesando registro...</p>
        </div>
      )}
      
      {!error && !code && (
        <p className="text-gray-600">Esperando respuesta de Google...</p>
      )}
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}