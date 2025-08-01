'use client'
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAlert } from '../Alert';
import CustomerRegistration from './CustomerRegistration';

interface CustomerListProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Customer {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

const CustomerList = ({ isOpen, onClose }: CustomerListProps) => {
  const { theme } = useTheme();
  const { showError, showSuccess, showConfirm, AlertComponent } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Datos de ejemplo
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      razonSocial: 'Empresa ABC S.A.C.',
      nombreComercial: 'ABC Corp',
      direccion: 'Av. Principal 123, Lima',
      telefono: '01-234-5678',
      email: 'contacto@abc.com',
      fechaRegistro: '2024-01-15',
      estado: 'ACTIVO'
    },
    {
      id: '2',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      razonSocial: 'Juan Pérez García',
      direccion: 'Jr. Los Olivos 456, Lima',
      telefono: '987-654-321',
      email: 'juan.perez@email.com',
      fechaRegistro: '2024-01-20',
      estado: 'ACTIVO'
    },
    {
      id: '3',
      tipoDocumento: 'RUC',
      numeroDocumento: '20987654321',
      razonSocial: 'Comercial XYZ E.I.R.L.',
      nombreComercial: 'XYZ Store',
      direccion: 'Av. Comercio 789, Lima',
      telefono: '01-987-6543',
      email: 'ventas@xyz.com',
      fechaRegistro: '2024-02-01',
      estado: 'ACTIVO'
    },
    {
      id: '4',
      tipoDocumento: 'DNI',
      numeroDocumento: '87654321',
      razonSocial: 'María González López',
      direccion: 'Calle Las Flores 321, Lima',
      telefono: '912-345-678',
      email: 'maria.gonzalez@email.com',
      fechaRegistro: '2024-02-10',
      estado: 'INACTIVO'
    }
  ]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'TODOS' || customer.tipoDocumento === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedCustomerData: any) => {
    if (!editingCustomer) return;
    
    const updatedCustomers = customers.map(customer => 
      customer.id === editingCustomer.id 
        ? { 
            ...customer, 
            tipoDocumento: updatedCustomerData.tipoDocumento,
            numeroDocumento: updatedCustomerData.numeroDocumento,
            razonSocial: updatedCustomerData.razonSocial,
            direccion: updatedCustomerData.direccion
          }
        : customer
    );
    
    setCustomers(updatedCustomers);
    setShowEditModal(false);
    setEditingCustomer(null);
    showSuccess('Cliente actualizado', 'Los datos del cliente se han actualizado correctamente');
  };

  const handleDelete = (customer: Customer) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de eliminar al cliente "${customer.razonSocial}"?`,
      () => {
        const updatedCustomers = customers.filter(c => c.id !== customer.id);
        setCustomers(updatedCustomers);
        showSuccess('Cliente eliminado', 'El cliente se ha eliminado correctamente');
      },
      'Eliminar',
      'Cancelar'
    );
  };

  const handleToggleStatus = (customerId: string) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, estado: customer.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' as 'ACTIVO' | 'INACTIVO' }
        : customer
    );
    
    const customer = customers.find(c => c.id === customerId);
    const newStatus = customer?.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    
    setCustomers(updatedCustomers);
    showSuccess(
      'Estado actualizado', 
      `El cliente se ha ${newStatus === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`
    );
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-backdrop-enter">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col animate-modal-enter">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Lista de Clientes</h2>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                placeholder="Buscar por documento, razón social o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 min-w-80"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="RUC">Solo RUC</option>
                <option value="DNI">Solo DNI</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto">
          <table className={`min-w-full divide-y ${theme.colors.tableDivider}`}>
            <thead className={theme.colors.tableHeader}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
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
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className={theme.colors.tableHover}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{customer.numeroDocumento}</div>
                      <div className="text-gray-500">{customer.tipoDocumento}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{customer.razonSocial}</div>
                      {customer.nombreComercial && (
                        <div className="text-gray-500">{customer.nombreComercial}</div>
                      )}
                      <div className="text-gray-500 text-xs mt-1">{customer.direccion}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">{customer.telefono}</div>
                      <div className="text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.fechaRegistro).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.estado === 'ACTIVO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar cliente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer.id)}
                        className={`transition-colors ${
                          customer.estado === 'ACTIVO'
                            ? 'text-orange-600 hover:text-orange-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={customer.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      >
                        {customer.estado === 'ACTIVO' ? (
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
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar cliente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} clientes
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
        {editingCustomer && (
          <CustomerRegistration 
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingCustomer(null);
            }}
            initialData={{
              razonSocial: editingCustomer.razonSocial,
              tipoDocumento: editingCustomer.tipoDocumento,
              numeroDocumento: editingCustomer.numeroDocumento,
              direccion: editingCustomer.direccion
            }}
            onSave={handleSaveEdit}
          />
        )}
        
        <AlertComponent />
      </div>
    </div>
  );
};

export default CustomerList;