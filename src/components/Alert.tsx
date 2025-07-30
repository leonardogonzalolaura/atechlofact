import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string | string[];
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Alert = ({ type, title, message, isOpen, onClose, autoClose = false, duration = 5000, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' }: AlertProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-400',
          title: 'text-green-800',
          text: 'text-green-700',
          button: 'text-green-500 hover:text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'text-red-500 hover:text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'text-yellow-500 hover:text-yellow-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'text-blue-500 hover:text-blue-600'
        };
      case 'confirm':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-800',
          text: 'text-gray-700',
          button: 'text-gray-500 hover:text-gray-600'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirm':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const styles = getAlertStyles();
  const messages = Array.isArray(message) ? message : [message];

  return typeof document !== 'undefined' ? createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'} pointer-events-none`}>
      <div className="fixed inset-0" onClick={handleClose}></div>
      
      <div className={`relative max-w-md w-full ${styles.bg} ${styles.border} border rounded-lg shadow-xl transform transition-all duration-300 pointer-events-auto ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="p-6">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${styles.icon}`}>
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${styles.title}`}>
                {title}
              </h3>
              <div className={`mt-2 text-sm ${styles.text}`}>
                {messages.length === 1 ? (
                  <p>{messages[0]}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {messages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {type !== 'confirm' && (
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleClose}
                  className={`inline-flex ${styles.button} transition-colors`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Botones de confirmación */}
        {type === 'confirm' && (
          <div className="px-6 pb-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm?.();
                  handleClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
              >
                {confirmText}
              </button>
            </div>
          </div>
        )}
        
        {/* Barra de progreso para auto-close */}
        {autoClose && type !== 'confirm' && (
          <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full transition-all ease-linear ${
                type === 'success' ? 'bg-green-400' : 
                type === 'error' ? 'bg-red-400' : 
                type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              style={{
                width: '100%',
                animation: `shrink ${duration}ms linear`
              }}
            ></div>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;
};

// Hook para usar alertas fácilmente
export const useAlert = () => {
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string | string[];
    isOpen: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    isOpen: false
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string | string[]) => {
    setAlert({
      type,
      title,
      message,
      isOpen: true
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (title: string, message: string | string[]) => showAlert('success', title, message);
  const showError = (title: string, message: string | string[]) => showAlert('error', title, message);
  const showWarning = (title: string, message: string | string[]) => showAlert('warning', title, message);
  const showInfo = (title: string, message: string | string[]) => showAlert('info', title, message);
  
  const showConfirm = (title: string, message: string | string[], onConfirm: () => void, confirmText?: string, cancelText?: string) => {
    setAlert({
      type: 'confirm',
      title,
      message,
      isOpen: true
    });
    setConfirmCallback(() => onConfirm);
    setConfirmTexts({ confirm: confirmText || 'Confirmar', cancel: cancelText || 'Cancelar' });
  };

  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);
  const [confirmTexts, setConfirmTexts] = useState({ confirm: 'Confirmar', cancel: 'Cancelar' });

  return {
    alert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert,
    AlertComponent: () => (
      <Alert
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        autoClose={alert.type === 'success'}
        onConfirm={confirmCallback || undefined}
        confirmText={confirmTexts.confirm}
        cancelText={confirmTexts.cancel}
      />
    )
  };
};

export default Alert;