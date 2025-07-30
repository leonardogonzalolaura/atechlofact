'use client'
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import { useAlert } from './Alert';

interface CreditNoteCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditNoteCreation = ({ isOpen, onClose }: CreditNoteCreationProps) => {
  const { theme } = useTheme();
  const { taxConfig, calculateIGV, calculateTotal } = useTax();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [creditNoteData, setCreditNoteData] = useState({
    serie: 'FC01',
    numero: '000001',
    fechaEmision: new Date().toISOString().split('T')[0],
    tipoNota: '01',
    motivoAnulacion: '',
    documentoReferencia: {
      tipoDocumento: 'FACTURA',
      serie: '',
      numero: '',
      fechaEmision: ''
    },
    cliente: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: '',
      direccion: ''
    },
    moneda: 'PEN',
    observaciones: ''
  });

  const [items, setItems] = useState([
    { id: '1', descripcion: '', cantidad: 1, precio: 0, total: 0 }
  ]);

  if (!isOpen) return null;

  const motivosAnulacion = [
    { codigo: '01', descripcion: 'Anulación de la operación' },
    { codigo: '02', descripcion: 'Anulación por error en el RUC' },
    { codigo: '03', descripcion: 'Corrección por error en la descripción' },
    { codigo: '04', descripcion: 'Descuento global' },
    { codigo: '05', descripcion: 'Descuento por ítem' },
    { codigo: '06', descripcion: 'Devolución total' },
    { codigo: '07', descripcion: 'Devolución por ítem' },
    { codigo: '08', descripcion: 'Bonificación' },
    { codigo: '09', descripcion: 'Disminución en el valor' }
  ];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  const validateForm = () => {
    const errors = [];
    
    // Validar información de la nota
    if (!creditNoteData.serie.trim()) errors.push('Serie es requerida');
    if (!creditNoteData.numero.trim()) errors.push('Número es requerido');
    if (!creditNoteData.fechaEmision) errors.push('Fecha de emisión es requerida');
    
    // Validar documento de referencia
    if (!creditNoteData.documentoReferencia.serie.trim()) errors.push('Serie del documento de referencia es requerida');
    if (!creditNoteData.documentoReferencia.numero.trim()) errors.push('Número del documento de referencia es requerido');
    if (!creditNoteData.documentoReferencia.fechaEmision) errors.push('Fecha del documento de referencia es requerida');
    
    // Validar motivo
    if (!creditNoteData.motivoAnulacion.trim()) errors.push('Motivo de anulación es requerido');
    
    // Validar cliente
    if (!creditNoteData.cliente.numeroDocumento.trim()) errors.push('Número de documento del cliente es requerido');
    if (!creditNoteData.cliente.razonSocial.trim()) errors.push('Razón social del cliente es requerida');
    
    // Validar total mayor a 0
    if (total <= 0) errors.push('El total debe ser mayor a 0');
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      showError('Errores en la nota de crédito', errors);
      return;
    }
    
    console.log('Guardando nota de crédito...', { creditNoteData, items, total });
    showSuccess('Nota de crédito generada', 'La nota de crédito se ha generado correctamente');
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Nota de Crédito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Información de la Nota */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Nota de Crédito</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <input
                    type="text"
                    value={creditNoteData.serie}
                    onChange={(e) => setCreditNoteData({...creditNoteData, serie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={creditNoteData.numero}
                    onChange={(e) => setCreditNoteData({...creditNoteData, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={creditNoteData.fechaEmision}
                    onChange={(e) => setCreditNoteData({...creditNoteData, fechaEmision: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={creditNoteData.moneda}
                    onChange={(e) => setCreditNoteData({...creditNoteData, moneda: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="PEN">Soles (PEN)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Documento de Referencia */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documento de Referencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                  <select
                    value={creditNoteData.documentoReferencia.tipoDocumento}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      documentoReferencia: {...creditNoteData.documentoReferencia, tipoDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="FACTURA">01 - Factura</option>
                    <option value="BOLETA">03 - Boleta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <input
                    type="text"
                    value={creditNoteData.documentoReferencia.serie}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      documentoReferencia: {...creditNoteData.documentoReferencia, serie: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="F001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={creditNoteData.documentoReferencia.numero}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      documentoReferencia: {...creditNoteData.documentoReferencia, numero: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="000123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={creditNoteData.documentoReferencia.fechaEmision}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      documentoReferencia: {...creditNoteData.documentoReferencia, fechaEmision: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Motivo de la Nota de Crédito</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Nota</label>
                  <select
                    value={creditNoteData.tipoNota}
                    onChange={(e) => setCreditNoteData({...creditNoteData, tipoNota: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {motivosAnulacion.map(motivo => (
                      <option key={motivo.codigo} value={motivo.codigo}>
                        {motivo.codigo} - {motivo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Motivo</label>
                  <textarea
                    value={creditNoteData.motivoAnulacion}
                    onChange={(e) => setCreditNoteData({...creditNoteData, motivoAnulacion: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Detalle el motivo de la nota de crédito..."
                  />
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                  <select
                    value={creditNoteData.cliente.tipoDocumento}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      cliente: {...creditNoteData.cliente, tipoDocumento: e.target.value}
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
                    value={creditNoteData.cliente.numeroDocumento}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      cliente: {...creditNoteData.cliente, numeroDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombres</label>
                  <input
                    type="text"
                    value={creditNoteData.cliente.razonSocial}
                    onChange={(e) => setCreditNoteData({
                      ...creditNoteData, 
                      cliente: {...creditNoteData.cliente, razonSocial: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-6">
              <div className="flex justify-end">
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
                    <span>Total a Anular:</span>
                    <span>{taxConfig.currencySymbol} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={creditNoteData.observaciones}
                onChange={(e) => setCreditNoteData({...creditNoteData, observaciones: e.target.value})}
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
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Generar Nota de Crédito
          </button>
        </div>
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default CreditNoteCreation;