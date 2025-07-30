'use client'
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAlert } from './Alert';

interface RemissionGuideCreationProps {
  isOpen: boolean;
  onClose: () => void;
}

const RemissionGuideCreation = ({ isOpen, onClose }: RemissionGuideCreationProps) => {
  const { theme } = useTheme();
  const { showError, showSuccess, AlertComponent } = useAlert();
  const [guideData, setGuideData] = useState({
    serie: 'T001',
    numero: '000001',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaTraslado: '',
    motivoTraslado: '01',
    modalidadTraslado: '01',
    pesoTotal: 0,
    unidadMedida: 'KGM',
    numeroPlaca: '',
    conductor: {
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      nombres: '',
      licencia: ''
    },
    puntoPartida: {
      direccion: '',
      ubigeo: ''
    },
    puntoLlegada: {
      direccion: '',
      ubigeo: ''
    },
    destinatario: {
      tipoDocumento: 'RUC',
      numeroDocumento: '',
      razonSocial: ''
    },
    observaciones: ''
  });

  const [items, setItems] = useState([
    { id: '1', codigo: '', descripcion: '', unidad: 'NIU', cantidad: 1, peso: 0 }
  ]);

  if (!isOpen) return null;

  const motivosTraslado = [
    { codigo: '01', descripcion: 'Venta' },
    { codigo: '02', descripcion: 'Compra' },
    { codigo: '03', descripcion: 'Venta con entrega a terceros' },
    { codigo: '04', descripcion: 'Traslado entre establecimientos de la misma empresa' },
    { codigo: '05', descripcion: 'Consignación' },
    { codigo: '06', descripcion: 'Devolución' },
    { codigo: '07', descripcion: 'Recojo de bienes transformados' },
    { codigo: '08', descripcion: 'Importación' },
    { codigo: '09', descripcion: 'Exportación' },
    { codigo: '13', descripcion: 'Otros' }
  ];

  const modalidadesTraslado = [
    { codigo: '01', descripcion: 'Transporte público' },
    { codigo: '02', descripcion: 'Transporte privado' }
  ];

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      codigo: '',
      descripcion: '',
      unidad: 'NIU',
      cantidad: 1,
      peso: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const pesoTotal = items.reduce((sum, item) => sum + (item.peso * item.cantidad), 0);

  const validateForm = () => {
    const errors = [];
    
    // Validar información de la guía
    if (!guideData.serie.trim()) errors.push('Serie es requerida');
    if (!guideData.numero.trim()) errors.push('Número es requerido');
    if (!guideData.fechaEmision) errors.push('Fecha de emisión es requerida');
    if (!guideData.fechaTraslado) errors.push('Fecha de traslado es requerida');
    
    // Validar datos del transporte
    if (!guideData.numeroPlaca.trim()) errors.push('Número de placa es requerido');
    if (!guideData.conductor.numeroDocumento.trim()) errors.push('Número de documento del conductor es requerido');
    if (!guideData.conductor.nombres.trim()) errors.push('Nombres del conductor es requerido');
    if (!guideData.conductor.licencia.trim()) errors.push('Licencia del conductor es requerida');
    
    // Validar puntos de traslado
    if (!guideData.puntoPartida.direccion.trim()) errors.push('Dirección de partida es requerida');
    if (!guideData.puntoLlegada.direccion.trim()) errors.push('Dirección de llegada es requerida');
    if (!guideData.puntoPartida.ubigeo.trim()) errors.push('Ubigeo de partida es requerido');
    if (!guideData.puntoLlegada.ubigeo.trim()) errors.push('Ubigeo de llegada es requerido');
    
    // Validar destinatario
    if (!guideData.destinatario.numeroDocumento.trim()) errors.push('Número de documento del destinatario es requerido');
    if (!guideData.destinatario.razonSocial.trim()) errors.push('Razón social del destinatario es requerida');
    
    // Validar que hay al menos un item
    if (items.length === 0) errors.push('Debe agregar al menos un item');
    
    // Validar items
    const invalidItems = items.filter(item => 
      !item.descripcion.trim() || item.cantidad <= 0
    );
    if (invalidItems.length > 0) {
      errors.push('Todos los items deben tener descripción y cantidad válidos');
    }
    
    // Validar peso total mayor a 0
    if (pesoTotal <= 0) errors.push('El peso total debe ser mayor a 0');
    
    return errors;
  };

  const handleSave = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      showError('Errores en la guía de remisión', errors);
      return;
    }
    
    console.log('Guardando guía de remisión...', { guideData, items, pesoTotal });
    showSuccess('Guía de remisión generada', 'La guía de remisión se ha generado correctamente');
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Guía de Remisión</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Información de la Guía */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Guía</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serie</label>
                  <input
                    type="text"
                    value={guideData.serie}
                    onChange={(e) => setGuideData({...guideData, serie: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={guideData.numero}
                    onChange={(e) => setGuideData({...guideData, numero: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
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
              </div>
            </div>

            {/* Motivo y Modalidad */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Motivo y Modalidad de Traslado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Traslado</label>
                  <select
                    value={guideData.motivoTraslado}
                    onChange={(e) => setGuideData({...guideData, motivoTraslado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {motivosTraslado.map(motivo => (
                      <option key={motivo.codigo} value={motivo.codigo}>
                        {motivo.codigo} - {motivo.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad de Traslado</label>
                  <select
                    value={guideData.modalidadTraslado}
                    onChange={(e) => setGuideData({...guideData, modalidadTraslado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {modalidadesTraslado.map(modalidad => (
                      <option key={modalidad.codigo} value={modalidad.codigo}>
                        {modalidad.codigo} - {modalidad.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Datos del Transporte */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Transporte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Placa</label>
                  <input
                    type="text"
                    value={guideData.numeroPlaca}
                    onChange={(e) => setGuideData({...guideData, numeroPlaca: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Peso Total (kg)</label>
                  <input
                    type="number"
                    value={pesoTotal.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
                  />
                </div>
              </div>
              
              <h4 className="text-md font-semibold text-gray-900 mb-3">Datos del Conductor</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Doc.</label>
                  <select
                    value={guideData.conductor.tipoDocumento}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      conductor: {...guideData.conductor, tipoDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={guideData.conductor.numeroDocumento}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      conductor: {...guideData.conductor, numeroDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                  <input
                    type="text"
                    value={guideData.conductor.nombres}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      conductor: {...guideData.conductor, nombres: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Licencia</label>
                  <input
                    type="text"
                    value={guideData.conductor.licencia}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      conductor: {...guideData.conductor, licencia: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Puntos de Traslado */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Puntos de Traslado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Punto de Partida</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                      <textarea
                        value={guideData.puntoPartida.direccion}
                        onChange={(e) => setGuideData({
                          ...guideData, 
                          puntoPartida: {...guideData.puntoPartida, direccion: e.target.value}
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubigeo</label>
                      <input
                        type="text"
                        value={guideData.puntoPartida.ubigeo}
                        onChange={(e) => setGuideData({
                          ...guideData, 
                          puntoPartida: {...guideData.puntoPartida, ubigeo: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="150101"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Punto de Llegada</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                      <textarea
                        value={guideData.puntoLlegada.direccion}
                        onChange={(e) => setGuideData({
                          ...guideData, 
                          puntoLlegada: {...guideData.puntoLlegada, direccion: e.target.value}
                        })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubigeo</label>
                      <input
                        type="text"
                        value={guideData.puntoLlegada.ubigeo}
                        onChange={(e) => setGuideData({
                          ...guideData, 
                          puntoLlegada: {...guideData.puntoLlegada, ubigeo: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="150101"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinatario */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destinatario</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Documento</label>
                  <select
                    value={guideData.destinatario.tipoDocumento}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      destinatario: {...guideData.destinatario, tipoDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="RUC">RUC</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                  <input
                    type="text"
                    value={guideData.destinatario.numeroDocumento}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      destinatario: {...guideData.destinatario, numeroDocumento: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social / Nombres</label>
                  <input
                    type="text"
                    value={guideData.destinatario.razonSocial}
                    onChange={(e) => setGuideData({
                      ...guideData, 
                      destinatario: {...guideData.destinatario, razonSocial: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Detalle de Mercaderías */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalle de Mercaderías</h3>
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
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Código</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Descripción</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-20">Unidad</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-20">Cant.</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-20">Peso (kg)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.codigo}
                            onChange={(e) => updateItem(item.id, 'codigo', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            placeholder="Código"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            placeholder="Descripción del producto"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={item.unidad}
                            onChange={(e) => updateItem(item.id, 'unidad', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                          >
                            <option value="NIU">NIU</option>
                            <option value="KGM">KG</option>
                            <option value="MTR">M</option>
                            <option value="LTR">L</option>
                          </select>
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
                            value={item.peso}
                            onChange={(e) => updateItem(item.id, 'peso', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            min="0"
                            step="0.01"
                          />
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
            </div>

            {/* Observaciones */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={guideData.observaciones}
                onChange={(e) => setGuideData({...guideData, observaciones: e.target.value})}
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Generar Guía de Remisión
          </button>
        </div>
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default RemissionGuideCreation;