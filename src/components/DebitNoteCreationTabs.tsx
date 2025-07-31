'use client'
import React, { useState, useRef } from 'react';

import { useTax } from '../contexts/TaxContext';
import { useSeries } from '../contexts/SeriesContext';
import { useAlert } from './Alert';
import DocumentHeader from './shared/DocumentHeader';
import TabNavigation from './shared/TabNavigation';
import NavigationButtons from './shared/NavigationButtons';
import InvoiceCliente from './invoice/InvoiceCliente';
import InvoiceItems from './invoice/InvoiceItems';
import InvoiceObservaciones from './invoice/InvoiceObservaciones';

interface DebitNoteCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DebitNoteItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  total: number;
}

const DebitNoteCreation = ({ isOpen, onClose }: DebitNoteCreationProps) => {
  const { taxConfig, calculateIGV, calculateTotal } = useTax();
  const { getNextNumber } = useSeries();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [activeTab, setActiveTab] = useState('documento');
  
  const [debitNoteData, setDebitNoteData] = useState({
    tipoDocumento: 'NOTA_DEBITO',
    serie: '',
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    documentoReferencia: {
      tipo: 'FACTURA',
      serie: '',
      numero: '',
      fecha: ''
    },
    motivoCargo: '',
    cliente: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: '',
      direccion: ''
    },
    observaciones: ''
  });

  const [items, setItems] = useState<DebitNoteItem[]>([
    { id: '1', descripcion: '', cantidad: 1, precio: 0, total: 0 }
  ]);

  // Estados para búsquedas (reutilizando lógica)
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

  // Datos mock (reutilizando)
  const availableProducts = [
    { id: '1', codigo: 'PROD001', descripcion: 'Laptop HP Pavilion 15.6"', precio: 2500.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '2', codigo: 'PROD003', descripcion: 'Laptop Lenovo ThinkPad', precio: 2800.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '3', codigo: 'PROD004', descripcion: 'Laptop Dell Inspiron', precio: 2200.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '4', codigo: 'SERV001', descripcion: 'Servicio de Consultoría IT', precio: 150.00, categoria: 'SERVICIO', afectoIGV: true },
    { id: '5', codigo: 'PROD002', descripcion: 'Mouse Inalámbrico Logitech', precio: 45.00, categoria: 'PRODUCTO', afectoIGV: true },
    { id: '6', codigo: 'SERV002', descripcion: 'Soporte Técnico Remoto', precio: 80.00, categoria: 'SERVICIO', afectoIGV: true }
  ];

  const availableCustomers = [
    { id: '1', tipoDocumento: 'RUC', numeroDocumento: '20123456789', razonSocial: 'Empresa ABC S.A.C.', direccion: 'Av. Principal 123, Lima' },
    { id: '2', tipoDocumento: 'DNI', numeroDocumento: '12345678', razonSocial: 'Juan Pérez García', direccion: 'Jr. Los Olivos 456, Lima' },
    { id: '3', tipoDocumento: 'RUC', numeroDocumento: '20987654321', razonSocial: 'Comercial XYZ E.I.R.L.', direccion: 'Av. Comercio 789, Lima' },
    { id: '4', tipoDocumento: 'DNI', numeroDocumento: '87654321', razonSocial: 'María González López', direccion: 'Calle Las Flores 321, Lima' }
  ];

  const resetForm = () => {
    setDebitNoteData({
      tipoDocumento: 'NOTA_DEBITO',
      serie: '',
      numero: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      documentoReferencia: {
        tipo: 'FACTURA',
        serie: '',
        numero: '',
        fecha: ''
      },
      motivoCargo: '',
      cliente: {
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        razonSocial: '',
        direccion: ''
      },
      observaciones: ''
    });
    setItems([{ id: '1', descripcion: '', cantidad: 1, precio: 0, total: 0 }]);
    setActiveTab('documento');
  };

  // Generar numeración automática
  React.useEffect(() => {
    if (isOpen && !debitNoteData.serie) {
      const numeroCompleto = getNextNumber('notasDebito');
      const [serie, numero] = numeroCompleto.split('-');
      setDebitNoteData(prev => ({ ...prev, serie, numero }));
    }
  }, [isOpen, getNextNumber]);

  // Reset al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  // Funciones reutilizadas
  const addItem = () => {
    const newItem: DebitNoteItem = {
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

  const updateItem = (id: string, field: keyof DebitNoteItem, value: string | number) => {
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
    
    const inputElement = inputRefs.current[itemId];
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY - 160,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 300)
      });
    }
    
    setShowSearchResults(prev => ({ ...prev, [itemId]: results.length > 0 }));
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
    
    if (inputRef) {
      const rect = inputRef.getBoundingClientRect();
      setCustomerDropdownPosition({
        top: rect.bottom + window.scrollY - 160,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 400)
      });
    }
    
    setShowCustomerResults(searchTerm.length >= 2);
  };

  const selectCustomer = (customer: any) => {
    setDebitNoteData(prev => ({
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

  const handleSave = () => {
    console.log('Guardando nota de débito...', { debitNoteData, items, subtotal, igv, total });
    showSuccess('Nota de débito generada', 'La nota de débito se ha generado correctamente');
    setTimeout(() => {
      resetForm();
    }, 1500);
  };

  const tabs = [
    { id: 'documento', label: '📄 Documento' },
    { id: 'cliente', label: '👥 Cliente' },
    { id: 'items', label: '📦 Items' },
    { id: 'observaciones', label: '📝 Observaciones' }
  ];

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <DocumentHeader title="Nueva Nota de Débito" onClose={onClose} />
        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Tab: Documento */}
          {activeTab === 'documento' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Documento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie - Número</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={debitNoteData.serie}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                      readOnly
                    />
                    <input
                      type="text"
                      value={debitNoteData.numero}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={debitNoteData.fechaEmision}
                    onChange={(e) => setDebitNoteData({...debitNoteData, fechaEmision: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Documento de Referencia</label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select
                      value={debitNoteData.documentoReferencia.tipo}
                      onChange={(e) => setDebitNoteData({
                        ...debitNoteData,
                        documentoReferencia: {...debitNoteData.documentoReferencia, tipo: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="FACTURA">Factura</option>
                      <option value="BOLETA">Boleta</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Serie"
                      value={debitNoteData.documentoReferencia.serie}
                      onChange={(e) => setDebitNoteData({
                        ...debitNoteData,
                        documentoReferencia: {...debitNoteData.documentoReferencia, serie: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Número"
                      value={debitNoteData.documentoReferencia.numero}
                      onChange={(e) => setDebitNoteData({
                        ...debitNoteData,
                        documentoReferencia: {...debitNoteData.documentoReferencia, numero: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <input
                      type="date"
                      value={debitNoteData.documentoReferencia.fecha}
                      onChange={(e) => setDebitNoteData({
                        ...debitNoteData,
                        documentoReferencia: {...debitNoteData.documentoReferencia, fecha: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del Cargo</label>
                  <textarea
                    value={debitNoteData.motivoCargo}
                    onChange={(e) => setDebitNoteData({...debitNoteData, motivoCargo: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describa el motivo del cargo adicional..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cliente */}
          {activeTab === 'cliente' && (
            <InvoiceCliente 
              invoiceData={{cliente: debitNoteData.cliente}}
              setInvoiceData={(data) => setDebitNoteData(prev => ({...prev, cliente: data.cliente}))}
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
              searchProducts={searchProducts}
              selectProductFromSearch={selectProductFromSearch}
              openProductSelector={openProductSelector}
              searchResults={searchResults}
              showSearchResults={showSearchResults}
              dropdownPosition={dropdownPosition}
              showProductSelector={showProductSelector}
              setShowProductSelector={setShowProductSelector}
              availableProducts={availableProducts}
              selectProduct={selectProduct}
              inputRefs={inputRefs}
              setShowSearchResults={setShowSearchResults}
            />
          )}

          {/* Tab: Observaciones */}
          {activeTab === 'observaciones' && (
            <InvoiceObservaciones 
              invoiceData={{observaciones: debitNoteData.observaciones}}
              setInvoiceData={(data) => setDebitNoteData(prev => ({...prev, observaciones: data.observaciones}))}
            />
          )}
        </div>

        <NavigationButtons
          activeTab={activeTab}
          tabs={['documento', 'cliente', 'items', 'observaciones']}
          onTabChange={setActiveTab}
          onClose={onClose}
          onSave={handleSave}
          saveButtonText="Generar Nota de Débito"
          saveButtonIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default DebitNoteCreation;