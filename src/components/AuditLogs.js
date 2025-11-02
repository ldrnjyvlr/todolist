import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuditLogs({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, login, logout, create_task, edit_task, finish_task, archive_task

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filter !== 'all') {
        query = query.eq('action', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      login: '🔓',
      logout: '🔒',
      create_task: '➕',
      edit_task: '✏️',
      finish_task: '✅',
      archive_task: '📦'
    };
    return icons[action] || '📋';
  };

  const getActionColor = (action) => {
    const colors = {
      login: '#6dd28c',
      logout: '#ff6b6b',
      create_task: '#4dabf7',
      edit_task: '#ffd43b',
      finish_task: '#51cf66',
      archive_task: '#b094d8'
    };
    return colors[action] || '#999';
  };

  const actionLabels = {
    login: 'Login',
    logout: 'Logout',
    create_task: 'Create Task',
    edit_task: 'Edit Task',
    finish_task: 'Finish Task',
    archive_task: 'Archive Task'
  };

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h2>Audit Logs</h2>
        <button onClick={fetchLogs} className="refresh-btn" aria-label="Refresh logs">
          🔄 Refresh
        </button>
      </div>

      <div className="audit-logs-filters">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All Actions
        </button>
        <button
          className={filter === 'login' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('login')}
        >
          Logins
        </button>
        <button
          className={filter === 'logout' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('logout')}
        >
          Logouts
        </button>
        <button
          className={filter === 'create_task' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('create_task')}
        >
          Task Creation
        </button>
        <button
          className={filter === 'edit_task' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('edit_task')}
        >
          Task Editing
        </button>
        <button
          className={filter === 'finish_task' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('finish_task')}
        >
          Task Completion
        </button>
        <button
          className={filter === 'archive_task' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('archive_task')}
        >
          Task Archive
        </button>
      </div>

      {loading && <div className="loading">Loading audit logs...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="audit-logs-table-container desktop-view">
            {logs.length === 0 ? (
              <div className="no-logs">No audit logs found.</div>
            ) : (
              <table className="audit-logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="time-cell">{formatDate(log.created_at)}</td>
                      <td className="user-cell">{log.username || 'Unknown'}</td>
                      <td className="action-cell">
                        <span
                          className="action-badge"
                          style={{ backgroundColor: getActionColor(log.action) }}
                        >
                          {getActionIcon(log.action)} {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td className="details-cell">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="details-content">
                            {log.details.title && (
                              <div><strong>Task:</strong> {log.details.title}</div>
                            )}
                            {log.details.changes && (
                              <div><strong>Changes:</strong> {JSON.stringify(log.details.changes)}</div>
                            )}
                            {log.entity_id && (
                              <div className="entity-id">ID: {log.entity_id.substring(0, 8)}...</div>
                            )}
                          </div>
                        ) : (
                          <span className="no-details">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="audit-logs-cards-container mobile-view">
            {logs.length === 0 ? (
              <div className="no-logs">No audit logs found.</div>
            ) : (
              <div className="audit-logs-cards">
                {logs.map((log) => (
                  <div key={log.id} className="audit-log-card">
                    <div className="audit-log-card-header">
                      <div className="audit-log-user">
                        <span className="audit-log-user-name">{log.username || 'Unknown'}</span>
                        <span className="audit-log-time-short">{formatDateShort(log.created_at)}</span>
                      </div>
                      <span
                        className="action-badge-mobile"
                        style={{ backgroundColor: getActionColor(log.action) }}
                      >
                        {getActionIcon(log.action)} {actionLabels[log.action] || log.action}
                      </span>
                    </div>
                    <div className="audit-log-card-body">
                      <div className="audit-log-time-full">
                        <strong>Time:</strong> {formatDate(log.created_at)}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="audit-log-details">
                          {log.details.title && (
                            <div className="audit-log-detail-item">
                              <strong>Task:</strong> {log.details.title}
                            </div>
                          )}
                          {log.details.changes && (
                            <div className="audit-log-detail-item">
                              <strong>Changes:</strong> {JSON.stringify(log.details.changes)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

