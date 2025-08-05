'use client'
import React, { useState, useEffect } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useAlert } from './Alert';
import { Invoice } from '../services/invoiceTypes';

interface SunatStatusModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

const SunatStatusModal = ({ invoice, isOpen, onClose }: SunatStatusModalProps) => {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { getSunatStatus } = useInvoices();
  const { showError, AlertComponent } = useAlert();

  useEffect(() => {
    if (isOpen && invoice) {
      loadSunatStatus();
    }
  }, [isOpen, invoice]);

  const loadSunatStatus = async () => {
    if (!invoice) return;
    
    try {
      setLoading(true);
      const response = await getSunatStatus(invoice.id);
      setStatusData(response.data);
    } catch (error: any) {
      showError('Error', [error.message]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      sent: 'text-blue-600 bg-blue-100',
      accepted: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      sent: 'Enviado',
      accepted: 'Aceptado',
      rejected: 'Rechazado'
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Estado SUNAT - {invoice.invoice_number}
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

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Consultando estado...</span>
            </div>
          ) : statusData ? (
            <div className="space-y-6">
              {/* Estado Principal */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Estado Actual</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.sunat_status)}`}>
                    {getStatusText(statusData.sunat_status)}
                  </span>
                </div>
              </div>

              {/* Información de Respuesta */}
              {statusData.sunat_response_code && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Respuesta
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm font-mono text-gray-900">
                        {statusData.sunat_response_code}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-sm text-gray-900">
                        {statusData.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje de Respuesta */}
              {statusData.sunat_response_message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje de SUNAT
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">
                      {statusData.sunat_response_message}
                    </p>
                  </div>
                </div>
              )}

              {/* Archivos Generados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statusData.xml_path && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo XML
                    </label>
                    <div className="bg-green-50 rounded-lg p-3 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-800">XML Generado</span>
                    </div>
                  </div>
                )}
                {statusData.pdf_path && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo PDF
                    </label>
                    <div className="bg-green-50 rounded-lg p-3 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-green-800">PDF Disponible</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Información del Documento */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Información del Documento</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Número:</span>
                    <span className="ml-2 font-medium">{statusData.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <span className="ml-2 font-medium">{invoice.customer.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <span className="ml-2 font-medium">{invoice.currency} {invoice.total_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <span className="ml-2 font-medium">{new Date(invoice.issue_date).toLocaleDateString('es-PE')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <p className="text-gray-600">No se pudo obtener el estado de SUNAT</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={loadSunatStatus}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Actualizar'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>

        <AlertComponent />
      </div>
    </div>
  );
};

export default SunatStatusModal;