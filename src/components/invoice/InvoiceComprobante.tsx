import React from 'react';

interface InvoiceComprobanteProps {
  invoiceData: any;
  setInvoiceData: (data: any) => void;
}

const InvoiceComprobante = ({ invoiceData, setInvoiceData }: InvoiceComprobanteProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Comprobante</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            value={invoiceData.tipoComprobante}
            onChange={(e) => setInvoiceData({...invoiceData, tipoComprobante: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="FACTURA">01 - Factura</option>
            <option value="BOLETA">03 - Boleta de Venta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Serie - Número</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={invoiceData.serie}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
              readOnly
            />
            <input
              type="text"
              value={invoiceData.numero}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
              readOnly
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
          <input
            type="date"
            value={invoiceData.fechaEmision}
            onChange={(e) => setInvoiceData({...invoiceData, fechaEmision: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Vencimiento</label>
          <input
            type="date"
            value={invoiceData.fechaVencimiento}
            onChange={(e) => setInvoiceData({...invoiceData, fechaVencimiento: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
          <select
            value={invoiceData.moneda}
            onChange={(e) => setInvoiceData({...invoiceData, moneda: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="PEN">Soles (PEN)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InvoiceComprobante;