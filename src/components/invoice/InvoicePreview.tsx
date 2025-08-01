import React from 'react';
import InvoiceContent from './InvoiceContent';
import { generatePrintHTML } from './printStyles';

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: any;
}

const InvoicePreview = ({ isOpen, onClose, invoiceData }: InvoicePreviewProps) => {
  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      const printContent = document.querySelector('.print-content')?.innerHTML;
      
      if (printContent) {
        printWindow.document.write(generatePrintHTML(printContent, invoiceData));
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b no-print">
          <h2 className="text-xl font-semibold text-gray-900">
            Vista Previa - {invoiceData.tipoComprobante} {invoiceData.serie}-{invoiceData.numero}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <InvoiceContent invoiceData={invoiceData} />
        </div>

        <div className="flex justify-between items-center space-x-3 p-4 border-t bg-white no-print">
          <div className="text-sm text-gray-700">
            Documento: {invoiceData.serie}-{invoiceData.numero} | Cliente: {invoiceData.cliente.razonSocial}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;