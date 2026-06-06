import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, FileText,
  FileSpreadsheet, Activity, LogOut, Bell,
  CheckSquare, BarChart2, X, CheckCircle,
  AlertCircle, Info, ChevronDown
} from 'lucide-react';
import './index.css';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';
import Comparison from './pages/Comparison';
import Approvals from './pages/Approvals';
import Documents from './pages/Documents';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';

/* ─── Toast System ─────────────────────────────── */

function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' && <CheckCircle size={15} />}
            {t.type === 'danger'  && <AlertCircle size={15} />}
            {t.type === 'warning' && <AlertCircle size={15} />}
            {t.type === 'info'    && <Info size={15} />}
          </span>
          <div className="toast-body">
            {t.title && <div className="toast-title">{t.title}</div>}
            <div className="toast-msg">{t.message}</div>
          </div>
          <button className="toast-dismiss" onClick={() => dismiss(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [token, setToken]   = useState(localStorage.getItem('token') || '');
  const [user, setUser]     = useState(null);
  const [view, setView]     = useState('dashboard');
  const [selectedRfqId, setSelectedRfqId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  /* ─── Toast helpers ───────────────────────────── */

  const showToast = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* ─── Auth ────────────────────────────────────── */

  const fetchSession = async (currentToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSession(token);
    else setLoading(false);
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

  /* ─── Quick role switcher ─────────────────────── */

  const handleQuickRoleSwitch = async (roleName) => {
    const emailMap = {
      officer: 'officer@vendorbridge.com',
      approver: 'manager@vendorbridge.com',
      vendor1:  'vendor1@vendorbridge.com',
      vendor2:  'vendor2@vendorbridge.com',
      admin:    'admin@vendorbridge.com',
    };
    const email = emailMap[roleName];
    if (!email) return;
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if (res.ok) handleLoginSuccess(data.token, data.user);
    } catch {
      showToast('Role switch failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Loading screen ──────────────────────────── */

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} dismiss={dismissToast} />
      </>
    );
  }

  /* ─── Navigation ──────────────────────────────── */

  const allMenuItems = [
    { id: 'dashboard',  label: 'Dashboard',         icon: <LayoutDashboard size={16} />, roles: ['admin','officer','approver','vendor'] },
    { id: 'vendors',    label: 'Vendors',            icon: <Users size={16} />,           roles: ['admin','officer'] },
    { id: 'rfqs',       label: 'RFQs & Tenders',    icon: <FileText size={16} />,        roles: ['officer','vendor'] },
    { id: 'quotations', label: 'My Quotations',      icon: <FileSpreadsheet size={16} />, roles: ['vendor'] },
    { id: 'compare',    label: 'Compare Bids',       icon: <BarChart2 size={16} />,       roles: ['officer','admin'] },
    { id: 'approvals',  label: 'Approvals',          icon: <CheckSquare size={16} />,     roles: ['approver','admin'] },
    { id: 'documents',  label: 'Purchase Orders',    icon: <FileSpreadsheet size={16} />, roles: ['admin','officer','approver','vendor'] },
    { id: 'logs',       label: 'Activity Logs',      icon: <Activity size={16} />,        roles: ['admin','officer','approver','vendor'] },
    { id: 'analytics',  label: 'Analytics',          icon: <BarChart2 size={16} />,       roles: ['admin','officer','approver'] },
  ];

  const menuItems = allMenuItems.filter(m => m.roles.includes(user.role));

  const currentRoleKey = user.email.includes('vendor2') ? 'vendor2'
    : user.email.includes('vendor1') ? 'vendor1'
    : user.role === 'approver' ? 'approver'
    : user.role;

  return (
    <div className="app-container">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="sidebar no-print">
        <div className="brand">
          <div className="brand-icon">VB</div>
          <div>
            <div className="brand-name">VendorBridge</div>
            <div className="brand-sub">Procurement Suite</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.id}>
                <a
                  className={`nav-link ${view === item.id ? 'active' : ''}`}
                  onClick={() => { setView(item.id); setSelectedRfqId(null); }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="role-switcher-section no-print">
          <span className="role-switcher-label">Switch Role (Demo)</span>
          <select
            className="role-switcher-dropdown"
            value={currentRoleKey}
            onChange={e => handleQuickRoleSwitch(e.target.value)}
          >
            <option value="officer">Procurement Officer</option>
            <option value="approver">Finance Manager</option>
            <option value="vendor1">Apex Rep (Vendor)</option>
            <option value="vendor2">Zenith Rep (Vendor)</option>
            <option value="admin">System Admin</option>
          </select>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role-badge">{user.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────── */}
      <main className="main-workspace">
        <header className="header-bar no-print">
          <div className="page-title-area">
            <h1>{menuItems.find(m => m.id === view)?.label ?? 'VendorBridge'}</h1>
            <p>Role: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong></p>
          </div>
          <div className="header-actions">
            <div className="notification-bell"><Bell size={16} /></div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <div className="page-content">
          {view === 'dashboard'  && <Dashboard user={user} setView={setView} showToast={showToast} />}
          {view === 'vendors'    && <Vendors user={user} showToast={showToast} />}
          {view === 'rfqs'       && <Rfqs user={user} setView={setView} setSelectedRfqId={setSelectedRfqId} showToast={showToast} />}
          {view === 'quotations' && <Quotations user={user} showToast={showToast} />}
          {view === 'compare'    && <Comparison rfqId={selectedRfqId} setView={setView} setSelectedRfqId={setSelectedRfqId} showToast={showToast} />}
          {view === 'approvals'  && <Approvals user={user} showToast={showToast} />}
          {view === 'documents'  && <Documents user={user} showToast={showToast} />}
          {view === 'logs'       && <Logs />}
          {view === 'analytics'  && <Analytics />}
        </div>
      </main>

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </div>
  );
}
