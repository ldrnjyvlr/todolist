import React, { useEffect, useState } from 'react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  requestNotificationPermission
} from '../utils/notifications';
import './Notifications.css';

export default function Notifications({ onNotificationsUpdate, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    loadNotifications();
    checkPermissionStatus();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkPermissionStatus = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    const notifs = await fetchNotifications({ unreadOnly: false });
    setNotifications(notifs);
    setLoading(false);
    if (onNotificationsUpdate) {
      onNotificationsUpdate();
    }
  };

  const handleMarkRead = async (notificationId) => {
    await markNotificationRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    await loadNotifications();
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
    await loadNotifications();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      alert('Notifications enabled! You will receive alerts on your device.');
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 10);
  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="notifications-container">
        <h2>Notifications</h2>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>
          🔔 Notifications
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h2>
        <div className="notifications-header-actions">
          {onClose && (
            <button 
              className="notifications-close-btn"
              onClick={onClose}
              aria-label="Close notifications"
              title="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
        <div className="notifications-actions">
          {permissionStatus !== 'granted' && (
            <button 
              onClick={handleEnableNotifications} 
              className="btn-enable-notifications"
              title="Enable push notifications on your device"
            >
              Enable Push Notifications
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="btn-mark-all-read"
              title="Mark all as read"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {permissionStatus === 'default' && (
        <div className="permission-banner">
          💡 Enable browser notifications to receive alerts on your device when tasks are due soon!
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div className="permission-banner denied">
          ⚠️ Notifications are blocked. Please enable them in your browser settings to receive alerts.
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <div className="empty-icon">📭</div>
          <p>No notifications yet</p>
          <p className="empty-subtitle">You'll see alerts here when tasks are due soon</p>
        </div>
      ) : (
        <>
          <ul className="notifications-list">
            {displayedNotifications.map(notification => (
              <li
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-title">
                    <span className="notification-icon">
                      {notification.type === 'task_reminder' ? '⏰' : '🔔'}
                    </span>
                    {notification.title}
                  </div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="btn-mark-read"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="btn-delete-notification"
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {notifications.length > 10 && (
            <div className="notifications-footer">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn-toggle-more"
              >
                {showAll ? 'Show Less' : `Show All (${notifications.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

