import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .order("created_at", { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  const updateUsername = async (userId, username) => {
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);
    
    if (!error) {
      fetchUsers();
      setEditingUser(null);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // Note: This will only work if you have proper RLS policies or service role key
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      
      if (!error) {
        fetchUsers();
        setIsModalOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setEditingUser(null);
    setNewUsername(user.username);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setEditingUser(null);
  };

  const handleUpdateAndClose = async (userId, username) => {
    await updateUsername(userId, username);
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <>
          {/* User List View */}
          <div className="user-list-container">
            <h3 className="user-list-title">Users</h3>
            <ul className="user-list">
              {users.map(user => (
                <li 
                  key={user.id} 
                  className="user-list-item"
                  onClick={() => handleUserClick(user)}
                >
                  <span className="user-list-name">{user.username}</span>
                  <span className={`role-badge role-badge-small ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                    {user.role}
                  </span>
                  <svg className="user-list-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Card View */}
          <div className="user-cards-mobile">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-card-header">
                  <div className="user-card-main-info">
                    <div className="user-card-username">
                      {editingUser === user.id ? (
                        <input
                          value={newUsername}
                          onChange={e => setNewUsername(e.target.value)}
                          className="user-card-input"
                          autoFocus
                        />
                      ) : (
                        <span>{user.username}</span>
                      )}
                    </div>
                    <span className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <div className="user-card-body">
                  <div className="user-card-field">
                    <span className="user-card-label">Email</span>
                    <span className="user-card-value">{user.email}</span>
                  </div>
                  <div className="user-card-field">
                    <span className="user-card-label">Created At</span>
                    <span className="user-card-value">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="user-card-actions">
                  {editingUser === user.id ? (
                    <>
                      <button 
                        onClick={() => updateUsername(user.id, newUsername)}
                        className="btn-save btn-full"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="btn-cancel btn-full"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingUser(user.id);
                          setNewUsername(user.username);
                        }}
                        className="btn-edit btn-full"
                      >
                        Edit
                      </button>
                      {user.id !== currentUser.id && (
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="btn-delete btn-full"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* User Detail Modal */}
          {isModalOpen && selectedUser && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-content user-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div className="user-card">
                  <div className="user-card-header">
                    <div className="user-card-main-info">
                      <div className="user-card-username">
                        {editingUser === selectedUser.id ? (
                          <input
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            className="user-card-input"
                            autoFocus
                          />
                        ) : (
                          <span>{selectedUser.username}</span>
                        )}
                      </div>
                      <span className={`role-badge ${selectedUser.role === "admin" ? "role-admin" : "role-user"}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <div className="user-card-body">
                    <div className="user-card-field">
                      <span className="user-card-label">Email</span>
                      <span className="user-card-value">{selectedUser.email}</span>
                    </div>
                    <div className="user-card-field">
                      <span className="user-card-label">Created At</span>
                      <span className="user-card-value">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="user-card-actions">
                    {editingUser === selectedUser.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdateAndClose(selectedUser.id, newUsername)}
                          className="btn-save btn-full"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => {
                            setEditingUser(null);
                            setNewUsername(selectedUser.username);
                          }}
                          className="btn-cancel btn-full"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setEditingUser(selectedUser.id);
                            setNewUsername(selectedUser.username);
                          }}
                          className="btn-edit btn-full"
                        >
                          Edit
                        </button>
                        {selectedUser.id !== currentUser.id && (
                          <button 
                            onClick={() => deleteUser(selectedUser.id)}
                            className="btn-delete btn-full"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

