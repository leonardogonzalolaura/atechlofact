export interface NotificationSettings {
  enable_desktop: boolean;
  enable_in_app: boolean;
  auto_close_delay: number;
  max_notifications: number;
  enable_stock_alerts: boolean;
  enable_invoice_alerts: boolean;
  enable_payment_alerts: boolean;
  enable_system_alerts: boolean;
}

export interface ApiNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  read: boolean;
  company_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: ApiNotification[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
    stats: {
      total: number;
      unread: number;
    };
  };
}

export interface CreateNotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  company_id?: number;
  metadata?: Record<string, any>;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  read?: boolean;
  company_id?: number;
}

export interface MarkAllReadParams {
  company_id?: number;
  type?: string;
}