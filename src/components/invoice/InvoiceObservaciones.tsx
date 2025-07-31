import React from 'react';

interface InvoiceObservacionesProps {
  invoiceData: any;
  setInvoiceData: (data: any) => void;
}

const InvoiceObservaciones = ({ invoiceData, setInvoiceData }: InvoiceObservacionesProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
      <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Adicionales</label>
      <textarea
        value={invoiceData.observaciones}
        onChange={(e) => setInvoiceData({...invoiceData, observaciones: e.target.value})}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        placeholder="Ingrese observaciones adicionales para el comprobante (opcional)"
      />
      <p className="text-sm text-gray-500 mt-2">
        Las observaciones aparecerán en el comprobante impreso
      </p>
    </div>
  );
};

export default InvoiceObservaciones;