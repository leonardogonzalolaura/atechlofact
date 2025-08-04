'use client'
import React, { useState, useRef } from 'react';

import { useTax } from '../contexts/TaxContext';
import { useSeries } from '../contexts/SeriesContext';
import { useCompany } from '../contexts/CompanyContext';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { useAlert } from './Alert';
import InvoiceComprobante from './invoice/InvoiceComprobante';
import InvoiceCliente from './invoice/InvoiceCliente';
import InvoiceItems from './invoice/InvoiceItems';
import InvoiceObservaciones from './invoice/InvoiceObservaciones';
import CompanyIndicator from './CompanyIndicator';
import { useProducts } from '../hooks/useProducts';

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
  const { taxConfig, calculateIGV, calculateTotal } = useTax();
  const { getNextNumber } = useSeries();
  const { companyData, hasCompanies, loading } = useCompany();
  const { showError, showSuccess, AlertComponent } = useAlert();
  
  // Si no hay empresas configuradas, mostrar mensaje y cerrar
  React.useEffect(() => {
    if (isOpen && !loading && !hasCompanies) {
      showError('Empresa requerida', ['Debe configurar al menos una empresa antes de crear documentos.']);
      onClose();
    }
  }, [isOpen, loading, hasCompanies, showError, onClose]);
  
  // No renderizar si no hay empresas
  if (!hasCompanies && !loading) {
    return null;
  }
  const [activeTab, setActiveTab] = useState('comprobante');
  
  const [invoiceData, setInvoiceData] = useState({
    tipoComprobante: 'FACTURA',
    serie: '',
    numero: '',
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
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const { searchProducts } = useProducts();

  // Clientes disponibles
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

  // Generar numeración automática al abrir
  React.useEffect(() => {
    if (isOpen && !invoiceData.serie) {
      const tipoSerie = invoiceData.tipoComprobante === 'FACTURA' ? 'facturas' : 'boletas';
      const numeroCompleto = getNextNumber(tipoSerie as any);
      const [serie, numero] = numeroCompleto.split('-');
      setInvoiceData(prev => ({ ...prev, serie, numero }));
    }
  }, [isOpen, invoiceData.tipoComprobante, getNextNumber]);

  // Resetear formulario al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Función para resetear el formulario manteniendo serie y generando siguiente número
  const resetForm = () => {
    const tipoSerie = invoiceData.tipoComprobante === 'FACTURA' ? 'facturas' : 'boletas';
    const numeroCompleto = getNextNumber(tipoSerie as any);
    const [serie, numero] = numeroCompleto.split('-');
    
    setInvoiceData({
      tipoComprobante: invoiceData.tipoComprobante,
      serie,
      numero,
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
    setItems([{ id: '1', descripcion: '', cantidad: 1, precio: 0, total: 0 }]);
    setActiveTab('comprobante');
  };

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

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

  const handleSearchProducts = async (searchTerm: string, itemId: string) => {
    if (searchTerm.length < 2) {
      setShowSearchResults(prev => ({ ...prev, [itemId]: false }));
      return;
    }
    
    try {
      const results = await searchProducts(searchTerm);
      // Convertir formato API a formato esperado por el componente
      const formattedResults = results.map(product => ({
        id: product.id.toString(),
        codigo: product.code,
        descripcion: product.name,
        precio: product.price,
        categoria: product.product_type.toUpperCase(),
        afectoIGV: product.tax_type === 'gravado'
      }));
      
      setSearchResults(formattedResults);
      
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
      
      setShowSearchResults(prev => ({ ...prev, [itemId]: formattedResults.length > 0 }));
    } catch (error) {
      console.error('Error searching products:', error);
      setShowSearchResults(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const selectProductFromSearch = (product: any, itemId: string) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            descripcion: product.descripcion,
            precio: product.precio,
            total: item.cantidad * product.precio
          };
        }
        return item;
      })
    );
    setShowSearchResults(prev => ({ ...prev, [itemId]: false }));
  };

  const searchCustomers = (searchTerm: string, inputRef?: HTMLInputElement) => {
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
    if (inputRef) {
      const rect = inputRef.getBoundingClientRect();
      setCustomerDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 400)
      });
    }
    
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
    
    // Validar que hay empresa configurada
    if (!companyData.ruc || !companyData.razonSocial) {
      errors.push('No hay empresa configurada. Configure su empresa en Configuración.');
      return errors;
    }
    
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
    
    const invoiceToSave = {
      id: Date.now().toString(),
      ...invoiceData,
      items,
      subtotal,
      igv,
      total,
      fechaCreacion: new Date().toISOString()
    };
    
    console.log('Guardando factura...', invoiceToSave);
    
    // Guardar en localStorage para facturas recientes
    const savedInvoices = JSON.parse(localStorage.getItem('recentInvoices') || '[]');
    savedInvoices.unshift(invoiceToSave);
    // Mantener solo las últimas 10 facturas
    if (savedInvoices.length > 10) {
      savedInvoices.splice(10);
    }
    localStorage.setItem('recentInvoices', JSON.stringify(savedInvoices));
    
    // Generar PDF
    try {
      generateInvoicePDF({
        tipoComprobante: invoiceData.tipoComprobante,
        serie: invoiceData.serie,
        numero: invoiceData.numero,
        fechaEmision: invoiceData.fechaEmision,
        cliente: invoiceData.cliente,
        items,
        subtotal,
        igv,
        total,
        observaciones: invoiceData.observaciones
      }, companyData);
      
      showSuccess('Factura generada', 'La factura se ha guardado y descargado correctamente');
      
      // Resetear formulario después de guardar sin timeout para evitar re-renders
      resetForm();
      
    } catch (error) {
      showError('Error al generar PDF', 'No se pudo generar el archivo PDF');
    }
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Nueva Factura</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <nav className="flex space-x-8 px-4 sm:px-6">
            {[
              { id: 'comprobante', label: '📄 Comprobante' },
              { id: 'cliente', label: '👥 Cliente' },
              { id: 'items', label: '📦 Items' },
              { id: 'observaciones', label: '📝 Observaciones' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <CompanyIndicator />
          {/* Tab: Información del Comprobante */}
          {activeTab === 'comprobante' && (
            <InvoiceComprobante 
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
            />
          )}

          {/* Tab: Información del Cliente */}
          {activeTab === 'cliente' && (
            <InvoiceCliente 
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              availableCustomers={availableCustomers}
              searchCustomers={searchCustomers}
              selectCustomer={selectCustomer}
              customerSearchResults={customerSearchResults}
              showCustomerResults={showCustomerResults}
              customerDropdownPosition={customerDropdownPosition}
              showNewCustomerModal={showNewCustomerModal}
              setShowNewCustomerModal={setShowNewCustomerModal}
              newCustomerName={newCustomerName}
              setNewCustomerName={setNewCustomerName}
              setShowCustomerResults={setShowCustomerResults}
            />
          )}

          {/* Tab: Items */}
          {activeTab === 'items' && (
            <InvoiceItems 
              items={items}
              setItems={setItems}
              addItem={addItem}
              removeItem={removeItem}
              updateItem={updateItem}
              searchProducts={handleSearchProducts}
              selectProductFromSearch={selectProductFromSearch}
              openProductSelector={openProductSelector}
              searchResults={searchResults}
              showSearchResults={showSearchResults}
              dropdownPosition={dropdownPosition}
              showProductSelector={showProductSelector}
              setShowProductSelector={setShowProductSelector}
              availableProducts={searchResults}
              selectProduct={selectProduct}
              inputRefs={inputRefs}
              setShowSearchResults={setShowSearchResults}
            />
          )}

          {/* Tab: Observaciones */}
          {activeTab === 'observaciones' && (
            <InvoiceObservaciones 
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            {activeTab !== 'comprobante' && (
              <button
                onClick={() => {
                  const tabs = ['comprobante', 'cliente', 'items', 'observaciones'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
            )}
            {activeTab !== 'observaciones' && (
              <button
                onClick={() => {
                  const tabs = ['comprobante', 'cliente', 'items', 'observaciones'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors font-medium flex items-center rounded-lg"
              >
                Siguiente
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z" />
              </svg>
              <span>Generar Factura</span>
            </button>
          </div>
        </div>

        
        <AlertComponent />
      </div>
    </div>
  );
};

export default InvoiceCreation;