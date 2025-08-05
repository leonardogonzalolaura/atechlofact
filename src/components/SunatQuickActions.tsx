'use client'
import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useAlert } from './Alert';
import { Invoice } from '../services/invoiceTypes';

interface SunatQuickActionsProps {
  invoice: Invoice;
  onUpdate?: () => void;
}

const SunatQuickActions = ({ invoice, onUpdate }: SunatQuickActionsProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { generateXml, sendToSunat, downloadPdf } = useInvoices();
  const { showError, showSuccess, showConfirm, AlertComponent } = useAlert();

  const handleGenerateXml = async () => {
    try {
      setLoading('xml');
      await generateXml(invoice.id);
      showSuccess('XML Generado', 'El archivo XML se ha generado correctamente');
      onUpdate?.();
    } catch (error: any) {
      showError('Error', [error.message]);
    } finally {
      setLoading(null);
    }
  };

  const handleSendToSunat = async () => {
    showConfirm(
      'Enviar a SUNAT',
      `¿Está seguro de enviar la factura ${invoice.invoice_number} a SUNAT?`,
      async () => {
        try {
          setLoading('sunat');
          const response = await sendToSunat(invoice.id);
          showSuccess('Enviado a SUNAT', response.message);
          onUpdate?.();
        } catch (error: any) {
          showError('Error', [error.message]);
        } finally {
          setLoading(null);
        }
      }
    );
  };

  const handleDownloadPdf = async () => {
    try {
      setLoading('pdf');
      await downloadPdf(invoice.id, `${invoice.invoice_number}.pdf`);
      showSuccess('PDF Descargado', 'El archivo PDF se ha descargado correctamente');
    } catch (error: any) {
      showError('Error', [error.message]);
    } finally {
      setLoading(null);
    }
  };

  const canSendToSunat = invoice.sunat_status !== 'accepted';

  return (
    <div className="flex space-x-2">
      <button
        onClick={handleGenerateXml}
        disabled={loading === 'xml'}
        className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Generar XML"
      >
        {loading === 'xml' ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
        ) : (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        XML
      </button>

      <button
        onClick={handleSendToSunat}
        disabled={loading === 'sunat' || !canSendToSunat}
        className="flex items-center px-3 py-1.5 text-xs font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title={canSendToSunat ? "Enviar a SUNAT" : "Ya enviado a SUNAT"}
      >
        {loading === 'sunat' ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-1"></div>
        ) : (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
        SUNAT
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={loading === 'pdf'}
        className="flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Descargar PDF"
      >
        {loading === 'pdf' ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></div>
        ) : (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        PDF
      </button>

      <AlertComponent />
    </div>
  );
};

export default SunatQuickActions;