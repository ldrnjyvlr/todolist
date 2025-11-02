import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import UserManagement from "../components/UserManagement";

function TaskForm({ onTaskAdd, user }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user) return;
    const { error } = await supabase
      .from("task")
      .insert([
        { title, description, user_id: user.id }
      ]);
    setLoading(false);
    if (!error) {
      setTitle("");
      setDescription("");
      onTaskAdd();
    }
  };
  return (
    <form onSubmit={handleSubmit} className="add-form">
      <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task Title" required />
      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" />
      <button type="submit" disabled={loading}>Add Task</button>
    </form>
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

  useEffect(() => {
    fetchTasks();
    fetchProfile();
    // Setup a simple realtime listener if you wish:
    // const subscription = supabase
    //   .from(`task:user_id=eq.${user.id}`)
    //   .on('*', fetchTasks)
    //   .subscribe();
    // return () => {
    //   supabase.removeSubscription(subscription);
    // };
    // For now we do manual fetch
  }, [user]);

  const filtered = {
    active: tasks.filter((t) => !t.is_completed && !t.is_archived),
    finished: tasks.filter((t) => t.is_completed && !t.is_archived),
    archived: tasks.filter((t) => t.is_archived)
  }

  const finishTask = async (id) => {
    await supabase.from("task").update({ is_completed: true }).eq("id", id);
    fetchTasks();
  };
  const archiveTask = async (id) => {
    await supabase.from("task").update({ is_archived: true }).eq("id", id);
    fetchTasks();
  };
  const startEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  };
  const cancelEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
  };
  const updateTask = async (id) => {
    if (!editTitle.trim()) return;
    await supabase
      .from("task")
      .update({ title: editTitle.trim(), description: editDescription.trim() })
      .eq("id", id);
    fetchTasks();
    cancelEdit();
  };
  const logout = async () => {
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
        <header><h1>Welcome Back</h1></header>
        <TaskForm onTaskAdd={fetchTasks} user={user}/>
        <div id="task-view-switch" className="task-view-switch">
          <button className={`tab-btn${section==="active"?" active":""}`} onClick={()=>setSection("active")}>Active</button>
          <button className={`tab-btn${section==="finished"?" active":""}`} onClick={()=>setSection("finished")}>Finished</button>
          <button className={`tab-btn${section==="archived"?" active":""}`} onClick={()=>setSection("archived")}>Archive</button>
          {profile && profile.role === 'admin' && (
            <button className={`tab-btn${section==="users"?" active":""}`} onClick={()=>setSection("users")}>Users</button>
          )}
        </div>
        <section id="active-section" style={{ display: section==="active"?'':'none' }} className="tasks-section">
          <h2>Active Tasks</h2>
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
                <div className="task-actions">
                  <span className="archived-badge">Archived</span>
                </div>
              </li>
            )) : <li className="task-card"><span>No archived tasks.</span></li>}
          </ul>
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
