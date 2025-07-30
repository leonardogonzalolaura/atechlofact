'use client'
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTax } from '../contexts/TaxContext';
import { useAlert } from './Alert';

interface DebitNoteCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebitNoteCreation = ({ isOpen, onClose }: DebitNoteCreationProps) => {
  const { theme } = useTheme();
  const { taxConfig, calculateIGV, calculateTotal } = useTax();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [debitNoteData, setDebitNoteData] = useState({
    serie: 'FD01',
    numero: '000001',
    fechaEmision: new Date().toISOString().split('T')[0],
    tipoNota: '01',
    motivoCargo: '',
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

  const motivosCargo = [
    { codigo: '01', descripcion: 'Intereses por mora' },
    { codigo: '02', descripcion: 'Aumento en el valor' },
    { codigo: '03', descripcion: 'Penalidades/otros conceptos' },
    { codigo: '04', descripcion: 'Ajuste de precios' },
    { codigo: '05', descripcion: 'Gastos adicionales' }
  ];

  const addItem = () => {
    const newItem = {
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

  const updateItem = (id: string, field: string, value: string | number) => {
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

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const igv = calculateIGV(subtotal);
  const total = calculateTotal(subtotal);

  const validateForm = () => {
    const errors = [];
    
    // Validar información de la nota
    if (!debitNoteData.serie.trim()) errors.push('Serie es requerida');
    if (!debitNoteData.numero.trim()) errors.push('Número es requerido');
    if (!debitNoteData.fechaEmision) errors.push('Fecha de emisión es requerida');
    
    // Validar documento de referencia
    if (!debitNoteData.documentoReferencia.serie.trim()) errors.push('Serie del documento de referencia es requerida');
    if (!debitNoteData.documentoReferencia.numero.trim()) errors.push('Número del documento de referencia es requerido');
    if (!debitNoteData.documentoReferencia.fechaEmision) errors.push('Fecha del documento de referencia es requerida');
    
    // Validar motivo
    if (!debitNoteData.motivoCargo.trim()) errors.push('Motivo del cargo es requerido');
    
    // Validar cliente
    if (!debitNoteData.cliente.numeroDocumento.trim()) errors.push('Número de documento del cliente es requerido');
    if (!debitNoteData.cliente.razonSocial.trim()) errors.push('Razón social del cliente es requerida');
    
    // Validar que hay al menos un item
    if (items.length === 0) errors.push('Debe agregar al menos un cargo');
    
    // Validar items
    const invalidItems = items.filter(item => 
      !item.descripcion.trim() || item.cantidad <= 0 || item.precio <= 0
    );
    if (invalidItems.length > 0) {
      errors.push('Todos los cargos deben tener descripción, cantidad y precio válidos');
    }
    
    // Validar total mayor a 0
    if (total <= 0) errors.push('El total debe ser mayor a 0');
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      showError('Errores en la nota de débito', errors);
      return;
    }
    
    console.log('Guardando nota de débito...', { debitNoteData, items, total });
    showSuccess('Nota de débito generada', 'La nota de débito se ha generado correctamente');
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Nota de Débito</h2>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Nota de Débito</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <input
                    type="text"
                    value={debitNoteData.serie}
                    onChange={(e) => setDebitNoteData({...debitNoteData, serie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={debitNoteData.numero}
                    onChange={(e) => setDebitNoteData({...debitNoteData, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                  <select
                    value={debitNoteData.moneda}
                    onChange={(e) => setDebitNoteData({...debitNoteData, moneda: e.target.value})}
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
                    value={debitNoteData.documentoReferencia.tipoDocumento}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      documentoReferencia: {...debitNoteData.documentoReferencia, tipoDocumento: e.target.value}
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
                    value={debitNoteData.documentoReferencia.serie}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      documentoReferencia: {...debitNoteData.documentoReferencia, serie: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="F001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={debitNoteData.documentoReferencia.numero}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      documentoReferencia: {...debitNoteData.documentoReferencia, numero: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="000123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                  <input
                    type="date"
                    value={debitNoteData.documentoReferencia.fechaEmision}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      documentoReferencia: {...debitNoteData.documentoReferencia, fechaEmision: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Motivo de la Nota de Débito</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Nota</label>
                  <select
                    value={debitNoteData.tipoNota}
                    onChange={(e) => setDebitNoteData({...debitNoteData, tipoNota: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {motivosCargo.map(motivo => (
                      <option key={motivo.codigo} value={motivo.codigo}>
                        {motivo.codigo} - {motivo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción del Motivo</label>
                  <textarea
                    value={debitNoteData.motivoCargo}
                    onChange={(e) => setDebitNoteData({...debitNoteData, motivoCargo: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Detalle el motivo del cargo adicional..."
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
                    value={debitNoteData.cliente.tipoDocumento}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      cliente: {...debitNoteData.cliente, tipoDocumento: e.target.value}
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
                    value={debitNoteData.cliente.numeroDocumento}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      cliente: {...debitNoteData.cliente, numeroDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombres</label>
                  <input
                    type="text"
                    value={debitNoteData.cliente.razonSocial}
                    onChange={(e) => setDebitNoteData({
                      ...debitNoteData, 
                      cliente: {...debitNoteData.cliente, razonSocial: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Detalle de Cargos */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalle de Cargos</h3>
                <button
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  + Agregar Cargo
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
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            placeholder="Descripción del cargo"
                          />
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
                    <span>Total Cargo:</span>
                    <span>{taxConfig.currencySymbol} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={debitNoteData.observaciones}
                onChange={(e) => setDebitNoteData({...debitNoteData, observaciones: e.target.value})}
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
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Generar Nota de Débito
          </button>
        </div>
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default DebitNoteCreation;