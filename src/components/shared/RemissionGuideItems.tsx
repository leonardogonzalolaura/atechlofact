import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

interface RemissionGuideItem {
  id: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  peso?: number;
}

interface RemissionGuideItemsProps {
  items: RemissionGuideItem[];
  setItems: (items: RemissionGuideItem[]) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof RemissionGuideItem, value: string | number) => void;
  searchProducts: (term: string, itemId: string) => void;
  selectProductFromSearch: (product: any, itemId: string) => void;
  openProductSelector: (itemId: string) => void;
  searchResults: any[];
  showSearchResults: any;
  dropdownPosition: any;
  showProductSelector: boolean;
  setShowProductSelector: (show: boolean) => void;
  availableProducts: any[];
  selectProduct: (product: any) => void;
  inputRefs: React.MutableRefObject<{[key: string]: HTMLInputElement}>;
  setShowSearchResults: (results: any) => void;
}

const RemissionGuideItems = ({ 
  items, 
  addItem, 
  removeItem, 
  updateItem,
  searchProducts,
  selectProductFromSearch,
  openProductSelector,
  searchResults,
  showSearchResults,
  dropdownPosition,
  showProductSelector,
  setShowProductSelector,
  availableProducts,
  selectProduct,
  setItems,
  inputRefs,
  setShowSearchResults
}: RemissionGuideItemsProps) => {
  
  const totalCantidad = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPeso = items.reduce((sum, item) => sum + (item.peso || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-4 border-b bg-white sticky top-0 z-10">
        <h3 className="text-lg font-semibold text-gray-900">Detalle de Mercancías</h3>
        <div className="flex items-center space-x-3">
          <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <div className="text-xs text-green-600 font-medium">TOTAL ITEMS</div>
            <div className="text-lg font-bold text-green-800">{totalCantidad}</div>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">PESO TOTAL</div>
            <div className="text-lg font-bold text-blue-800">{totalPeso.toFixed(2)} kg</div>
          </div>
          <button
            onClick={() => {
              setItems([{ id: Date.now().toString(), descripcion: '', cantidad: 1, unidadMedida: 'UND', peso: 0 }]);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            title="Limpiar todos los items"
          >
            🗑️ Limpiar
          </button>
          <button
            onClick={addItem}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            + Agregar
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-700">#</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-700">Descripción</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 w-20">Cant.</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 w-24">U.M.</th>
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-700 w-24">Peso (kg)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3 text-sm text-gray-600 font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-3">
                  <div className="relative search-container">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current[item.id] = el;
                      }}
                      type="text"
                      value={item.descripcion}
                      onChange={(e) => {
                        updateItem(item.id, 'descripcion', e.target.value);
                        setTimeout(() => {
                          searchProducts(e.target.value, item.id);
                        }, 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (searchResults.length > 0) {
                            selectProductFromSearch(searchResults[0], item.id);
                          }
                        } else if (e.key === 'Escape') {
                          setShowSearchResults({ ...showSearchResults, [item.id]: false });
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowSearchResults({ ...showSearchResults, [item.id]: false });
                        }, 150);
                      }}
                      className="w-full px-2 py-2 pr-8 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Escriba para buscar productos..."
                    />
                    <button
                      type="button"
                      onClick={() => openProductSelector(item.id)}
                      className="absolute right-1 top-1 text-blue-600 hover:text-blue-800 text-xs px-1"
                      title="Ver todos los productos"
                    >
                      📦
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="1"
                  />
                </td>
                <td className="py-3 px-3">
                  <select
                    value={item.unidadMedida}
                    onChange={(e) => updateItem(item.id, 'unidadMedida', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UND">UND</option>
                    <option value="KG">KG</option>
                    <option value="LT">LT</option>
                    <option value="MT">MT</option>
                    <option value="M2">M2</option>
                    <option value="M3">M3</option>
                    <option value="CAJ">CAJ</option>
                    <option value="PAQ">PAQ</option>
                  </select>
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={item.peso || 0}
                    onChange={(e) => updateItem(item.id, 'peso', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </td>
                <td className="py-3 px-3">
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm p-1"
                      title="Eliminar item"
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

      {/* Resumen fijo */}
      <div className="mt-4 pt-4 border-t bg-white sticky bottom-0">
        <div className="flex justify-end">
          <div className="w-80 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between text-sm text-gray-700 font-medium">
              <span>Total Items:</span>
              <span>{totalCantidad}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 font-medium">
              <span>Peso Total:</span>
              <span>{totalPeso.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900 bg-green-50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
              <span>MERCANCÍAS:</span>
              <span className="text-green-800">{items.length} productos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product selector modal */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Seleccionar Producto</h3>
              <button
                onClick={() => setShowProductSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.descripcion}</div>
                        <div className="text-sm text-gray-500">
                          {product.codigo} • {product.categoria}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product search dropdown */}
      {Object.keys(showSearchResults).some(key => showSearchResults[key]) && searchResults.length > 0 && 
        typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed bg-white border border-gray-300 rounded shadow-lg z-50 max-h-40 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            {searchResults.slice(0, 5).map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  const activeItemId = Object.keys(showSearchResults).find(key => showSearchResults[key]);
                  if (activeItemId) {
                    selectProductFromSearch(product, activeItemId);
                  }
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{product.descripcion}</div>
                  <div className="text-gray-500 text-xs">{product.codigo}</div>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default RemissionGuideItems;