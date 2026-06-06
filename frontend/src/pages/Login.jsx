import React, { useState } from 'react';
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPw, setShowPw]     = useState(false);

  const testAccounts = [
    { label: 'Procurement Officer', email: 'officer@vendorbridge.com', role: 'officer' },
    { label: 'Finance Manager',     email: 'manager@vendorbridge.com',  role: 'approver' },
    { label: 'Apex Rep (Vendor)',   email: 'vendor1@vendorbridge.com',  role: 'vendor' },
    { label: 'System Admin',        email: 'admin@vendorbridge.com',    role: 'admin' },
  ];

  const roleColors = {
    officer: '#2563eb', approver: '#059669', vendor: '#d97706', admin: '#7c3aed'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f6f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#4f46e5', color: 'white', width: 48, height: 48,
            borderRadius: 12, fontSize: 18, fontWeight: 800, marginBottom: 14
          }}>VB</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            VendorBridge
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
            Procurement & Vendor Management
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Test Accounts Panel */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Shield size={16} color="#4f46e5" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Demo Accounts
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>
              Click any account to autofill. Password: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>password123</code>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {testAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  style={{
                    background: email === acc.email ? '#eef2ff' : '#f8fafc',
                    border: `1px solid ${email === acc.email ? '#a5b4fc' : '#e2e8f0'}`,
                    borderRadius: 8, padding: '10px 12px', textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: roleColors[acc.role], flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{acc.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 1 }}>{acc.email}</div>
                  </div>
                  <div style={{
                    marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 600,
                    color: roleColors[acc.role], textTransform: 'uppercase', letterSpacing: '0.3px'
                  }}>{acc.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sign In Form */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              Sign in to your account
            </h2>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
                padding: '10px 12px', marginBottom: 16,
                fontSize: '0.8rem', color: '#b91c1c'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email" className="form-control"
                  placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} className="form-control"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#94a3b8', display: 'flex', alignItems: 'center'
                    }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  background: '#4f46e5', color: 'white', border: 'none',
                  borderRadius: 8, padding: '10px', fontWeight: 600,
                  fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s', marginTop: 4
                }}
              >
                <LogIn size={15} />
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
