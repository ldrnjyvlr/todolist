import React, { useState } from 'react';
import UserManagement from '../components/UserManagement';
import AccountSettings from '../components/AccountSettings';
import { supabase } from '../supabaseClient';

const fakeCurrentUser = { id: 'admin', username: 'Admin', role: 'admin' };

const AdminDashboard = () => {
  const [selected, setSelected] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = (section) => {
    setSelected(section);
    setSidebarOpen(false); // Close sidebar on mobile after selection
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
        <div className="brand">Admin Panel</div>
        <button 
          className={selected === 'dashboard' ? 'tab-btn active' : 'tab-btn'} 
          onClick={() => handleNavClick('dashboard')}
        >
          Dashboard Home
        </button>
        <button 
          className={selected === 'users' ? 'tab-btn active' : 'tab-btn'} 
          onClick={() => handleNavClick('users')}
        >
          User Management
        </button>
        <button 
          className={selected === 'settings' ? 'tab-btn active' : 'tab-btn'} 
          onClick={() => handleNavClick('settings')}
        >
          Settings
        </button>
        <button 
          className='tab-btn'
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }}
          style={{ marginTop: 'auto' }}
        >
          Log Out
        </button>
      </aside>
      <main className="main-content">
        {selected === 'dashboard' && (
          <>
            <h1>Admin Dashboard</h1>
            <p>Welcome, Admin! This is your dashboard.</p>
            {/* More admin widgets/components can go here */}
          </>
        )}
        {selected === 'users' && (
          <UserManagement currentUser={fakeCurrentUser} />
        )}
        {selected === 'settings' && (
          <AccountSettings />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
