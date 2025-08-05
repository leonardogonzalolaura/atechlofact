import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useRecentInvoices } from '../../hooks/useRecentInvoices';
import { Invoice } from '../../services/invoiceTypes';

interface RecentInvoicesProps {
  onPreviewInvoice: (invoice: any) => void;
}

const RecentInvoices = ({ onPreviewInvoice }: RecentInvoicesProps) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Use optimized hook for recent invoices
  const { invoices, loading, error } = useRecentInvoices();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || 
                         (statusFilter === 'Pagada' && invoice.status === 'paid') ||
                         (statusFilter === 'Pendiente' && invoice.status !== 'paid');
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`bg-${theme.card} rounded-lg shadow`}>
      <div className={`px-4 py-3 border-b ${theme.colors.tableBorder}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Facturas Recientes</h2>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="Todos">Todos</option>
              <option value="Pagada">Pagadas</option>
              <option value="Pendiente">Pendientes</option>
            </select>

          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${theme.colors.tableDivider}`}>
          <thead className={theme.colors.tableHeader}>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`bg-${theme.card} divide-y ${theme.colors.tableDivider}`}>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Cargando facturas...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="font-medium text-red-600">Error cargando facturas</p>
                  <p className="text-sm">{error}</p>
                </td>
              </tr>
            ) : paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice: Invoice) => {
                const getStatusInfo = (status: string) => {
                  switch (status) {
                    case 'paid':
                      return { label: 'Pagada', class: 'bg-green-100 text-green-800' };
                    case 'sent':
                      return { label: 'Enviada', class: 'bg-blue-100 text-blue-800' };
                    case 'cancelled':
                      return { label: 'Cancelada', class: 'bg-red-100 text-red-800' };
                    default:
                      return { label: 'Borrador', class: 'bg-yellow-100 text-yellow-800' };
                  }
                };
                
                const statusInfo = getStatusInfo(invoice.status);
                
                return (
                  <tr key={invoice.id} className={theme.colors.tableHover}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customer.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {invoice.currency} {(Number(invoice.total_amount) || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => onPreviewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        title="Ver factura"
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="font-medium">No hay facturas recientes</p>
                  <p className="text-sm">Las facturas creadas aparecerán aquí</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} de {filteredInvoices.length} facturas
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm border rounded-lg ${
                  currentPage === page
                    ? `${theme.colors.primary.split(' ')[0]} text-white border-transparent`
                    : 'border-gray-300 hover:bg-gray-50 text-gray-900'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentInvoices;