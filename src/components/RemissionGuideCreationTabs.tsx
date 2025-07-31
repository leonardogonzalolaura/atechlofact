'use client'
import React, { useState, useRef } from 'react';

import { useSeries } from '../contexts/SeriesContext';
import { useAlert } from './Alert';
import DocumentHeader from './shared/DocumentHeader';
import TabNavigation from './shared/TabNavigation';
import NavigationButtons from './shared/NavigationButtons';
import InvoiceCliente from './invoice/InvoiceCliente';
import RemissionGuideItems from './shared/RemissionGuideItems';
import InvoiceObservaciones from './invoice/InvoiceObservaciones';

interface RemissionGuideCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RemissionGuideItem {
  id: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  peso?: number;
}

const RemissionGuideCreation = ({ isOpen, onClose }: RemissionGuideCreationProps) => {
  const { getNextNumber } = useSeries();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [activeTab, setActiveTab] = useState('documento');
  
  const [guideData, setGuideData] = useState({
    tipoDocumento: 'GUIA_REMISION',
    serie: '',
    numero: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaTraslado: '',
    motivoTraslado: 'VENTA',
    modalidadTraslado: 'PUBLICO',
    transportista: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: '',
      numeroPlaca: '',
      numeroLicencia: ''
    },
    puntoPartida: {
      direccion: '',
      ubigeo: ''
    },
    puntoLlegada: {
      direccion: '',
      ubigeo: ''
    },
    cliente: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: '',
      direccion: ''
    },
    observaciones: ''
  });

  const [items, setItems] = useState<RemissionGuideItem[]>([
    { id: '1', descripcion: '', cantidad: 1, unidadMedida: 'UND', peso: 0 }
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
    setGuideData({
      tipoDocumento: 'GUIA_REMISION',
      serie: '',
      numero: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaTraslado: '',
      motivoTraslado: 'VENTA',
      modalidadTraslado: 'PUBLICO',
      transportista: {
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        razonSocial: '',
        numeroPlaca: '',
        numeroLicencia: ''
      },
      puntoPartida: {
        direccion: '',
        ubigeo: ''
      },
      puntoLlegada: {
        direccion: '',
        ubigeo: ''
      },
      cliente: {
        tipoDocumento: 'RUC',
        numeroDocumento: '',
        razonSocial: '',
        direccion: ''
      },
      observaciones: ''
    });
    setItems([{ id: '1', descripcion: '', cantidad: 1, unidadMedida: 'UND', peso: 0 }]);
    setActiveTab('documento');
  };

  // Generar numeración automática
  React.useEffect(() => {
    if (isOpen && !guideData.serie) {
      const numeroCompleto = getNextNumber('guiasRemision');
      const [serie, numero] = numeroCompleto.split('-');
      setGuideData(prev => ({ ...prev, serie, numero }));
    }
  }, [isOpen, getNextNumber]);

  // Reset al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Funciones reutilizadas (sin cálculos de impuestos para guía)
  const addItem = () => {
    const newItem: RemissionGuideItem = {
      id: Date.now().toString(),
      descripcion: '',
      cantidad: 1,
      unidadMedida: 'UND',
      peso: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof RemissionGuideItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
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
            descripcion: product.descripcion
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
    setGuideData(prev => ({
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
    setShowProductSelector(false);
    setSelectedItemId('');
  };

  const handleSave = () => {
    console.log('Guardando guía de remisión...', { guideData, items });
    showSuccess('Guía de remisión generada', 'La guía de remisión se ha generado correctamente');
    setTimeout(() => {
      resetForm();
    }, 1500);
  };

  const tabs = [
    { id: 'documento', label: '📄 Documento' },
    { id: 'traslado', label: '🚚 Traslado' },
    { id: 'cliente', label: '👥 Cliente' },
    { id: 'items', label: '📦 Items' },
    { id: 'observaciones', label: '📝 Observaciones' }
  ];

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <DocumentHeader title="Nueva Guía de Remisión" onClose={onClose} />
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
                      value={guideData.serie}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                      readOnly
                    />
                    <input
                      type="text"
                      value={guideData.numero}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={guideData.fechaEmision}
                    onChange={(e) => setGuideData({...guideData, fechaEmision: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Traslado</label>
                  <input
                    type="date"
                    value={guideData.fechaTraslado}
                    onChange={(e) => setGuideData({...guideData, fechaTraslado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo Traslado</label>
                  <select
                    value={guideData.motivoTraslado}
                    onChange={(e) => setGuideData({...guideData, motivoTraslado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="VENTA">Venta</option>
                    <option value="COMPRA">Compra</option>
                    <option value="TRASLADO_ENTRE_ESTABLECIMIENTOS">Traslado entre establecimientos</option>
                    <option value="CONSIGNACION">Consignación</option>
                    <option value="DEVOLUCION">Devolución</option>
                    <option value="IMPORTACION">Importación</option>
                    <option value="EXPORTACION">Exportación</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Traslado */}
          {activeTab === 'traslado' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Traslado</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad de Traslado</label>
                  <select
                    value={guideData.modalidadTraslado}
                    onChange={(e) => setGuideData({...guideData, modalidadTraslado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="PUBLICO">Transporte Público</option>
                    <option value="PRIVADO">Transporte Privado</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Datos del Transportista</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                      <select
                        value={guideData.transportista.tipoDocumento}
                        onChange={(e) => setGuideData({
                          ...guideData,
                          transportista: {...guideData.transportista, tipoDocumento: e.target.value}
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
                        value={guideData.transportista.numeroDocumento}
                        onChange={(e) => setGuideData({
                          ...guideData,
                          transportista: {...guideData.transportista, numeroDocumento: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Número de documento"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombres</label>
                      <input
                        type="text"
                        value={guideData.transportista.razonSocial}
                        onChange={(e) => setGuideData({
                          ...guideData,
                          transportista: {...guideData.transportista, razonSocial: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Razón social o nombres del transportista"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Placa</label>
                      <input
                        type="text"
                        value={guideData.transportista.numeroPlaca}
                        onChange={(e) => setGuideData({
                          ...guideData,
                          transportista: {...guideData.transportista, numeroPlaca: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Placa del vehículo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número de Licencia</label>
                      <input
                        type="text"
                        value={guideData.transportista.numeroLicencia}
                        onChange={(e) => setGuideData({
                          ...guideData,
                          transportista: {...guideData.transportista, numeroLicencia: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Licencia de conducir"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Puntos de Traslado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Punto de Partida</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={guideData.puntoPartida.direccion}
                          onChange={(e) => setGuideData({
                            ...guideData,
                            puntoPartida: {...guideData.puntoPartida, direccion: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Dirección de partida"
                        />
                        <input
                          type="text"
                          value={guideData.puntoPartida.ubigeo}
                          onChange={(e) => setGuideData({
                            ...guideData,
                            puntoPartida: {...guideData.puntoPartida, ubigeo: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Ubigeo (opcional)"
                        />
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Punto de Llegada</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={guideData.puntoLlegada.direccion}
                          onChange={(e) => setGuideData({
                            ...guideData,
                            puntoLlegada: {...guideData.puntoLlegada, direccion: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Dirección de llegada"
                        />
                        <input
                          type="text"
                          value={guideData.puntoLlegada.ubigeo}
                          onChange={(e) => setGuideData({
                            ...guideData,
                            puntoLlegada: {...guideData.puntoLlegada, ubigeo: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Ubigeo (opcional)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Cliente */}
          {activeTab === 'cliente' && (
            <InvoiceCliente 
              invoiceData={{cliente: guideData.cliente}}
              setInvoiceData={(data) => setGuideData(prev => ({...prev, cliente: data.cliente}))}
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
            <RemissionGuideItems 
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
              invoiceData={{observaciones: guideData.observaciones}}
              setInvoiceData={(data) => setGuideData(prev => ({...prev, observaciones: data.observaciones}))}
            />
          )}
        </div>

        <NavigationButtons
          activeTab={activeTab}
          tabs={['documento', 'traslado', 'cliente', 'items', 'observaciones']}
          onTabChange={setActiveTab}
          onClose={onClose}
          onSave={handleSave}
          saveButtonText="Generar Guía de Remisión"
          saveButtonIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default RemissionGuideCreation;