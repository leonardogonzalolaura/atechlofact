import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-${theme.card} border-t ${theme.colors.tableBorder} mt-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Resumen colapsado */}
        {!isExpanded && (
          <div className="py-2 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              © {currentYear} <span className={`font-medium ${theme.header === 'bg-white' ? 'text-gray-600' : 'text-gray-500'}`}>Atechlo</span> - AtechloFact v1.0.0
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center space-x-1"
            >
              <span>Información</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* Vista expandida */}
        {isExpanded && (
          <div className="py-4">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center space-x-1"
              >
                <span>Ocultar</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className={`text-sm font-semibold mb-2 ${theme.header === 'bg-white' ? 'text-gray-900' : 'text-gray-800'}`}>AtechloFact</h3>
                <p className="text-xs text-gray-500">
                  Sistema de facturación electrónica para optimizar la gestión de comprobantes de pago.
                </p>
              </div>
              
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${theme.header === 'bg-white' ? 'text-gray-900' : 'text-gray-800'}`}>Soporte</h4>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>📧 soporte@atechlo.com</li>
                  <li>📞 +51 957653954</li>
                  <li>🕒 Lun - Vie: 9:00 AM - 6:00 PM</li>
                </ul>
              </div>
              
              <div>
                <h4 className={`text-sm font-semibold mb-2 ${theme.header === 'bg-white' ? 'text-gray-900' : 'text-gray-800'}`}>Información Legal</h4>
                <ul className="space-y-1 text-xs text-gray-500">
                  <li>Versión 1.0.0</li>
                  <li>Términos de Servicio</li>
                  <li>Política de Privacidad</li>
                </ul>
              </div>
            </div>
            
            <div className={`border-t ${theme.colors.tableBorder} mt-3 pt-3 flex flex-col sm:flex-row justify-between items-center`}>
              <div className="text-xs text-gray-400">
                © {currentYear} <span className={`font-medium ${theme.header === 'bg-white' ? 'text-gray-600' : 'text-gray-500'}`}>Atechlo</span>. Todos los derechos reservados.
              </div>
              <div className="text-xs text-gray-400 mt-1 sm:mt-0">
                Desarrollado con ❤️ por <span className={`font-medium ${theme.header === 'bg-white' ? 'text-gray-600' : 'text-gray-500'}`}>Atechlo</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;