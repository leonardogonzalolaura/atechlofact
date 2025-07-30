'use client'
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import { useAlert } from './Alert';

interface ProductRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    codigo?: string;
    descripcion?: string;
    categoria?: string;
    unidadMedida?: string;
    precio?: number;
    stock?: number;
    stockMinimo?: number;
    afectoIGV?: boolean;
  };
  onSave?: (productData: any) => void;
}

const ProductRegistration = ({ isOpen, onClose, initialData, onSave }: ProductRegistrationProps) => {
  const { theme } = useTheme();
  const { taxConfig } = useTax();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [productData, setProductData] = useState({
    codigo: initialData?.codigo || '',
    descripcion: initialData?.descripcion || '',
    categoria: initialData?.categoria || 'PRODUCTO',
    unidadMedida: initialData?.unidadMedida || 'NIU',
    precio: initialData?.precio || 0,
    stock: initialData?.stock || 0,
    stockMinimo: initialData?.stockMinimo || 0,
    afectoIGV: initialData?.afectoIGV ?? true,
    codigoSUNAT: '',
    observaciones: ''
  });

  // Actualizar datos cuando cambie initialData
  React.useEffect(() => {
    if (initialData) {
      setProductData(prev => ({
        ...prev,
        codigo: initialData.codigo || '',
        descripcion: initialData.descripcion || '',
        categoria: initialData.categoria || 'PRODUCTO',
        unidadMedida: initialData.unidadMedida || 'NIU',
        precio: initialData.precio || 0,
        stock: initialData.stock || 0,
        stockMinimo: initialData.stockMinimo || 0,
        afectoIGV: initialData.afectoIGV ?? true
      }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const categorias = [
    { value: 'PRODUCTO', label: 'Producto' },
    { value: 'SERVICIO', label: 'Servicio' },
    { value: 'BIEN', label: 'Bien' }
  ];

  const unidadesMedida = [
    { value: 'NIU', label: 'NIU - Unidad' },
    { value: 'KGM', label: 'KGM - Kilogramo' },
    { value: 'MTR', label: 'MTR - Metro' },
    { value: 'LTR', label: 'LTR - Litro' },
    { value: 'M2', label: 'M2 - Metro cuadrado' },
    { value: 'M3', label: 'M3 - Metro cúbico' },
    { value: 'CJA', label: 'CJA - Caja' },
    { value: 'PQT', label: 'PQT - Paquete' }
  ];

  const validateProduct = () => {
    const errors = [];
    
    // Validar campos obligatorios
    if (!productData.codigo.trim()) errors.push('Código del producto es requerido');
    if (!productData.descripcion.trim()) errors.push('Descripción es requerida');
    if (productData.precio <= 0) errors.push('Precio debe ser mayor a 0');
    
    // Validar stock para productos (no servicios)
    if (productData.categoria !== 'SERVICIO') {
      if (productData.stock < 0) errors.push('Stock no puede ser negativo');
      if (productData.stockMinimo < 0) errors.push('Stock mínimo no puede ser negativo');
    }
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateProduct();
    
    if (errors.length > 0) {
      showError('Por favor corrija los siguientes errores:',errors);
      return;
    }
    
    console.log('Guardando producto...', productData);
    // Aquí iría la lógica para guardar el producto
    
    // Si hay callback onSave, ejecutarlo con los datos del producto
    if (onSave) {
      onSave(productData);
    } else {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setProductData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Si cambia a SERVICIO, resetear campos de stock y unidad
      if (field === 'categoria' && value === 'SERVICIO') {
        newData.stock = 0;
        newData.stockMinimo = 0;
        newData.unidadMedida = 'NIU';
      }
      
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Registro de Producto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código del Producto</label>
                  <input
                    type="text"
                    value={productData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Código único del producto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código SUNAT</label>
                  <input
                    type="text"
                    value={productData.codigoSUNAT}
                    onChange={(e) => handleInputChange('codigoSUNAT', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Código SUNAT (opcional)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={productData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Descripción detallada del producto"
                  />
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={productData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida</label>
                  {productData.categoria === 'SERVICIO' ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                      No aplica para servicios
                    </div>
                  ) : (
                    <select
                      value={productData.unidadMedida}
                      onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {unidadesMedida.map(unidad => (
                        <option key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Precios y Stock */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios y Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                  <input
                    type="number"
                    value={productData.precio}
                    onChange={(e) => handleInputChange('precio', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                {productData.categoria === 'SERVICIO' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                        No aplica para servicios
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                        No aplica para servicios
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
                      <input
                        type="number"
                        value={productData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                      <input
                        type="number"
                        value={productData.stockMinimo}
                        onChange={(e) => handleInputChange('stockMinimo', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Configuración Tributaria */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración Tributaria</h3>
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productData.afectoIGV}
                    onChange={(e) => handleInputChange('afectoIGV', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Afecto a {taxConfig.igvLabel} ({(taxConfig.igvRate * 100).toFixed(0)}%)</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Marque esta opción si el producto está gravado con {taxConfig.igvLabel}
              </p>
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={productData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Observaciones adicionales (opcional)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Guardar Producto
          </button>
        </div>
        <AlertComponent />
      </div>
    </div>
  );
};

export default ProductRegistration;