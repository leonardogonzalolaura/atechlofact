'use client'
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ProductListProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  unidadMedida: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  afectoIGV: boolean;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const ProductList = ({ isOpen, onClose }: ProductListProps) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODOS');
  const [filterStock, setFilterStock] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos de ejemplo
  const allProducts: Product[] = [
    {
      id: '1',
      codigo: 'PROD001',
      descripcion: 'Laptop HP Pavilion 15.6"',
      categoria: 'PRODUCTO',
      unidadMedida: 'NIU',
      precio: 2500.00,
      stock: 15,
      stockMinimo: 5,
      afectoIGV: true,
      fechaRegistro: '2024-01-15',
      estado: 'ACTIVO'
    },
    {
      id: '2',
      codigo: 'SERV001',
      descripcion: 'Servicio de Consultoría IT',
      categoria: 'SERVICIO',
      unidadMedida: 'NIU',
      precio: 150.00,
      stock: 0,
      stockMinimo: 0,
      afectoIGV: true,
      fechaRegistro: '2024-01-20',
      estado: 'ACTIVO'
    },
    {
      id: '3',
      codigo: 'PROD002',
      descripcion: 'Mouse Inalámbrico Logitech',
      categoria: 'PRODUCTO',
      unidadMedida: 'NIU',
      precio: 45.00,
      stock: 3,
      stockMinimo: 10,
      afectoIGV: true,
      fechaRegistro: '2024-02-01',
      estado: 'ACTIVO'
    },
    {
      id: '4',
      codigo: 'PROD003',
      descripcion: 'Cable HDMI 2m',
      categoria: 'PRODUCTO',
      unidadMedida: 'MTR',
      precio: 25.00,
      stock: 50,
      stockMinimo: 20,
      afectoIGV: true,
      fechaRegistro: '2024-02-10',
      estado: 'ACTIVO'
    },
    {
      id: '5',
      codigo: 'PROD004',
      descripcion: 'Teclado Mecánico RGB',
      categoria: 'PRODUCTO',
      unidadMedida: 'NIU',
      precio: 120.00,
      stock: 0,
      stockMinimo: 5,
      afectoIGV: true,
      fechaRegistro: '2024-02-15',
      estado: 'INACTIVO'
    }
  ];

  if (!isOpen) return null;

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = 
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'TODOS' || product.categoria === filterCategory;
    
    const matchesStock = 
      filterStock === 'TODOS' ||
      (filterStock === 'BAJO_STOCK' && product.stock <= product.stockMinimo) ||
      (filterStock === 'SIN_STOCK' && product.stock === 0) ||
      (filterStock === 'CON_STOCK' && product.stock > 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (product: Product) => {
    console.log('Editar producto:', product);
    // Aquí iría la lógica para abrir el modal de edición
  };

  const handleToggleStatus = (productId: string) => {
    console.log('Cambiar estado del producto:', productId);
    // Aquí iría la lógica para cambiar el estado del producto
  };

  const getStockStatus = (product: Product) => {
    if (product.categoria === 'SERVICIO') return { text: 'N/A', color: 'bg-gray-100 text-gray-800' };
    if (product.stock === 0) return { text: 'Sin Stock', color: 'bg-red-100 text-red-800' };
    if (product.stock <= product.stockMinimo) return { text: 'Bajo Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Normal', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Lista de Productos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 min-w-80"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              >
                <option value="TODOS">Todas las categorías</option>
                <option value="PRODUCTO">Productos</option>
                <option value="SERVICIO">Servicios</option>
                <option value="BIEN">Bienes</option>
              </select>
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              >
                <option value="TODOS">Todos los stocks</option>
                <option value="CON_STOCK">Con stock</option>
                <option value="BAJO_STOCK">Bajo stock</option>
                <option value="SIN_STOCK">Sin stock</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className={`min-w-full divide-y ${theme.colors.tableDivider}`}>
            <thead className={theme.colors.tableHeader}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`bg-${theme.card} divide-y ${theme.colors.tableDivider}`}>
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className={theme.colors.tableHover}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.codigo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{product.descripcion}</div>
                        <div className="text-gray-500 text-xs">
                          {product.unidadMedida} • {product.afectoIGV ? 'Con IGV' : 'Sin IGV'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      S/ {product.precio.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {product.categoria === 'SERVICIO' ? 'N/A' : product.stock}
                        </div>
                        {product.categoria !== 'SERVICIO' && (
                          <div className="text-gray-500 text-xs">
                            Mín: {product.stockMinimo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.estado === 'ACTIVO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          className={`transition-colors ${
                            product.estado === 'ACTIVO'
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={product.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                        >
                          {product.estado === 'ACTIVO' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredProducts.length)} de {filteredProducts.length} productos
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

export default ProductList;