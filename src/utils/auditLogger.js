import { supabase } from '../supabaseClient';

/**
 * Logs an audit event to the database
 * @param {string} action - The action performed (e.g., 'login', 'logout', 'create_task', 'edit_task', 'finish_task', 'archive_task')
 * @param {object} options - Additional options
 * @param {string} options.entityType - Type of entity (e.g., 'task', 'user')
 * @param {string} options.entityId - ID of the entity affected
 * @param {object} options.details - Additional details about the action
 * @param {string} options.username - Username of the user performing the action (optional, will be fetched if not provided)
 */
export async function logAuditEvent(action, options = {}) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log audit event: No user authenticated');
      return;
    }

    // Get user profile to get username
    let username = options.username;
    if (!username) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        username = profile.username;
      } else {
        username = user.email || 'Unknown';
      }
    }

    // Prepare audit log entry
    const auditEntry = {
      user_id: user.id,
      username: username,
      action: action,
      entity_type: options.entityType || null,
      entity_id: options.entityId || null,
      details: options.details || {},
      created_at: new Date().toISOString()
    };

    // Insert into audit_logs table
    const { error } = await supabase
      .from('audit_logs')
      .insert([auditEntry]);

    if (error) {
      console.error('Error logging audit event:', error);
    }
  } catch (error) {
    console.error('Exception while logging audit event:', error);
  }
}

/**
 * Convenience functions for specific actions
 */
export const auditLogger = {
  login: async (username) => {
    await logAuditEvent('login', { username, details: { timestamp: new Date().toISOString() } });
  },
  
  logout: async (username) => {
    await logAuditEvent('logout', { username, details: { timestamp: new Date().toISOString() } });
  },
  
  createTask: async (taskId, taskTitle) => {
    await logAuditEvent('create_task', {
      entityType: 'task',
      entityId: taskId,
      details: { title: taskTitle }
    });
  },
  
  editTask: async (taskId, taskTitle, changes) => {
    await logAuditEvent('edit_task', {
      entityType: 'task',
      entityId: taskId,
      details: { title: taskTitle, changes }
    });
  },
  
  finishTask: async (taskId, taskTitle) => {
    await logAuditEvent('finish_task', {
      entityType: 'task',
      entityId: taskId,
      details: { title: taskTitle }
    });
  },
  
  archiveTask: async (taskId, taskTitle) => {
    await logAuditEvent('archive_task', {
      entityType: 'task',
      entityId: taskId,
      details: { title: taskTitle }
    });
  }
};

