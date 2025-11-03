import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import UserManagement from "../components/UserManagement";
import Notifications from "../components/Notifications";
import { auditLogger } from "../utils/auditLogger";
import { checkTaskReminders, requestNotificationPermission, fetchNotifications } from "../utils/notifications";

function TaskFormModal({ isOpen, onClose, onTaskAdd, user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;
    
    // Prepare task data
    const taskData = {
      title,
      description,
      user_id: user.id
    };
    
    // Add due_date if provided
    if (dueDate) {
      taskData.due_date = dueDate;
    }
    
    // Add due_time if provided
    if (dueTime) {
      taskData.due_time = dueTime;
    }
    
    const { data, error } = await supabase
      .from("task")
      .insert([taskData])
      .select()
      .single();
    setLoading(false);
    if (!error && data) {
      // Log task creation
      await auditLogger.createTask(data.id, title);
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      onTaskAdd();
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="modal-header">
          <h2>Add New Task</h2>
          <p>Create a task to stay organized</p>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input 
              id="task-title"
              type="text" 
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              placeholder="Task Title" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea 
              id="task-description"
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
              placeholder="Description (optional)" 
              rows="3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-due-date">Due Date & Time</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                id="task-due-date"
                type="date" 
                value={dueDate} 
                onChange={e=>setDueDate(e.target.value)} 
                placeholder="Due Date (optional)"
                min={today}
                style={{ flex: '1', minWidth: '150px' }}
              />
              <input 
                id="task-due-time"
                type="time" 
                value={dueTime} 
                onChange={e=>setDueTime(e.target.value)} 
                placeholder="Due Time (optional)"
                style={{ flex: '1', minWidth: '150px' }}
              />
            </div>
          </div>
          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState("active");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editDueTime, setEditDueTime] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  const fetchTasks = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("task")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchUnreadCount = async () => {
    const notifications = await fetchNotifications();
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    fetchTasks();
    fetchProfile();
    fetchUnreadCount();
    
    // Request notification permission on load
    requestNotificationPermission();
    
    // Check for task reminders immediately
    checkTaskReminders();
    
    // Check for task reminders every minute
    const reminderInterval = setInterval(() => {
      checkTaskReminders();
    }, 60000); // Check every minute
    
    // Check for unread notifications every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    // Setup a simple realtime listener if you wish:
    // const subscription = supabase
    //   .from(`task:user_id=eq.${user.id}`)
    //   .on('*', fetchTasks)
    //   .subscribe();
    // return () => {
    //   supabase.removeSubscription(subscription);
    // };
    
    return () => {
      clearInterval(reminderInterval);
      clearInterval(notificationInterval);
    };
  }, [user]);

  const filtered = {
    active: tasks.filter((t) => !t.is_completed && !t.is_archived),
    finished: tasks.filter((t) => t.is_completed && !t.is_archived),
    archived: tasks.filter((t) => t.is_archived)
  }

  const finishTask = async (id) => {
    // Get task title before updating
    const task = tasks.find(t => t.id === id);
    await supabase.from("task").update({ is_completed: true }).eq("id", id);
    // Log task completion
    if (task) {
      await auditLogger.finishTask(id, task.title);
    }
    fetchTasks();
  };
  const archiveTask = async (id) => {
    // Get task title before updating
    const task = tasks.find(t => t.id === id);
    await supabase.from("task").update({ is_archived: true }).eq("id", id);
    // Log task archive
    if (task) {
      await auditLogger.archiveTask(id, task.title);
    }
    fetchTasks();
  };
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDueDate(task.due_date || "");
    setEditDueTime(task.due_time || "");
  };
  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
    setEditDueTime("");
  };
  const updateTask = async (id) => {
    if (!editTitle.trim()) return;
    // Get original task to track changes
    const originalTask = tasks.find(t => t.id === id);
    const changes = {};
    if (originalTask) {
      if (originalTask.title !== editTitle.trim()) {
        changes.title = { from: originalTask.title, to: editTitle.trim() };
      }
      if ((originalTask.description || '') !== editDescription.trim()) {
        changes.description = { 
          from: originalTask.description || '', 
          to: editDescription.trim() 
        };
      }
      if ((originalTask.due_date || '') !== editDueDate) {
        changes.due_date = { 
          from: originalTask.due_date || '', 
          to: editDueDate 
        };
      }
      if ((originalTask.due_time || '') !== editDueTime) {
        changes.due_time = { 
          from: originalTask.due_time || '', 
          to: editDueTime 
        };
      }
    }
    
    // Prepare update data
    const updateData = {
      title: editTitle.trim(),
      description: editDescription.trim()
    };
    
    // Add due_date if provided, or set to null if cleared
    if (editDueDate) {
      updateData.due_date = editDueDate;
    } else {
      updateData.due_date = null;
    }
    
    // Add due_time if provided, or set to null if cleared
    if (editDueTime) {
      updateData.due_time = editDueTime;
    } else {
      updateData.due_time = null;
    }
    
    await supabase
      .from("task")
      .update(updateData)
      .eq("id", id);
    
    // Log task edit
    await auditLogger.editTask(id, editTitle.trim(), changes);
    
    fetchTasks();
    cancelEdit();
  };
  const logout = async () => {
    // Log logout event
    if (profile) {
      await auditLogger.logout(profile.username);
    }
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <button 
        className="hamburger-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>📋</h2>
        <div className="brand">To-Do Dashboard</div>
        <hr style={{width:'80%', margin:'20px 0 12px 0', borderColor: '#ded0ff'}} />
        {profile && (
          <>
            <div style={{fontSize:'1.05rem',color:'#ffe773',paddingBottom:5}}>👤 {profile.username}</div>
            <div style={{fontSize:'0.9rem',color:'#ccc',paddingBottom:10}}>
              {profile.role === 'admin' ? '🛡️ Admin' : '👤 User'}
            </div>
          </>
        )}
        <div style={{fontSize:'0.85rem',color:'#999',paddingBottom:10}}>{user.email}</div>
        <button onClick={logout}>Logout</button>
      </aside>
      <div className="main-content">
        <header>
          <h1>Welcome Back</h1>
          <button 
            className="notification-bell-btn"
            onClick={() => setSection("notifications")}
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
        </header>
        <TaskFormModal 
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onTaskAdd={fetchTasks}
          user={user}
        />
        <div id="task-view-switch" className="task-view-switch">
          <button className={`tab-btn${section==="active"?" active":""}`} onClick={()=>setSection("active")}>Active</button>
          <button className={`tab-btn${section==="finished"?" active":""}`} onClick={()=>setSection("finished")}>Finished</button>
          <button className={`tab-btn${section==="archived"?" active":""}`} onClick={()=>setSection("archived")}>Archive</button>
          {profile && profile.role === 'admin' && (
            <button className={`tab-btn${section==="users"?" active":""}`} onClick={()=>setSection("users")}>Users</button>
          )}
        </div>
        <section id="active-section" style={{ display: section==="active"?'':'none' }} className="tasks-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Active Tasks</h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-task-btn"
              aria-label="Add new task"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #ffc0cb 0%, #c7b5f3 100%)',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              +
            </button>
          </div>
          <ul className="tasks-list">
            {loading ? <li>Loading...</li> : filtered.active.length > 0 ? filtered.active.map(task => (
              <li key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`}>
                {editingTask === task.id ? (
                  <>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task Title"
                      className="edit-input"
                      required
                    />
                    <textarea 
                      value={editDescription} 
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="edit-textarea"
                    />
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="date" 
                        value={editDueDate} 
                        onChange={(e) => setEditDueDate(e.target.value)}
                        placeholder="Due Date (optional)"
                        min={today}
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                      <input 
                        type="time" 
                        value={editDueTime} 
                        onChange={(e) => setEditDueTime(e.target.value)}
                        placeholder="Due Time (optional)"
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                    </div>
                    <div className="task-actions">
                      <button onClick={() => updateTask(task.id)} aria-label="Save changes" className="save-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button onClick={cancelEdit} aria-label="Cancel editing" className="cancel-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    {(task.due_date || task.due_time) && (
                      <div style={{ fontSize: '0.9rem', color: '#8a0f55', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>📅</span>
                        <span>
                          {task.due_date && new Date(task.due_date).toLocaleDateString()}
                          {task.due_date && task.due_time && ' at '}
                          {task.due_time && task.due_time}
                        </span>
                      </div>
                    )}
                    <div className="task-actions">
                      <button onClick={() => startEdit(task)} aria-label="Edit task">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button onClick={()=>finishTask(task.id)} aria-label="Finish task">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button onClick={()=>archiveTask(task.id)} aria-label="Archive task">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            )) : <li className="task-card"><span>No active tasks.</span></li>}
          </ul>
        </section>
        <section id="finished-section" style={{ display: section==="finished"?'':'none' }} className="tasks-section">
          <h2>Finished Tasks</h2>
          <ul className="tasks-list">
            {filtered.finished.length > 0 ? filtered.finished.map(task => (
              <li key={task.id} className="task-card completed">
                {editingTask === task.id ? (
                  <>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task Title"
                      className="edit-input"
                      required
                    />
                    <textarea 
                      value={editDescription} 
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="edit-textarea"
                    />
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="date" 
                        value={editDueDate} 
                        onChange={(e) => setEditDueDate(e.target.value)}
                        placeholder="Due Date (optional)"
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                      <input 
                        type="time" 
                        value={editDueTime} 
                        onChange={(e) => setEditDueTime(e.target.value)}
                        placeholder="Due Time (optional)"
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                    </div>
                    <div className="task-actions">
                      <button onClick={() => updateTask(task.id)} aria-label="Save changes" className="save-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button onClick={cancelEdit} aria-label="Cancel editing" className="cancel-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    {(task.due_date || task.due_time) && (
                      <div style={{ fontSize: '0.9rem', color: '#8a0f55', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>📅</span>
                        <span>
                          {task.due_date && new Date(task.due_date).toLocaleDateString()}
                          {task.due_date && task.due_time && ' at '}
                          {task.due_time && task.due_time}
                        </span>
                      </div>
                    )}
                    <div className="task-actions">
                      <span className="finished-badge">Finished</span>
                      <button onClick={() => startEdit(task)} aria-label="Edit task">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button onClick={()=>archiveTask(task.id)} aria-label="Archive task">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            )) : <li className="task-card"><span>No finished tasks.</span></li>}
          </ul>
        </section>
        <section id="archived-section" style={{ display: section==="archived"?'':'none' }} className="tasks-section">
          <h2>Archived Tasks</h2>
          <ul className="tasks-list">
            {filtered.archived.length > 0 ? filtered.archived.map(task => (
              <li key={task.id} className={`task-card ${task.is_completed ? "completed" : ""}`}>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                {(task.due_date || task.due_time) && (
                  <div style={{ fontSize: '0.9rem', color: '#8a0f55', marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>📅</span>
                    <span>
                      {task.due_date && new Date(task.due_date).toLocaleDateString()}
                      {task.due_date && task.due_time && ' at '}
                      {task.due_time && task.due_time}
                    </span>
                  </div>
                )}
                <div className="task-actions">
                  <span className="archived-badge">Archived</span>
                </div>
              </li>
            )) : <li className="task-card"><span>No archived tasks.</span></li>}
          </ul>
        </section>
        <section id="notifications-section" style={{ display: section==="notifications"?'':'none' }} className="tasks-section">
          <Notifications 
            onNotificationsUpdate={fetchUnreadCount} 
            onClose={() => setSection("active")}
          />
        </section>
        {profile && profile.role === 'admin' && (
          <section id="users-section" style={{ display: section==="users"?'':'none' }} className="tasks-section">
            <UserManagement currentUser={user} />
          </section>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
