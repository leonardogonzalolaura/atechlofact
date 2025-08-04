import { withApiErrorHandling } from '../utils/apiWrapper';
import { 
  NotificationSettings, 
  ApiNotification, 
  NotificationsResponse, 
  CreateNotificationData,
  NotificationQueryParams,
  MarkAllReadParams 
} from './notificationApiTypes';

export const notificationApiService = {
  async getSettings(): Promise<NotificationSettings> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/notification-settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error('Error obteniendo configuración de notificaciones');
      }

      const data = await response.json();
      return data.data;
    });
  },

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/notification-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        const data = await response.json();
        throw new Error(data.message || 'Error actualizando configuración');
      }
    });
  },

  async getNotifications(params?: NotificationQueryParams): Promise<NotificationsResponse> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.read !== undefined) queryParams.append('read', params.read.toString());
      if (params?.company_id) queryParams.append('company_id', params.company_id.toString());

      const url = `https://tools.apis.atechlo.com/apisunat/user/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        throw new Error('Error obteniendo notificaciones');
      }

      return await response.json();
    });
  },

  async createNotification(notification: CreateNotificationData): Promise<void> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        const data = await response.json();
        throw new Error(data.message || 'Error creando notificación');
      }
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/user/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        const data = await response.json();
        throw new Error(data.message || 'Error marcando notificación como leída');
      }
    });
  },

  async markAllAsRead(params?: MarkAllReadParams): Promise<void> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch('https://tools.apis.atechlo.com/apisunat/user/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params || {}),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        const data = await response.json();
        throw new Error(data.message || 'Error marcando notificaciones como leídas');
      }
    });
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return withApiErrorHandling(async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de autenticación');

      const response = await fetch(`https://tools.apis.atechlo.com/apisunat/user/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sesión expirada');
        }
        const data = await response.json();
        throw new Error(data.message || 'Error eliminando notificación');
      }
    });
  }
};