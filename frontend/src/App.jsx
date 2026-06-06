import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, 
  FileSpreadsheet, Activity, LogOut, Bell, Shield, CheckSquare
} from 'lucide-react';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Comparison from './pages/Comparison';
import Approvals from './pages/Approvals';
import Documents from './pages/Documents';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    'New RFQ #1: Office Laptops Procurement has been published.',
    'Apex Rep submitted a quotation for RFQ #1.',
    'Zenith Rep submitted a quotation for RFQ #1.'
  ]);

  const fetchSession = async (currentToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token expired
        handleLogout();
      }
    } catch (err) {
      console.error(err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSession(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLoginSuccess = (newToken, loggedInUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setView('dashboard');
  };

  // Switch roles for quick local testing
  const handleQuickRoleSwitch = async (roleName) => {
    let email = '';
    if (roleName === 'officer') email = 'officer@vendorbridge.com';
    else if (roleName === 'approver') email = 'manager@vendorbridge.com';
    else if (roleName === 'vendor1') email = 'vendor1@vendorbridge.com';
    else if (roleName === 'vendor2') email = 'vendor2@vendorbridge.com';
    else if (roleName === 'admin') email = 'admin@vendorbridge.com';

    if (!email) return;

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if (res.ok) {
        handleLoginSuccess(data.token, data.user);
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Establishing secure ERP session...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render navigation links based on role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'officer', 'approver', 'vendor'] },
    { id: 'vendors', label: 'Vendors Directory', icon: <Users size={18} />, roles: ['admin', 'officer'] },
    { id: 'rfqs', label: 'RFQs & Tenders', icon: <FileText size={18} />, roles: ['officer', 'vendor'] },
    { id: 'compare', label: 'Compare Bids', icon: <FileSpreadsheet size={18} />, roles: ['officer'] },
    { id: 'approvals', label: 'Pending Approvals', icon: <CheckSquare size={18} />, roles: ['approver', 'admin'] },
    { id: 'documents', label: 'Financial Docs', icon: <FileSpreadsheet size={18} />, roles: ['admin', 'officer', 'approver', 'vendor'] },
    { id: 'logs', label: 'System Logs', icon: <Activity size={18} />, roles: ['admin', 'officer', 'approver', 'vendor'] },
    { id: 'analytics', label: 'Reports & Analytics', icon: <FileSpreadsheet size={18} />, roles: ['admin', 'officer', 'approver'] }
  ];

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar no-print">
        <div className="brand">
          <div className="brand-icon">VB</div>
          <span className="brand-name">VendorBridge</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ul className="nav-menu">
            {menuItems
              .filter(item => item.roles.includes(user.role))
              .map(item => (
                <li key={item.id}>
                  <a 
                    className={`nav-link ${view === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setView(item.id);
                      setSelectedRfqId(null);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
          </ul>

          <div className="sidebar-footer">
            {/* Quick Testing Role Switcher */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <Shield size={10} style={{ marginRight: '2px' }} /> Quick Swapper (Demo)
              </span>
              <select
                className="role-switcher-dropdown"
                value={user.email.includes('vendor1') ? 'vendor1' : user.email.includes('vendor2') ? 'vendor2' : user.role}
                onChange={(e) => handleQuickRoleSwitch(e.target.value)}
              >
                <option value="officer">Procurement Officer</option>
                <option value="approver">Finance Manager</option>
                <option value="vendor1">Apex Rep (Vendor)</option>
                <option value="vendor2">Zenith Rep (Vendor)</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Profile Widget */}
            <div className="user-profile-widget">
              <div className="user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role-badge">{user.role}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="main-workspace">
        
        {/* Top Header Bar */}
        <header className="header-bar no-print">
          <div className="page-title-area">
            <h1>VendorBridge Procurement</h1>
            <p>Role Authorized: <strong style={{ color: 'var(--primary)' }}>{user.role.toUpperCase()}</strong></p>
          </div>

          <div className="header-actions">
            {/* Notifications Alert Bell */}
            <div className="notification-bell" onClick={() => setNotificationOpen(!notificationOpen)}>
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="bell-badge">{notifications.length}</span>
              )}

              {notificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: '0',
                  width: '320px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 200,
                  cursor: 'default'
                }} onClick={(e) => e.stopPropagation()}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications Queue</span>
                    <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
                  </h4>
                  {notifications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem 0' }}>No unread alerts</p>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        {n}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Logout button */}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Exit ERP</span>
            </button>
          </div>
        </header>

        {/* Dynamic Workspace views */}
        <div style={{ flexGrow: 1 }}>
          {view === 'dashboard' && <Dashboard user={user} setView={setView} />}
          {view === 'vendors' && <Vendors user={user} />}
          {view === 'rfqs' && <Rfqs user={user} setView={setView} setSelectedRfqId={setSelectedRfqId} />}
          {view === 'compare' && <Comparison rfqId={selectedRfqId} setView={setView} setSelectedRfqId={setSelectedRfqId} />}
          {view === 'approvals' && <Approvals user={user} />}
          {view === 'documents' && <Documents user={user} />}
          {view === 'logs' && <Logs />}
          {view === 'analytics' && <Analytics />}
        </div>
      </main>

    </div>
  );
}
