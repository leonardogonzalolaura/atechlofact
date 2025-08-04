'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { BaseNotification, NotificationStats, NotificationFilter } from '../services/notificationTypes';

interface NotificationContextType {
  notifications: BaseNotification[];
  unreadCount: number;
  stats: NotificationStats;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
  filter: (filter: NotificationFilter) => BaseNotification[];
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<BaseNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setIsLoading(false);
    });

    // Initial sync with backend (non-blocking)
    notificationService.syncNotifications().catch(error => {
      console.warn('Initial notification sync failed:', error);
      setIsLoading(false); // Don't block UI if sync fails
    });
    
    // Start auto-sync every 5 minutes (reduced frequency)
    notificationService.startAutoSync(300000);

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const stats: NotificationStats = {
    total: notifications.length,
    unread: unreadCount,
    byType: notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) as Record<string, number>,
    byPriority: notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) as Record<string, number>
  };

  const filter = (filterOptions: NotificationFilter): BaseNotification[] => {
    return notifications.filter(notification => {
      if (filterOptions.type && notification.type !== filterOptions.type) return false;
      if (filterOptions.priority && notification.priority !== filterOptions.priority) return false;
      if (filterOptions.read !== undefined && notification.read !== filterOptions.read) return false;
      if (filterOptions.dateFrom && notification.timestamp < filterOptions.dateFrom.getTime()) return false;
      if (filterOptions.dateTo && notification.timestamp > filterOptions.dateTo.getTime()) return false;
      return true;
    });
  };

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const remove = async (id: string) => {
    await notificationService.remove(id);
  };

  const clear = () => {
    notificationService.clear();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      stats,
      markAsRead,
      markAllAsRead,
      remove,
      clear,
      filter,
      isLoading
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};