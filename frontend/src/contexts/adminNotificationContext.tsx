import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiUrl } from '../utils/apiConfig';

export interface Notification {
  id: string;
  type: 'new_appointment' | 'appointment_cancelled' | 'heartbeat' | 'connected' | 'reconnect';
  message: string;
  data?: any;
  timestamp: number;
  created_at: string;
  isRead?: boolean;
}

export interface AdminNotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  connectionError: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

interface AdminNotificationProviderProps {
  children: React.ReactNode;
  userRole?: string;
}

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ 
  children, 
  userRole 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef(0);

  // Only connect if user is admin or staff
  const shouldConnect = userRole === 'admin' || userRole === 'staff';

  // Efficient polling function
  const pollForNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setConnectionError('No authentication token');
        return;
      }

      const response = await fetch(apiUrl.adminNotifications() + `?since=${lastTimestampRef.current}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && data.notifications.length > 0) {
          console.log('🔔 Received notifications:', data.notifications.length);
          
          setNotifications(prev => {
            const newNotifications = data.notifications.filter((n: Notification) => 
              !prev.some(existing => existing.id === n.id)
            );
            
            if (newNotifications.length > 0) {
              return [...newNotifications.map((n: Notification) => ({ ...n, isRead: false })), ...prev].slice(0, 50);
            }
            return prev;
          });
        }
        lastTimestampRef.current = data.timestamp;
        setIsConnected(true);
        setConnectionError(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('🔔 Polling error:', error);
      setIsConnected(false);
      setConnectionError('Connection failed');
    }
  };

  useEffect(() => {
    if (!shouldConnect) {
      return;
    }

    console.log('🔔 Starting efficient notification polling');
    
    // Initial poll
    pollForNotifications();
    
    // Poll every 15 seconds (much more efficient than SSE)
    pollingRef.current = setInterval(pollForNotifications, 15000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [shouldConnect]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(apiUrl.adminNotificationsClear(), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications([]);
        lastTimestampRef.current = Math.floor(Date.now() / 1000);
      }
    } catch (error) {
      console.error('🔔 Error clearing notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: AdminNotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};