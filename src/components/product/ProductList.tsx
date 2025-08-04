'use client'
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlert } from '../Alert';
import ProductRegistration from './ProductRegistration';
import { useProducts } from '../../hooks/useProducts';
import { productService } from '../../services/productService';
import { useCompany } from '../../contexts/CompanyContext';

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
  const { showError, showSuccess, showConfirm, AlertComponent } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODOS');
  const [filterStock, setFilterStock] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { activeCompany } = useCompany();
  const { products: apiProducts, loading, loadProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  
  // Recargar productos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, loadProducts]);
  
  // Convertir productos de API al formato del componente
  useEffect(() => {
    const convertedProducts = apiProducts.map(product => ({
      id: product.id.toString(),
      codigo: product.code,
      descripcion: product.name,
      categoria: product.product_type.toUpperCase(),
      unidadMedida: product.unit_type,
      precio: product.price,
      stock: product.stock || 0,
      stockMinimo: product.min_stock || 0,
      afectoIGV: product.tax_type === 'gravado',
      fechaRegistro: new Date(product.created_at).toISOString().split('T')[0],
      estado: product.is_active ? 'ACTIVO' : 'INACTIVO' as 'ACTIVO' | 'INACTIVO'
    }));
    setProducts(convertedProducts);
    console.log('Products converted:', convertedProducts.length);
  }, [apiProducts]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(product => {
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
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedProductData: any) => {
    if (!editingProduct || !activeCompany?.id) return;
    
    try {
      const updatePayload = {
        code: updatedProductData.codigo,
        name: updatedProductData.descripcion,
        product_type: updatedProductData.categoria === 'SERVICIO' ? 'service' as const : 'product' as const,
        description: updatedProductData.descripcion,
        unit_type: updatedProductData.unidadMedida,
        price: updatedProductData.precio,
        tax_type: updatedProductData.afectoIGV ? 'gravado' as const : 'exonerado' as const,
        category: updatedProductData.categoria,
        ...(updatedProductData.categoria !== 'SERVICIO' && {
          stock: updatedProductData.stock,
          min_stock: updatedProductData.stockMinimo
        })
      };
      
      await productService.updateProduct(activeCompany.id, parseInt(editingProduct.id), updatePayload);
      
      setShowEditModal(false);
      setEditingProduct(null);
      loadProducts();
      showSuccess('Producto actualizado', 'Los datos del producto se han actualizado correctamente');
    } catch (error: any) {
      showError('Error', [error.message || 'Error actualizando producto']);
    }
  };

  const handleDelete = (product: Product) => {
    if (!activeCompany?.id) return;
    
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de eliminar el producto "${product.descripcion}"?`,
      async () => {
        try {
          await productService.deleteProduct(activeCompany.id, parseInt(product.id));
          loadProducts();
          showSuccess('Producto eliminado', 'El producto se ha eliminado correctamente');
        } catch (error: any) {
          showError('Error', [error.message || 'Error eliminando producto']);
        }
      },
      'Eliminar',
      'Cancelar'
    );
  };

  const handleToggleStatus = async (productId: string) => {
    if (!activeCompany?.id) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    try {
      await productService.updateProduct(activeCompany.id, parseInt(productId), {});
      loadProducts();
      const newStatus = product.estado === 'ACTIVO' ? 'desactivado' : 'activado';
      showSuccess('Estado actualizado', `El producto se ha ${newStatus} correctamente`);
    } catch (error: any) {
      showError('Error', [error.message || 'Error actualizando estado']);
    }
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
                              ? 'text-orange-600 hover:text-orange-900'
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
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar producto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
        
        {/* Modal de edición */}
        {editingProduct && (
          <ProductRegistration 
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            initialData={{
              codigo: editingProduct.codigo,
              descripcion: editingProduct.descripcion,
              categoria: editingProduct.categoria,
              unidadMedida: editingProduct.unidadMedida,
              precio: editingProduct.precio,
              stock: editingProduct.stock,
              stockMinimo: editingProduct.stockMinimo,
              afectoIGV: editingProduct.afectoIGV
            }}
            onSave={handleSaveEdit}
          />
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos registrados</h3>
              <p className="text-gray-500 mb-6">Comienza creando tu primer producto o servicio para poder generar facturas y gestionar tu inventario.</p>
              <button
                onClick={() => {
                  onClose();
                  // Trigger product registration modal
                  setTimeout(() => {
                    const event = new CustomEvent('openProductRegistration');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Registrar Primer Producto</span>
              </button>
            </div>
          </div>
        )}
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default ProductList;