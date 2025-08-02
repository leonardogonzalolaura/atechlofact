'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GoogleCallback() {
  const [params, setParams] = useState<any>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const allParams: any = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    setParams(allParams);
    console.log('Parámetros recibidos:', allParams);
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Google Callback - Debug</h1>
        <div className="text-left">
          <h3 className="font-bold mb-2">Parámetros recibidos:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(params, null, 2)}
          </pre>
          
          {params.error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
              <h4 className="font-bold text-red-800">Error:</h4>
              <p className="text-red-700">{params.error}</p>
              {params.error_description && (
                <p className="text-red-600 text-sm mt-2">{params.error_description}</p>
              )}
            </div>
          )}
          
          {params.code && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
              <h4 className="font-bold text-green-800">✓ Código recibido correctamente</h4>
              <p className="text-green-700 text-sm">Código: {params.code.substring(0, 20)}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}