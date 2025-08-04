export const NOTIFICATION_DEFAULTS = {
  // Core settings
  enable_desktop: true,
  enable_in_app: true,
  auto_close_delay: 5000,
  max_notifications: 50,
  
  // Alert types
  enable_stock_alerts: true,
  enable_invoice_alerts: true,
  enable_payment_alerts: true,
  enable_system_alerts: true,
  
  // Internal config
  persistentTypes: ['error', 'warning'] as const
};

export const getDefaultNotificationConfig = () => ({
  enableDesktop: NOTIFICATION_DEFAULTS.enable_desktop,
  enableInApp: NOTIFICATION_DEFAULTS.enable_in_app,
  autoCloseDelay: NOTIFICATION_DEFAULTS.auto_close_delay,
  maxNotifications: NOTIFICATION_DEFAULTS.max_notifications,
  persistentTypes: NOTIFICATION_DEFAULTS.persistentTypes
});

export const getDefaultNotificationPreferences = () => ({
  enableStockAlerts: NOTIFICATION_DEFAULTS.enable_stock_alerts,
  enableInvoiceAlerts: NOTIFICATION_DEFAULTS.enable_invoice_alerts,
  enablePaymentAlerts: NOTIFICATION_DEFAULTS.enable_payment_alerts,
  enableSystemAlerts: NOTIFICATION_DEFAULTS.enable_system_alerts
});