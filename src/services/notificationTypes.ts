export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean;
  autoClose?: number; // milliseconds, 0 = no auto close
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface DesktopNotificationOptions {
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export interface NotificationConfig {
  enableDesktop: boolean;
  enableInApp: boolean;
  autoCloseDelay: number;
  maxNotifications: number;
  persistentTypes: NotificationType[];
}

export interface NotificationFilter {
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}