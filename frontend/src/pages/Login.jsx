import React, { useState } from 'react';
import { LogIn, Shield } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAutofill = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
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

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { label: 'Procurement Officer', email: 'officer@vendorbridge.com' },
    { label: 'Finance Manager', email: 'manager@vendorbridge.com' },
    { label: 'Apex Rep (Vendor)', email: 'vendor1@vendorbridge.com' },
    { label: 'System Admin', email: 'admin@vendorbridge.com' }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#070a13',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '900px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>VendorBridge ERP Boilerplate</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Login to start developing your pages</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Quick autofill panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
              <Shield size={18} /> Testing Presets
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click any preset to autofill credentials for that role. (Hashed password: password123)</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {testAccounts.map(account => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleAutofill(account.email)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  <strong>{account.label}</strong>: <code>{account.email}</code>
                </button>
              ))}
            </div>
          </div>

          {/* Form panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Sign In</h3>
            
            {error && <div style={{ color: '#fb7185', fontSize: '0.8rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary">
                <LogIn size={16} /> {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
