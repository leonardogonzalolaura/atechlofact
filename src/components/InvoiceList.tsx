'use client'
import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { useAlert } from './Alert';
import { Invoice, InvoiceFilters } from '../services/invoiceTypes';
import SunatStatusModal from './SunatStatusModal';

interface InvoiceListProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceList = ({ isOpen, onClose }: InvoiceListProps) => {
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 20
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [showSunatStatus, setShowSunatStatus] = useState(false);
  
  const { 
    invoices, 
    loading, 
    error, 
    pagination, 
    totals,
    generateXml,
    sendToSunat,
    getSunatStatus,
    downloadPdf,
    deleteInvoice
  } = useInvoices(filters);
  
  const { showError, showSuccess, showConfirm, AlertComponent } = useAlert();

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getSunatStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const handleGenerateXml = async (invoice: Invoice) => {
    try {
      const response = await generateXml(invoice.id);
      showSuccess('XML Generado', 'El archivo XML se ha generado correctamente');
    } catch (error: any) {
      showError('Error', [error.message]);
    }
  };

  const handleSendToSunat = async (invoice: Invoice) => {
    showConfirm(
      'Enviar a SUNAT',
      `¿Está seguro de enviar la factura ${invoice.invoice_number} a SUNAT?`,
      async () => {
        try {
          const response = await sendToSunat(invoice.id);
          showSuccess('Enviado a SUNAT', response.message);
        } catch (error: any) {
          showError('Error', [error.message]);
        }
      }
    );
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      await downloadPdf(invoice.id, `${invoice.invoice_number}.pdf`);
      showSuccess('PDF Descargado', 'El archivo PDF se ha descargado correctamente');
    } catch (error: any) {
      showError('Error', [error.message]);
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    showConfirm(
      'Eliminar Factura',
      `¿Está seguro de eliminar la factura ${invoice.invoice_number}?`,
      async () => {
        try {
          await deleteInvoice(invoice.id);
          showSuccess('Factura Eliminada', 'La factura se ha eliminado correctamente');
        } catch (error: any) {
          showError('Error', [error.message]);
        }
      },
      'Eliminar',
      'Cancelar'
    );
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Lista de Facturas</h2>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.total_count} facturas encontradas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="sent">Enviado</option>
                <option value="paid">Pagado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado SUNAT</label>
              <select
                value={filters.sunat_status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, sunat_status: e.target.value as any || undefined, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="sent">Enviado</option>
                <option value="accepted">Aceptado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value || undefined, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value || undefined, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando facturas...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <p className="text-gray-600">No se encontraron facturas</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUNAT
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.document_type === 'invoice' ? 'Factura' : 'Boleta'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer.document_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.issue_date).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.currency} {(Number(invoice.total_amount)|| 0 ).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowSunatStatus(true);
                          }}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full hover:opacity-80 transition-opacity ${getSunatStatusBadge(invoice.sunat_status)}`}
                          title="Ver detalles del estado SUNAT"
                        >
                          {invoice.sunat_status}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleGenerateXml(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Generar XML"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleSendToSunat(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="Enviar a SUNAT"
                            disabled={invoice.sunat_status === 'accepted'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(invoice)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Descargar PDF"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} de{' '}
                {pagination.total_count} resultados
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm">
                  Página {pagination.current_page} de {pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        <AlertComponent />
        
        <SunatStatusModal
          invoice={selectedInvoice}
          isOpen={showSunatStatus}
          onClose={() => {
            setShowSunatStatus(false);
            setSelectedInvoice(null);
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceList;