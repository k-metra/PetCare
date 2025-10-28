import React, { useState } from 'react';
import { useAdminNotifications, Notification } from '../contexts/adminNotificationContext';
import { FaBell, FaCheck, FaTrash, FaWifi, FaExclamationTriangle, FaCalendarPlus, FaCalendarTimes } from 'react-icons/fa';

const AdminNotifications: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useAdminNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_appointment':
        return <FaCalendarPlus className="text-green-500" />;
      case 'appointment_cancelled':
        return <FaCalendarTimes className="text-red-500" />;
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_appointment':
        return 'border-l-green-500 bg-green-50';
      case 'appointment_cancelled':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (created_at: string) => {
    const date = new Date(created_at);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <FaBell className="text-xl" />
        
        {/* Connection Status Indicator */}
        <div className="absolute -top-1 -left-1">
          {isConnected ? (
            <FaWifi className="text-xs text-green-500" />
          ) : (
            <FaExclamationTriangle className="text-xs text-red-500" />
          )}
        </div>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <FaWifi />
                    Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-red-600">
                    <FaExclamationTriangle />
                    Disconnected
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    title="Mark all as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button
                  onClick={clearNotifications}
                  className="text-sm text-red-600 hover:text-red-800"
                  title="Clear all notifications"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {connectionError && (
              <p className="text-xs text-red-600 mt-1">{connectionError}</p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="mx-auto text-4xl mb-2 opacity-30" />
                <p>No notifications yet</p>
                <p className="text-xs mt-1">You'll be notified of new appointments and cancellations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.data && (
                          <div className="mt-1 text-xs text-gray-600">
                            <p>
                              📅 {notification.data.appointment_date} at {notification.data.appointment_time}
                            </p>
                            {notification.data.pets_count && (
                              <p>🐾 {notification.data.pets_count} pet(s)</p>
                            )}
                            {notification.data.services && notification.data.services.length > 0 && (
                              <p>🛍️ {notification.data.services.join(', ')}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                          
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Showing latest {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminNotifications;