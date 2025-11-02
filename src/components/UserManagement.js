import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

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
      }
    }
  };

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="table-cell">
                    {editingUser === user.id ? (
                      <input
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        className="table-input"
                      />
                    ) : (
                      <span className="table-username">{user.username}</span>
                    )}
                  </td>
                  <td className="table-cell table-email">{user.email}</td>
                  <td className="table-cell">
                    <span className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="table-cell table-date">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell table-actions">
                    {editingUser === user.id ? (
                      <div className="action-buttons">
                        <button 
                          onClick={() => updateUsername(user.id, newUsername)}
                          className="btn-save"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingUser(null)}
                          className="btn-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons">
                        <button 
                          onClick={() => {
                            setEditingUser(user.id);
                            setNewUsername(user.username);
                          }}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        {user.id !== currentUser.id && (
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

