import { supabase } from '../supabaseClient';

/**
 * Check for tasks that are 1 hour before due date and send notifications
 * @returns {Promise<void>}
 */
export async function checkTaskReminders() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    
    // Fetch all active tasks with due dates/times for current user
    const { data: tasks, error } = await supabase
      .from('task')
      .select('*')
      .eq('user_id', user.id)
      .not('due_date', 'is', null)
      .is('is_completed', false)
      .is('is_archived', false);

    if (error) {
      console.error('Error fetching tasks for reminders:', error);
      return;
    }

    if (!tasks || tasks.length === 0) return;

    // Process each task
    for (const task of tasks) {
      if (!task.due_date) continue;

      // Combine due_date and due_time to get full datetime
      // Default to end of day if no time specified
      const timeStr = task.due_time || '23:59:59';
      const dueDateTime = new Date(`${task.due_date}T${timeStr}`);
      
      // Calculate time difference in milliseconds
      const timeDiff = dueDateTime - now;
      const hoursUntilDue = timeDiff / (1000 * 60 * 60);

      // Check if task is exactly 1 hour before due (within a 5-minute window)
      if (hoursUntilDue >= 0.92 && hoursUntilDue <= 1.08) {
        // Check if notification already sent today for this task
        const todayDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const { data: existingNotification } = await supabase
          .from('notification_tracking')
          .select('id')
          .eq('task_id', task.id)
          .eq('notification_type', '1hr_reminder')
          .eq('sent_date', todayDate)
          .single();

        // If no notification sent today, send one
        if (!existingNotification) {
          await createNotification({
            taskId: task.id,
            title: '⏰ Task Due Soon',
            message: `"${task.title}" is due in 1 hour!`,
            type: 'task_reminder'
          });

          // Track this notification
          await supabase
            .from('notification_tracking')
            .insert({
              task_id: task.id,
              notification_type: '1hr_reminder'
            });
        }
      }
    }
  } catch (error) {
    console.error('Error checking task reminders:', error);
  }
}

/**
 * Create a new notification for the current user
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.taskId - Task ID (optional)
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type
 * @returns {Promise<void>}
 */
export async function createNotification({ taskId, title, message, type = 'system' }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        task_id: taskId,
        type,
        title,
        message
      });

    if (error) {
      console.error('Error creating notification:', error);
    } else {
      // Trigger browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/logo192.png',
          tag: taskId || 'notification'
        });
      }
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
  }
}

/**
 * Fetch all notifications for the current user
 * @param {Object} options - Fetch options
 * @param {boolean} options.unreadOnly - Only fetch unread notifications
 * @returns {Promise<Array>}
 */
export async function fetchNotifications({ unreadOnly = false } = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    return [];
  }
}

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markNotificationRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
  }
}

/**
 * Mark all notifications as read for the current user
 * @returns {Promise<void>}
 */
export async function markAllNotificationsRead() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  } catch (error) {
    console.error('Error in markAllNotificationsRead:', error);
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error);
  }
}

/**
 * Request notification permission from the browser
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

