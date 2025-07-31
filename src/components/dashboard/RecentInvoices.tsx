import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface RecentInvoicesProps {
  onPreviewInvoice: (invoice: any) => void;
}

const RecentInvoices = ({ onPreviewInvoice }: RecentInvoicesProps) => {
  const { theme } = useTheme();
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadRecentInvoices = () => {
      const saved = JSON.parse(localStorage.getItem('recentInvoices') || '[]');
      setRecentInvoices(saved);
    };
    
    loadRecentInvoices();
    
    const handleStorageChange = () => {
      loadRecentInvoices();
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadRecentInvoices, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredInvoices = recentInvoices.filter((invoice: any) => {
    const invoiceId = `${invoice.serie}-${invoice.numero}`;
    const matchesSearch = invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.cliente.razonSocial.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Simular estado basado en fecha (facturas de hoy = Pendiente, anteriores = Pagada)
    const invoiceDate = new Date(invoice.fechaCreacion);
    const today = new Date();
    const isToday = invoiceDate.toDateString() === today.toDateString();
    const invoiceStatus = isToday ? 'Pendiente' : 'Pagada';
    
    const matchesStatus = statusFilter === 'Todos' || invoiceStatus === statusFilter;
    
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
              <option value="Pagada">Pagada</option>
              <option value="Pendiente">Pendiente</option>
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
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((invoice: any) => {
                // Simular estado basado en fecha
                const invoiceDate = new Date(invoice.fechaCreacion);
                const today = new Date();
                const isToday = invoiceDate.toDateString() === today.toDateString();
                const invoiceStatus = isToday ? 'Pendiente' : 'Pagada';
                
                return (
                  <tr key={invoice.id} className={theme.colors.tableHover}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.serie}-{invoice.numero}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {invoice.cliente.razonSocial}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      S/ {invoice.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoiceStatus === 'Pagada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoiceStatus}
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
                  <p className="text-sm">Las facturas generadas aparecerán aquí</p>
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