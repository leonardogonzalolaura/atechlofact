'use client'
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import CustomerRegistration from './CustomerRegistration';
import { useAlert } from './Alert';

interface InvoiceCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  total: number;
}

const InvoiceCreation = ({ isOpen, onClose }: InvoiceCreationProps) => {
  const { theme } = useTheme();
  const { taxConfig, calculateIGV, calculateTotal } = useTax();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [invoiceData, setInvoiceData] = useState({
    tipoComprobante: 'FACTURA',
    serie: 'F001',
    numero: '000001',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    cliente: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: '',
      direccion: ''
    },
    moneda: 'PEN',
    observaciones: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', descripcion: '', cantidad: 1, precio: 0, total: 0 }
  ]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<{[key: string]: boolean}>({});
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const inputRefs = useRef<{[key: string]: HTMLInputElement}>({});
  const [customerSearchResults, setCustomerSearchResults] = useState<any[]>([]);
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [customerDropdownPosition, setCustomerDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const customerInputRef = useRef<HTMLInputElement>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

  // Productos disponibles (en producción vendría de la API)
  const availableProducts = [
    { id: '1', codigo: 'PROD001', descripcion: 'Laptop HP Pavilion 15.6"', precio: 2500.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '2', codigo: 'PROD003', descripcion: 'Laptop Lenovo ThinkPad', precio: 2800.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '3', codigo: 'PROD004', descripcion: 'Laptop Dell Inspiron', precio: 2200.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '4', codigo: 'SERV001', descripcion: 'Servicio de Consultoría IT', precio: 150.00, categoria: 'SERVICIO', afectoIGV: true },
    { id: '5', codigo: 'PROD002', descripcion: 'Mouse Inalámbrico Logitech', precio: 45.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '6', codigo: 'SERV002', descripcion: 'Soporte Técnico Remoto', precio: 80.00, categoria: 'SERVICIO', afectoIGV: true }
  ];

  // Clientes disponibles (en producción vendría de la API)
  const availableCustomers = [
    { id: '1', tipoDocumento: 'RUC', numeroDocumento: '20123456789', razonSocial: 'Empresa ABC S.A.C.', direccion: 'Av. Principal 123, Lima' },
    { id: '2', tipoDocumento: 'DNI', numeroDocumento: '12345678', razonSocial: 'Juan Pérez García', direccion: 'Jr. Los Olivos 456, Lima' },
    { id: '3', tipoDocumento: 'RUC', numeroDocumento: '20987654321', razonSocial: 'Comercial XYZ E.I.R.L.', direccion: 'Av. Comercio 789, Lima' },
    { id: '4', tipoDocumento: 'DNI', numeroDocumento: '87654321', razonSocial: 'María González López', direccion: 'Calle Las Flores 321, Lima' }
  ];

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchResults({});
        setShowCustomerResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      descripcion: '',
      cantidad: 1,
      precio: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'cantidad' || field === 'precio') {
          updatedItem.total = updatedItem.cantidad * updatedItem.precio;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const searchProducts = (searchTerm: string, itemId: string) => {
    if (searchTerm.length < 2) {
      setShowSearchResults(prev => ({ ...prev, [itemId]: false }));
      return;
    }
    
    const results = availableProducts.filter(product => 
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(results);
    
    // Calcular posición del dropdown
    const inputElement = inputRefs.current[itemId];
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 300)
      });
    }
    
    setShowSearchResults(prev => ({ ...prev, [itemId]: results.length > 0 }));
  };

  const selectProductFromSearch = (product: any, itemId: string) => {
    // Actualizar el item con los datos del producto seleccionado
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = {
            ...item,
            descripcion: product.descripcion,
            precio: product.precio,
            total: item.cantidad * product.precio
          };
          return updatedItem;
        }
        return item;
      })
    );
    
    // Cerrar el dropdown
    setShowSearchResults(prev => ({ ...prev, [itemId]: false }));
  };

  const searchCustomers = (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setShowCustomerResults(false);
      return;
    }
    
    const results = availableCustomers.filter(customer => 
      customer.numeroDocumento.includes(searchTerm) ||
      customer.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setCustomerSearchResults(results);
    
    // Calcular posición del dropdown
    if (customerInputRef.current) {
      const rect = customerInputRef.current.getBoundingClientRect();
      setCustomerDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 400)
      });
    }
    
    // Mostrar dropdown siempre que haya texto (para mostrar opción de registro si no hay resultados)
    setShowCustomerResults(searchTerm.length >= 2);
  };

  const selectCustomer = (customer: any) => {
    setInvoiceData(prev => ({
      ...prev,
      cliente: {
        tipoDocumento: customer.tipoDocumento,
        numeroDocumento: customer.numeroDocumento,
        razonSocial: customer.razonSocial,
        direccion: customer.direccion
      }
    }));
    setShowCustomerResults(false);
  };



  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  const openProductSelector = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowProductSelector(true);
  };

  const selectProduct = (product: any) => {
    updateItem(selectedItemId, 'descripcion', product.descripcion);
    updateItem(selectedItemId, 'precio', product.precio);
    setShowProductSelector(false);
    setSelectedItemId('');
  };

  const validateForm = () => {
    const errors = [];
    
    // Validar información del comprobante
    if (!invoiceData.serie.trim()) errors.push('Serie es requerida');
    if (!invoiceData.numero.trim()) errors.push('Número es requerido');
    if (!invoiceData.fechaEmision) errors.push('Fecha de emisión es requerida');
    
    // Validar cliente
    if (!invoiceData.cliente.numeroDocumento.trim()) errors.push('Número de documento del cliente es requerido');
    if (!invoiceData.cliente.razonSocial.trim()) errors.push('Razón social del cliente es requerida');
    if (!invoiceData.cliente.direccion.trim()) errors.push('Dirección del cliente es requerida');
    
    // Validar que hay al menos un item
    if (items.length === 0) errors.push('Debe agregar al menos un item');
    
    // Validar items
    const invalidItems = items.filter(item => 
      !item.descripcion.trim() || item.cantidad <= 0 || item.precio <= 0
    );
    if (invalidItems.length > 0) {
      errors.push('Todos los items deben tener descripción, cantidad y precio válidos');
    }
    
    // Validar total mayor a 0
    if (total <= 0) errors.push('El total debe ser mayor a 0');
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      showError('Errores en la factura', errors);
      return;
    }
    
    console.log('Guardando factura...', { invoiceData, items, subtotal, igv, total });
    showSuccess('Factura generada', 'La factura se ha generado correctamente');
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Nueva Factura</h2>
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
            {/* Información del Comprobante */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Comprobante</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={invoiceData.tipoComprobante}
                    onChange={(e) => setInvoiceData({...invoiceData, tipoComprobante: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="FACTURA">01 - Factura</option>
                    <option value="BOLETA">03 - Boleta de Venta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <input
                    type="text"
                    value={invoiceData.serie}
                    onChange={(e) => setInvoiceData({...invoiceData, serie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={invoiceData.numero}
                    onChange={(e) => setInvoiceData({...invoiceData, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={invoiceData.moneda}
                    onChange={(e) => setInvoiceData({...invoiceData, moneda: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={invoiceData.fechaEmision}
                    onChange={(e) => setInvoiceData({...invoiceData, fechaEmision: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={invoiceData.fechaVencimiento}
                    onChange={(e) => setInvoiceData({...invoiceData, fechaVencimiento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                  <select
                    value={invoiceData.cliente.tipoDocumento}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData, 
                      cliente: {...invoiceData.cliente, tipoDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número Documento</label>
                  <input
                    type="text"
                    value={invoiceData.cliente.numeroDocumento}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData, 
                      cliente: {...invoiceData.cliente, numeroDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Número de documento"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombres</label>
                  <div className="relative search-container">
                    <input
                      ref={customerInputRef}
                      type="text"
                      value={invoiceData.cliente.razonSocial}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInvoiceData({
                          ...invoiceData, 
                          cliente: {...invoiceData.cliente, razonSocial: value}
                        });

                        searchCustomers(value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customerSearchResults.length > 0) {
                            selectCustomer(customerSearchResults[0]);
                          }
                        } else if (e.key === 'Escape') {
                          setShowCustomerResults(false);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowCustomerResults(false);
                        }, 150);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Escriba para buscar clientes..."
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={invoiceData.cliente.direccion}
                    onChange={(e) => setInvoiceData({
                      ...invoiceData, 
                      cliente: {...invoiceData.cliente, direccion: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Dirección del cliente"
                  />
                </div>
              </div>
            </div>

            {/* Detalle de Items */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalle de Items</h3>
                <button
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  + Agregar Item
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Descripción</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-20">Cant.</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-24">Precio</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-24">Total</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">
                          <div className="relative search-container">
                            <input
                              ref={(el) => {
                                if (el) inputRefs.current[item.id] = el;
                              }}
                              type="text"
                              value={item.descripcion}
                              onChange={(e) => {
                                updateItem(item.id, 'descripcion', e.target.value);
                                searchProducts(e.target.value, item.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (searchResults.length > 0) {
                                    selectProductFromSearch(searchResults[0], item.id);
                                  }
                                } else if (e.key === 'Escape') {
                                  setShowSearchResults(prev => ({ ...prev, [item.id]: false }));
                                }
                              }}
                              onBlur={() => {
                                // Delay para permitir click en sugerencias
                                setTimeout(() => {
                                  setShowSearchResults(prev => ({ ...prev, [item.id]: false }));
                                }, 150);
                              }}
                              className="w-full px-2 py-1 pr-8 border border-gray-300 rounded text-sm text-gray-900"
                              placeholder="Escriba para buscar productos..."
                            />
                            <button
                              type="button"
                              onClick={() => openProductSelector(item.id)}
                              className="absolute right-1 top-1 text-blue-600 hover:text-blue-800 text-xs px-1"
                              title="Ver todos los productos"
                            >
                              📦
                            </button>
                            

                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            value={item.precio}
                            onChange={(e) => updateItem(item.id, 'precio', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-2 px-2 text-sm font-medium text-gray-900">
                          {item.total.toFixed(2)}
                        </td>
                        <td className="py-2 px-2">
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totales */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Subtotal:</span>
                    <span>{taxConfig.currencySymbol} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>{taxConfig.igvLabel} ({(taxConfig.igvRate * 100).toFixed(0)}%):</span>
                    <span>{taxConfig.currencySymbol} {igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
                    <span>Total:</span>
                    <span>{taxConfig.currencySymbol} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={invoiceData.observaciones}
                onChange={(e) => setInvoiceData({...invoiceData, observaciones: e.target.value})}
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
            Generar Factura
          </button>
        </div>

        {/* Selector de Productos */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar Producto</h3>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => selectProduct(product)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.descripcion}</div>
                          <div className="text-sm text-gray-500">
                            {product.codigo} • {product.categoria}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">S/ {product.precio.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{product.afectoIGV ? 'Con IGV' : 'Sin IGV'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dropdown de búsqueda de productos usando Portal */}
        {Object.keys(showSearchResults).some(key => showSearchResults[key]) && searchResults.length > 0 && 
          typeof document !== 'undefined' && createPortal(
            <div 
              className="fixed bg-white border border-gray-300 rounded shadow-lg z-50 max-h-40 overflow-y-auto"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`
              }}
            >
              {searchResults.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    const activeItemId = Object.keys(showSearchResults).find(key => showSearchResults[key]);
                    if (activeItemId) {
                      selectProductFromSearch(product, activeItemId);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{product.descripcion}</div>
                    <div className="text-gray-500 text-xs">{product.codigo} • S/ {product.precio.toFixed(2)}</div>
                  </div>
                </button>
              ))}
            </div>,
            document.body
          )
        }

        {/* Dropdown de búsqueda de clientes usando Portal */}
        {showCustomerResults && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed bg-white border border-gray-300 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
            style={{
              top: `${customerDropdownPosition.top}px`,
              left: `${customerDropdownPosition.left}px`,
              width: `${customerDropdownPosition.width}px`
            }}
          >
            {customerSearchResults.length > 0 ? (
              customerSearchResults.slice(0, 5).map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => selectCustomer(customer)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{customer.razonSocial}</div>
                    <div className="text-gray-500 text-xs">{customer.tipoDocumento}: {customer.numeroDocumento}</div>
                    <div className="text-gray-500 text-xs">{customer.direccion}</div>
                  </div>
                </button>
              ))
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowCustomerResults(false);
                  setNewCustomerName(invoiceData.cliente.razonSocial);
                  setShowNewCustomerModal(true);
                }}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-600"
              >
                <div className="text-sm">
                  <div className="font-medium flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Registrar nuevo cliente
                  </div>
                  <div className="text-xs text-gray-500 ml-6">
                    "{invoiceData.cliente.razonSocial}" no encontrado
                  </div>
                </div>
              </button>
            )}
          </div>,
          document.body
        )}

        {/* Modal de registro de cliente */}
        <CustomerRegistration 
          isOpen={showNewCustomerModal}
          onClose={() => {
            setShowNewCustomerModal(false);
            setNewCustomerName('');
          }}
          initialData={{
            razonSocial: newCustomerName
          }}
          onSave={(customerData) => {
            // Auto-completar datos del cliente en la factura
            setInvoiceData(prev => ({
              ...prev,
              cliente: {
                tipoDocumento: customerData.tipoDocumento,
                numeroDocumento: customerData.numeroDocumento,
                razonSocial: customerData.razonSocial,
                direccion: customerData.direccion
              }
            }));
            setShowNewCustomerModal(false);
            setNewCustomerName('');
          }}
        />
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default InvoiceCreation;