import React from 'react';
import { useTax } from '../contexts/TaxContext';

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
}

const InvoicePreview = ({ isOpen, onClose, invoiceData }: InvoicePreviewProps) => {
  const { taxConfig } = useTax();

  if (!isOpen || !invoiceData) return null;

  const companyData = {
    ruc: '20123456789',
    razonSocial: 'Mi Empresa S.A.C.',
    direccion: 'Av. Principal 123, Lima',
    telefono: '01-234-5678',
    email: 'contacto@miempresa.com'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Vista Previa - {invoiceData.tipoComprobante} {invoiceData.serie}-{invoiceData.numero}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Header de la empresa */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{companyData.razonSocial}</h1>
                <p className="text-blue-100">RUC: {companyData.ruc}</p>
                <p className="text-blue-100">{companyData.direccion}</p>
                <p className="text-blue-100">{companyData.telefono} | {companyData.email}</p>
              </div>
              <div className="bg-white text-blue-600 p-4 rounded-lg text-center">
                <div className="font-bold text-lg">{invoiceData.tipoComprobante}</div>
                <div className="text-xl font-bold">{invoiceData.serie}-{invoiceData.numero}</div>
              </div>
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-gray-50 p-6 border-x border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">DATOS DEL CLIENTE</h3>
                <p><span className="font-medium">{invoiceData.cliente.tipoDocumento}:</span> {invoiceData.cliente.numeroDocumento}</p>
                <p><span className="font-medium">Cliente:</span> {invoiceData.cliente.razonSocial}</p>
                <p><span className="font-medium">Dirección:</span> {invoiceData.cliente.direccion}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">INFORMACIÓN DEL COMPROBANTE</h3>
                <p><span className="font-medium">Fecha Emisión:</span> {new Date(invoiceData.fechaEmision).toLocaleDateString('es-PE')}</p>
                {invoiceData.fechaVencimiento && (
                  <p><span className="font-medium">Fecha Vencimiento:</span> {new Date(invoiceData.fechaVencimiento).toLocaleDateString('es-PE')}</p>
                )}
                <p><span className="font-medium">Moneda:</span> {invoiceData.moneda === 'PEN' ? 'Soles' : 'Dólares'}</p>
              </div>
            </div>
          </div>

          {/* Tabla de items */}
          <div className="border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">DESCRIPCIÓN</th>
                  <th className="px-4 py-3 text-center font-medium">CANT.</th>
                  <th className="px-4 py-3 text-right font-medium">P. UNIT.</th>
                  <th className="px-4 py-3 text-right font-medium">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm">{item.descripcion}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.cantidad}</td>
                    <td className="px-4 py-3 text-sm text-right">{taxConfig.currencySymbol} {item.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{taxConfig.currencySymbol} {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 p-6 border-x border-b border-gray-200 rounded-b-lg">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{taxConfig.currencySymbol} {invoiceData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{taxConfig.igvLabel} ({(taxConfig.igvRate * 100).toFixed(0)}%):</span>
                  <span>{taxConfig.currencySymbol} {invoiceData.igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>TOTAL:</span>
                  <span>{taxConfig.currencySymbol} {invoiceData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {invoiceData.observaciones && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">OBSERVACIONES:</h4>
              <p className="text-sm text-gray-700">{invoiceData.observaciones}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;