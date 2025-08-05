import { withApiErrorHandling } from '../utils/apiWrapper';
import { 
  BaseNotification, 
  NotificationType, 
  NotificationPriority, 
  NotificationAction,
  DesktopNotificationOptions,
  NotificationConfig 
} from './notificationTypes';
import { notificationApiService } from './notificationApiService';
import { ApiNotification } from './notificationApiTypes';
import { getDefaultNotificationConfig } from '../config/notificationDefaults';

class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig;
  private listeners: Set<(notifications: BaseNotification[]) => void> = new Set();
  private lastSyncTime: number = 0;
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private configSynced: boolean = false;

  private constructor() {
    this.config = getDefaultNotificationConfig();
    this.requestDesktopPermission();
    this.loadConfigFromCache();
    
    // Load config asynchronously without blocking
    this.loadConfigFromApi().catch(error => {
      console.warn('Failed to load notification config from API, using defaults:', error);
    });
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Configuration
  async updateConfig(newConfig: Partial<NotificationConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    // Sync with backend
    try {
      await notificationApiService.updateSettings({
        enable_desktop: this.config.enableDesktop,
        enable_in_app: this.config.enableInApp,
        auto_close_delay: this.config.autoCloseDelay,
        max_notifications: this.config.maxNotifications
      });
    } catch (error) {
      console.error('Error syncing config with backend:', error);
    }
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Desktop Notifications
  private async requestDesktopPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') return true;
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }

  private async showDesktopNotification(
    notification: BaseNotification, 
    options?: DesktopNotificationOptions
  ): Promise<void> {
    if (!this.config.enableDesktop) return;
    
    const hasPermission = await this.requestDesktopPermission();
    if (!hasPermission) return;

    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: options?.icon || '/favicon.ico',
      badge: options?.badge,
      tag: options?.tag || notification.id,
      requireInteraction: options?.requireInteraction || notification.priority === 'critical',
      data: { notificationId: notification.id }
    });

    desktopNotification.onclick = () => {
      window.focus();
      this.markAsRead(notification.id);
      desktopNotification.close();
    };

    // Auto close for non-critical notifications
    if (notification.priority !== 'critical' && notification.autoClose !== 0) {
      setTimeout(() => {
        desktopNotification.close();
      }, notification.autoClose || this.config.autoCloseDelay);
    }
  }

  // Core notification methods
  create(params: {
    type: NotificationType;
    priority?: NotificationPriority;
    title: string;
    message: string;
    persistent?: boolean;
    autoClose?: number;
    actions?: NotificationAction[];
    metadata?: Record<string, any>;
    desktopOptions?: DesktopNotificationOptions;
  }): string {
    const notification: BaseNotification = {
      id: this.generateId(),
      type: params.type,
      priority: params.priority || 'medium',
      title: params.title,
      message: params.message,
      timestamp: Date.now(),
      read: false,
      persistent: params.persistent ?? this.config.persistentTypes.includes(params.type),
      autoClose: params.autoClose ?? this.config.autoCloseDelay,
      actions: params.actions,
      metadata: params.metadata
    };

    this.addNotification(notification);
    
    // Show desktop notification
    if (this.config.enableDesktop) {
      this.showDesktopNotification(notification, params.desktopOptions);
    }

    return notification.id;
  }

  // Convenience methods
  info(title: string, message: string, options?: Partial<Parameters<typeof this.create>[0]>): string {
    return this.create({ type: 'info', title, message, ...options });
  }

  success(title: string, message: string, options?: Partial<Parameters<typeof this.create>[0]>): string {
    return this.create({ type: 'success', title, message, ...options });
  }

  warning(title: string, message: string, options?: Partial<Parameters<typeof this.create>[0]>): string {
    return this.create({ type: 'warning', title, message, priority: 'high', ...options });
  }

  error(title: string, message: string, options?: Partial<Parameters<typeof this.create>[0]>): string {
    return this.create({ 
      type: 'error', 
      title, 
      message, 
      priority: 'critical', 
      persistent: true,
      autoClose: 0,
      ...options 
    });
  }

  // Notification management
  getAll(): BaseNotification[] {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  }

  async syncNotifications(): Promise<void> {
    // Skip if recently synced
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    const lastNotificationSync = localStorage.getItem('lastNotificationSync');
    if (lastNotificationSync) {
      const age = Date.now() - parseInt(lastNotificationSync);
      if (age < 60000) { // 1 minute minimum between syncs
        return;
      }
    }

    try {
      const response = await notificationApiService.getNotifications({ limit: 50 });
      const apiNotifications = response.data.notifications;
      
      // Convert API notifications to BaseNotification format
      const notifications: BaseNotification[] = apiNotifications.map(this.convertApiNotification);
      
      // Merge with local notifications (keep local ones that aren't synced yet)
      const localNotifications = this.getAll();
      const localOnlyNotifications = localNotifications.filter(local => 
        !notifications.some(api => api.id === local.id)
      );
      
      const mergedNotifications = [...notifications, ...localOnlyNotifications]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.config.maxNotifications);
      
      this.saveNotifications(mergedNotifications);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lastNotificationSync', Date.now().toString());
      }
      this.notifyListeners();
    } catch (error) {
      console.warn('Could not sync notifications with backend:', error);
      // Continue with local notifications only
      this.notifyListeners();
    }
  }

  getUnread(): BaseNotification[] {
    return this.getAll().filter(n => !n.read);
  }

  async markAsRead(id: string): Promise<void> {
    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
      this.notifyListeners();
      
      // Sync with backend
      try {
        await notificationApiService.markAsRead(id);
      } catch (error) {
        console.error('Error syncing read status with backend:', error);
        // Revert local change if backend sync fails
        notification.read = false;
        this.saveNotifications(notifications);
        this.notifyListeners();
      }
    }
  }

  async markAllAsRead(): Promise<void> {
    const notifications = this.getAll();
    notifications.forEach(n => n.read = true);
    this.saveNotifications(notifications);
    this.notifyListeners();
    
    // Sync with backend
    try {
      await notificationApiService.markAllAsRead();
    } catch (error) {
      console.error('Error syncing mark all read with backend:', error);
    }
  }

  async remove(id: string): Promise<void> {
    const notifications = this.getAll().filter(n => n.id !== id);
    this.saveNotifications(notifications);
    this.notifyListeners();
    
    // Sync with backend
    try {
      await notificationApiService.deleteNotification(id);
    } catch (error) {
      console.error('Error syncing delete with backend:', error);
    }
  }

  clear(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('notifications');
    }
    this.notifyListeners();
  }

  // Listeners
  subscribe(callback: (notifications: BaseNotification[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getAll()); // Initial call
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Private methods
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addNotification(notification: BaseNotification): void {
    const notifications = this.getAll();
    notifications.unshift(notification);
    
    // Limit notifications
    if (notifications.length > this.config.maxNotifications) {
      notifications.splice(this.config.maxNotifications);
    }
    
    this.saveNotifications(notifications);
    this.notifyListeners();
  }

  private saveNotifications(notifications: BaseNotification[]): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('notificationConfig', JSON.stringify(this.config));
    }
  }

  private saveConfigWithTimestamp(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('notificationConfig', JSON.stringify(this.config));
      localStorage.setItem('notificationConfigTimestamp', Date.now().toString());
    }
  }

  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(callback => callback(notifications));
  }

  private loadConfigFromCache(): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const cachedConfig = localStorage.getItem('notificationConfig');
      const cacheTimestamp = localStorage.getItem('notificationConfigTimestamp');
      
      if (cachedConfig && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < this.syncInterval) {
          this.config = { ...this.config, ...JSON.parse(cachedConfig) };
          this.configSynced = true;
          return;
        }
      }
    } catch (error) {
      console.warn('Error loading config from cache:', error);
    }
  }

  private async loadConfigFromApi(): Promise<void> {
    // Skip if recently synced
    if (this.configSynced && (Date.now() - this.lastSyncTime) < this.syncInterval) {
      return;
    }

    try {
      const settings = await notificationApiService.getSettings();
      this.config = {
        enableDesktop: settings.enable_desktop,
        enableInApp: settings.enable_in_app,
        autoCloseDelay: settings.auto_close_delay,
        maxNotifications: settings.max_notifications,
        persistentTypes: ['error', 'warning']
      };
      this.saveConfigWithTimestamp();
      this.configSynced = true;
      this.lastSyncTime = Date.now();
    } catch (error) {
      console.warn('Could not sync notification config with backend:', error);
      // Continue with cached/default config
    }
  }

  private convertApiNotification(apiNotification: ApiNotification): BaseNotification {
    return {
      id: apiNotification.id,
      type: apiNotification.type,
      priority: apiNotification.priority,
      title: apiNotification.title,
      message: apiNotification.message,
      timestamp: new Date(apiNotification.created_at).getTime(),
      read: apiNotification.read,
      persistent: ['error', 'warning'].includes(apiNotification.type),
      autoClose: apiNotification.priority === 'critical' ? 0 : 5000,
      metadata: apiNotification.metadata
    };
  }

  // Auto-sync notifications periodically (less frequent)
  startAutoSync(intervalMs: number = 300000): void { // 5 minutes instead of 30 seconds
    setInterval(() => {
      this.syncNotifications().catch(error => {
        console.warn('Auto-sync failed:', error);
        // Don't throw error, just log and continue
      });
    }, intervalMs);
  }

  // Force sync (for user actions)
  async forceSyncNotifications(): Promise<void> {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('lastNotificationSync');
    }
    await this.syncNotifications();
  }
}

export const notificationService = NotificationService.getInstance();