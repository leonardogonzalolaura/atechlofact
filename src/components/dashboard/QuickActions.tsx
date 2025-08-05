import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSeries } from '../../contexts/SeriesContext';
import { useCompany } from '../../contexts/CompanyContext';
import { sequenceService } from '../../services/sequenceService';

interface QuickActionsProps {
  onCustomerClick?: () => void;
  onInvoiceClick?: () => void;
  onCreditNoteClick?: () => void;
  onDebitNoteClick?: () => void;
  onRemissionGuideClick?: () => void;
  onProductClick?: () => void;
  onCustomerListClick?: () => void;
  onProductListClick?: () => void;
  onInvoiceListClick?: () => void;
  onOpenSettings?: () => void;
}

const QuickActions = ({ onCustomerClick, onInvoiceClick, onCreditNoteClick, onDebitNoteClick, onRemissionGuideClick, onProductClick, onCustomerListClick, onProductListClick, onInvoiceListClick, onOpenSettings }: QuickActionsProps) => {
  const { theme } = useTheme();
  const { checkSequences } = useSeries();
  const { activeCompany, hasCompanies } = useCompany();
  const [isDocumentMenuOpen, setIsDocumentMenuOpen] = useState(false);
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [availableSequences, setAvailableSequences] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);

  // Check available sequences when company changes
  useEffect(() => {
    const checkAvailableSequences = async () => {
      if (!activeCompany?.id || !hasCompanies) {
        setAvailableSequences({});
        return;
      }
      
      try {
        setLoading(true);
        const hasSequences = await checkSequences(activeCompany.id);
        
        if (!hasSequences) {
          setAvailableSequences({
            invoice: false,
            receipt: false,
            credit_note: false,
            debit_note: false,
            quotation: false
          });
          return;
        }
        
        // Get all sequences in one call instead of multiple API calls
        try {
          const response = await sequenceService.getSequences(activeCompany.id);
          const sequences = response.data || [];
          
          // Check which document types have sequences configured
          const availability = {
            invoice: sequences.some(seq => seq.document_type === 'invoice' && seq.is_active),
            receipt: sequences.some(seq => seq.document_type === 'receipt' && seq.is_active),
            credit_note: sequences.some(seq => seq.document_type === 'credit_note' && seq.is_active),
            debit_note: sequences.some(seq => seq.document_type === 'debit_note' && seq.is_active),
            quotation: sequences.some(seq => seq.document_type === 'quotation' && seq.is_active)
          };
          
          setAvailableSequences(availability);
        } catch (error) {
          console.error('Error getting sequences:', error);
          setAvailableSequences({
            invoice: false,
            receipt: false,
            credit_note: false,
            debit_note: false,
            quotation: false
          });
        }
      } catch (error) {
        console.error('Error checking sequences:', error);
        setAvailableSequences({});
      } finally {
        setLoading(false);
      }
    };
    
    checkAvailableSequences();
    
    // Listen for sequence changes
    const handleSequenceChange = () => {
      checkAvailableSequences();
    };
    
    window.addEventListener('sequenceCreated', handleSequenceChange);
    window.addEventListener('sequenceUpdated', handleSequenceChange);
    window.addEventListener('sequenceDeleted', handleSequenceChange);
    
    return () => {
      window.removeEventListener('sequenceCreated', handleSequenceChange);
      window.removeEventListener('sequenceUpdated', handleSequenceChange);
      window.removeEventListener('sequenceDeleted', handleSequenceChange);
    };
  }, [activeCompany?.id, hasCompanies]);
  
  const hasAnySequences = Object.values(availableSequences).some(Boolean);

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
                {!hasAnySequences ? (
                  <div className="px-4 py-3 text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      🔢 No hay correlativos configurados
                    </div>
                    <button 
                      onClick={() => { onOpenSettings?.(); setIsDocumentMenuOpen(false); }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Haz clic aquí para configurar correlativos
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => { 
                        if (availableSequences.invoice) {
                          onInvoiceClick?.(); 
                          setIsDocumentMenuOpen(false);
                        }
                      }}
                      disabled={!availableSequences.invoice}
                      className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                        availableSequences.invoice 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <span>📄</span>
                      <div className="text-left">
                        <div className="font-medium">Factura / Boleta</div>
                        <div className="text-xs text-gray-500">
                          {availableSequences.invoice ? 'Comprobantes de venta' : 'Sin correlativo configurado'}
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => { 
                        if (availableSequences.credit_note) {
                          onCreditNoteClick?.(); 
                          setIsDocumentMenuOpen(false);
                        }
                      }}
                      disabled={!availableSequences.credit_note}
                      className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                        availableSequences.credit_note 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <span>📝</span>
                      <div className="text-left">
                        <div className="font-medium">Nota de Crédito</div>
                        <div className="text-xs text-gray-500">
                          {availableSequences.credit_note ? 'Anulaciones y devoluciones' : 'Sin correlativo configurado'}
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => { 
                        if (availableSequences.debit_note) {
                          onDebitNoteClick?.(); 
                          setIsDocumentMenuOpen(false);
                        }
                      }}
                      disabled={!availableSequences.debit_note}
                      className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                        availableSequences.debit_note 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <span>💳</span>
                      <div className="text-left">
                        <div className="font-medium">Nota de Débito</div>
                        <div className="text-xs text-gray-500">
                          {availableSequences.debit_note ? 'Cargos adicionales' : 'Sin correlativo configurado'}
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => { 
                        if (availableSequences.quotation) {
                          onRemissionGuideClick?.(); 
                          setIsDocumentMenuOpen(false);
                        }
                      }}
                      disabled={!availableSequences.quotation}
                      className={`flex items-center space-x-3 w-full px-4 py-2 text-sm transition-colors ${
                        availableSequences.quotation 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <span>🚚</span>
                      <div className="text-left">
                        <div className="font-medium">Guía de Remisión</div>
                        <div className="text-xs text-gray-500">
                          {availableSequences.quotation ? 'Traslado de mercaderías' : 'Sin correlativo configurado'}
                        </div>
                      </div>
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={() => { onInvoiceListClick?.(); setIsDocumentMenuOpen(false); }}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <span>📋</span>
                      <div className="text-left">
                        <div className="font-medium">Lista de Facturas</div>
                        <div className="text-xs text-gray-500">Ver y gestionar facturas</div>
                      </div>
                    </button>
                    {!hasAnySequences && (
                      <>
                        <hr className="my-1" />
                        <button 
                          onClick={() => { onOpenSettings?.(); setIsDocumentMenuOpen(false); }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <span>⚙️</span>
                          <div className="text-left">
                            <div className="font-medium">Configurar Correlativos</div>
                            <div className="text-xs text-blue-500">Haz clic aquí para configurar</div>
                          </div>
                        </button>
                      </>
                    )}
                  </>
                )}
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