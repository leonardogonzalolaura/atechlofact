'use client'
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ReportsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsDashboard = ({ isOpen, onClose }: ReportsDashboardProps) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('ventas');
  const [dateRange, setDateRange] = useState({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  // Datos de ejemplo para reportes
  const salesData = {
    totalVentas: 125450.00,
    totalFacturas: 89,
    totalBoletas: 156,
    promedioVenta: 502.50,
    ventasPorMes: [
      { mes: 'Ene', ventas: 45000 },
      { mes: 'Feb', ventas: 52000 },
      { mes: 'Mar', ventas: 48000 },
      { mes: 'Abr', ventas: 55000 },
      { mes: 'May', ventas: 62000 }
    ]
  };

  const taxData = {
    igvGenerado: 22581.00,
    igvPagado: 18450.00,
    saldoFavor: 4131.00,
    rentaMensual: 15680.00
  };

  const topProducts = [
    { producto: 'Laptop HP Pavilion', cantidad: 25, ingresos: 62500 },
    { producto: 'Mouse Logitech', cantidad: 89, ingresos: 4005 },
    { producto: 'Teclado Mecánico', cantidad: 34, ingresos: 4080 },
    { producto: 'Monitor 24"', cantidad: 18, ingresos: 7200 }
  ];

  const topClients = [
    { cliente: 'Empresa ABC S.A.C.', facturas: 12, total: 35600 },
    { cliente: 'Comercial XYZ E.I.R.L.', facturas: 8, total: 28900 },
    { cliente: 'Servicios DEF S.R.L.', facturas: 15, total: 22400 },
    { cliente: 'Juan Pérez García', facturas: 6, total: 8750 }
  ];

  const handleExport = (type: string) => {
    console.log(`Exportando reporte: ${type}`);
    // Aquí iría la lógica de exportación
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Panel de Reportes</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros de Fecha */}
        <div className="p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={dateRange.desde}
                  onChange={(e) => setDateRange({...dateRange, desde: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateRange.hasta}
                  onChange={(e) => setDateRange({...dateRange, hasta: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                📄 PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                📊 Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('ventas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ventas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Ventas
            </button>
            <button
              onClick={() => setActiveTab('tributario')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tributario'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 Tributario
            </button>
            <button
              onClick={() => setActiveTab('productos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'productos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📦 Productos
            </button>
            <button
              onClick={() => setActiveTab('clientes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clientes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Clientes
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'ventas' && (
            <div className="space-y-6">
              {/* KPIs de Ventas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-3 rounded-lg text-white text-xl mr-4">💰</div>
                    <div>
                      <p className="text-sm text-gray-600">Total Ventas</p>
                      <p className="text-xl font-bold text-gray-900">S/ {salesData.totalVentas.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-green-500 p-3 rounded-lg text-white text-xl mr-4">📄</div>
                    <div>
                      <p className="text-sm text-gray-600">Facturas</p>
                      <p className="text-xl font-bold text-gray-900">{salesData.totalFacturas}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-3 rounded-lg text-white text-xl mr-4">🧾</div>
                    <div>
                      <p className="text-sm text-gray-600">Boletas</p>
                      <p className="text-xl font-bold text-gray-900">{salesData.totalBoletas}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-orange-500 p-3 rounded-lg text-white text-xl mr-4">📊</div>
                    <div>
                      <p className="text-sm text-gray-600">Promedio</p>
                      <p className="text-xl font-bold text-gray-900">S/ {salesData.promedioVenta}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Ventas por Mes */}
              <div className={`bg-${theme.card} p-6 rounded-lg shadow`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Mes</h3>
                <div className="space-y-3">
                  {salesData.ventasPorMes.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-12 text-sm text-gray-600">{item.mes}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-blue-500 h-4 rounded-full"
                            style={{ width: `${(item.ventas / 70000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-gray-900 text-right">S/ {item.ventas.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tributario' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-green-500 p-3 rounded-lg text-white text-xl mr-4">📈</div>
                    <div>
                      <p className="text-sm text-gray-600">IGV Generado</p>
                      <p className="text-xl font-bold text-gray-900">S/ {taxData.igvGenerado.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-red-500 p-3 rounded-lg text-white text-xl mr-4">📉</div>
                    <div>
                      <p className="text-sm text-gray-600">IGV Pagado</p>
                      <p className="text-xl font-bold text-gray-900">S/ {taxData.igvPagado.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-3 rounded-lg text-white text-xl mr-4">💎</div>
                    <div>
                      <p className="text-sm text-gray-600">Saldo a Favor</p>
                      <p className="text-xl font-bold text-gray-900">S/ {taxData.saldoFavor.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className={`bg-${theme.card} p-4 rounded-lg shadow`}>
                  <div className="flex items-center">
                    <div className="bg-purple-500 p-3 rounded-lg text-white text-xl mr-4">🏛️</div>
                    <div>
                      <p className="text-sm text-gray-600">Renta Mensual</p>
                      <p className="text-xl font-bold text-gray-900">S/ {taxData.rentaMensual.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'productos' && (
            <div className={`bg-${theme.card} rounded-lg shadow`}>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Top Productos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.producto}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{product.cantidad}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">S/ {product.ingresos.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className={`bg-${theme.card} rounded-lg shadow`}>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Top Clientes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facturas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topClients.map((client, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{client.cliente}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{client.facturas}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">S/ {client.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;