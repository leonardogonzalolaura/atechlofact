import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CustomerRegistration from '../customer/CustomerRegistration';

interface InvoiceClienteProps {
  invoiceData: any;
  setInvoiceData: (data: any) => void;
  searchCustomers: (term: string, inputRef?: HTMLInputElement) => void;
  selectCustomer: (customer: any) => void;
  customerSearchResults: any[];
  showCustomerResults: boolean;
  customerDropdownPosition: any;
  showNewCustomerModal: boolean;
  setShowNewCustomerModal: (show: boolean) => void;
  newCustomerName: string;
  setNewCustomerName: (name: string) => void;
  setShowCustomerResults: (show: boolean) => void;
}

const InvoiceCliente = ({ 
  invoiceData, 
  setInvoiceData, 
  searchCustomers, 
  selectCustomer,
  customerSearchResults,
  showCustomerResults,
  customerDropdownPosition,
  showNewCustomerModal,
  setShowNewCustomerModal,
  newCustomerName,
  setNewCustomerName,
  setShowCustomerResults
}: InvoiceClienteProps) => {
  const customerInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
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
                // Calcular posición antes de buscar
                setTimeout(() => {
                  searchCustomers(value, customerInputRef.current || undefined);
                }, 0);
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

      {/* Customer search dropdown */}
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
                </div>
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => {
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
              </div>
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Customer registration modal */}
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
          setInvoiceData({
            ...invoiceData,
            cliente: {
              tipoDocumento: customerData.tipoDocumento,
              numeroDocumento: customerData.numeroDocumento,
              razonSocial: customerData.razonSocial,
              direccion: customerData.direccion
            }
          });
          setShowNewCustomerModal(false);
          setNewCustomerName('');
        }}
      />
    </div>
  );
};

export default InvoiceCliente;