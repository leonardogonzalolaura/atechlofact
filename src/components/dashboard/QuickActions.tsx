import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface QuickActionsProps {
  onCustomerClick?: () => void;
  onInvoiceClick?: () => void;
  onCreditNoteClick?: () => void;
  onDebitNoteClick?: () => void;
  onRemissionGuideClick?: () => void;
  onProductClick?: () => void;
  onCustomerListClick?: () => void;
  onProductListClick?: () => void;
}

const QuickActions = ({ onCustomerClick, onInvoiceClick, onCreditNoteClick, onDebitNoteClick, onRemissionGuideClick, onProductClick, onCustomerListClick, onProductListClick }: QuickActionsProps) => {
  const { theme } = useTheme();
  const [isDocumentMenuOpen, setIsDocumentMenuOpen] = useState(false);
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);

  return (
    <div className={`bg-${theme.card} rounded-lg shadow mb-8`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsDocumentMenuOpen(!isDocumentMenuOpen)}
              className={`${theme.colors.primary} text-white px-3 py-3 rounded-lg transition-all font-medium hover:shadow-lg hover:scale-105 group w-full`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Documentos</div>
                    <div className="text-sm opacity-80">Crear comprobantes</div>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {isDocumentMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={() => { onInvoiceClick?.(); setIsDocumentMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>📄</span>
                  <div className="text-left">
                    <div className="font-medium">Factura / Boleta</div>
                    <div className="text-xs text-gray-500">Comprobantes de venta</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onCreditNoteClick?.(); setIsDocumentMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>📝</span>
                  <div className="text-left">
                    <div className="font-medium">Nota de Crédito</div>
                    <div className="text-xs text-gray-500">Anulaciones y devoluciones</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onDebitNoteClick?.(); setIsDocumentMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>💳</span>
                  <div className="text-left">
                    <div className="font-medium">Nota de Débito</div>
                    <div className="text-xs text-gray-500">Cargos adicionales</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onRemissionGuideClick?.(); setIsDocumentMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>🚚</span>
                  <div className="text-left">
                    <div className="font-medium">Guía de Remisión</div>
                    <div className="text-xs text-gray-500">Traslado de mercaderías</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsCustomerMenuOpen(!isCustomerMenuOpen)}
              className={`${theme.colors.accent} text-white px-3 py-3 rounded-lg transition-all font-medium hover:shadow-lg hover:scale-105 group w-full`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Clientes</div>
                    <div className="text-sm opacity-80">Gestionar clientes</div>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {isCustomerMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={() => { onCustomerClick?.(); setIsCustomerMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>➕</span>
                  <div className="text-left">
                    <div className="font-medium">Nuevo Cliente</div>
                    <div className="text-xs text-gray-500">Registrar cliente</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onCustomerListClick?.(); setIsCustomerMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>📋</span>
                  <div className="text-left">
                    <div className="font-medium">Lista de Clientes</div>
                    <div className="text-xs text-gray-500">Ver y gestionar</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
              className={`${theme.colors.secondary} text-white px-3 py-3 rounded-lg transition-all font-medium hover:shadow-lg hover:scale-105 group w-full`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg group-hover:bg-opacity-30 transition-all">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Productos</div>
                    <div className="text-sm opacity-80">Gestionar productos</div>
                  </div>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {isProductMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={() => { onProductClick?.(); setIsProductMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>➕</span>
                  <div className="text-left">
                    <div className="font-medium">Nuevo Producto</div>
                    <div className="text-xs text-gray-500">Registrar producto</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onProductListClick?.(); setIsProductMenuOpen(false); }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span>📋</span>
                  <div className="text-left">
                    <div className="font-medium">Lista de Productos</div>
                    <div className="text-xs text-gray-500">Ver inventario</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;