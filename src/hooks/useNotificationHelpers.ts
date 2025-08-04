import { notificationService } from '../services/notificationService';
import { notificationApiService } from '../services/notificationApiService';
import { NotificationAction } from '../services/notificationTypes';
import { useCompany } from '../contexts/CompanyContext';

/**
 * Hook with helper functions for common notification patterns
 */
export const useNotificationHelpers = () => {
  const { activeCompany } = useCompany();
  
  // Stock notifications
  const notifyLowStock = async (products: Array<{id: string, name: string, stock: number, minStock: number}>) => {
    const actions: NotificationAction[] = [
      {
        label: 'Ver Productos',
        action: () => {
          // Navigate to products with low stock filter
          const event = new CustomEvent('openProductList', { 
            detail: { filter: 'low-stock' } 
          });
          window.dispatchEvent(event);
        },
        style: 'primary'
      }
    ];

    // Create local notification
    const localId = notificationService.warning(
      'Stock Bajo',
      `${products.length} producto${products.length > 1 ? 's necesitan' : ' necesita'} reposición`,
      {
        actions,
        metadata: { 
          type: 'stock-alert',
          productIds: products.map(p => p.id),
          count: products.length
        },
        desktopOptions: {
          tag: 'stock-alert',
          requireInteraction: true
        }
      }
    );
    
    // Also create server-side notification for sync across devices
    try {
      await notificationApiService.createNotification({
        type: 'warning',
        priority: 'high',
        title: 'Stock Bajo',
        message: `${products.length} producto${products.length > 1 ? 's necesitan' : ' necesita'} reposición`,
        company_id: activeCompany?.id ? parseInt(activeCompany.id) : undefined,
        metadata: {
          type: 'stock-alert',
          productIds: products.map(p => p.id),
          count: products.length
        }
      });
    } catch (error) {
      console.error('Error creating server-side stock notification:', error);
    }
    
    return localId;
  };

  const notifyOutOfStock = async (products: Array<{id: string, name: string}>) => {
    const actions: NotificationAction[] = [
      {
        label: 'Ver Productos',
        action: () => {
          const event = new CustomEvent('openProductList', { 
            detail: { filter: 'out-of-stock' } 
          });
          window.dispatchEvent(event);
        },
        style: 'danger'
      }
    ];

    // Create local notification
    const localId = notificationService.error(
      'Sin Stock',
      `${products.length} producto${products.length > 1 ? 's están' : ' está'} agotado${products.length > 1 ? 's' : ''}`,
      {
        actions,
        metadata: { 
          type: 'out-of-stock',
          productIds: products.map(p => p.id),
          count: products.length
        }
      }
    );
    
    // Also create server-side notification
    try {
      await notificationApiService.createNotification({
        type: 'error',
        priority: 'critical',
        title: 'Sin Stock',
        message: `${products.length} producto${products.length > 1 ? 's están' : ' está'} agotado${products.length > 1 ? 's' : ''}`,
        company_id: activeCompany?.id ? parseInt(activeCompany.id) : undefined,
        metadata: {
          type: 'out-of-stock',
          productIds: products.map(p => p.id),
          count: products.length
        }
      });
    } catch (error) {
      console.error('Error creating server-side out-of-stock notification:', error);
    }
    
    return localId;
  };

  // Invoice notifications
  const notifyInvoiceCreated = (invoiceNumber: string) => {
    return notificationService.success(
      'Factura Creada',
      `Factura ${invoiceNumber} generada exitosamente`,
      {
        metadata: { type: 'invoice-created', invoiceNumber }
      }
    );
  };

  const notifyInvoiceDue = (invoices: Array<{number: string, dueDate: string, amount: number}>) => {
    const actions: NotificationAction[] = [
      {
        label: 'Ver Facturas',
        action: () => {
          const event = new CustomEvent('openInvoiceList', { 
            detail: { filter: 'due' } 
          });
          window.dispatchEvent(event);
        },
        style: 'primary'
      }
    ];

    return notificationService.warning(
      'Facturas por Vencer',
      `${invoices.length} factura${invoices.length > 1 ? 's vencen' : ' vence'} pronto`,
      {
        actions,
        metadata: { 
          type: 'invoice-due',
          invoiceNumbers: invoices.map(i => i.number),
          count: invoices.length
        }
      }
    );
  };

  // Payment notifications
  const notifyPaymentReceived = (amount: number, invoiceNumber: string) => {
    return notificationService.success(
      'Pago Recibido',
      `Pago de S/ ${amount.toFixed(2)} para factura ${invoiceNumber}`,
      {
        metadata: { 
          type: 'payment-received', 
          amount, 
          invoiceNumber 
        }
      }
    );
  };

  // System notifications
  const notifySystemUpdate = (version: string) => {
    const actions: NotificationAction[] = [
      {
        label: 'Ver Detalles',
        action: () => {
          const event = new CustomEvent('openUpdateDetails', { 
            detail: { version } 
          });
          window.dispatchEvent(event);
        },
        style: 'primary'
      }
    ];

    return notificationService.info(
      'Actualización Disponible',
      `Nueva versión ${version} disponible`,
      {
        actions,
        persistent: true,
        metadata: { type: 'system-update', version }
      }
    );
  };

  const notifyBackupCompleted = () => {
    return notificationService.success(
      'Backup Completado',
      'Respaldo de datos realizado exitosamente',
      {
        metadata: { type: 'backup-completed' }
      }
    );
  };

  const notifyError = (title: string, message: string, errorCode?: string) => {
    return notificationService.error(
      title,
      message,
      {
        metadata: { 
          type: 'system-error', 
          errorCode,
          timestamp: Date.now()
        }
      }
    );
  };

  // Batch operations
  const clearNotificationsByType = (type: string) => {
    const notifications = notificationService.getAll();
    notifications
      .filter(n => n.metadata?.type === type)
      .forEach(n => notificationService.remove(n.id));
  };

  const getNotificationsByType = (type: string) => {
    return notificationService.getAll()
      .filter(n => n.metadata?.type === type);
  };

  return {
    // Stock
    notifyLowStock,
    notifyOutOfStock,
    
    // Invoices
    notifyInvoiceCreated,
    notifyInvoiceDue,
    
    // Payments
    notifyPaymentReceived,
    
    // System
    notifySystemUpdate,
    notifyBackupCompleted,
    notifyError,
    
    // Utilities
    clearNotificationsByType,
    getNotificationsByType
  };
};