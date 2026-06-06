import React, { useState } from 'react';
import { LogIn, UserPlus, Shield, HelpCircle } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('officer');
  
  // Vendor-specific signup fields
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Hardware');
  const [vendorGstin, setVendorGstin] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAutofill = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const url = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp
      ? {
          name,
          email,
          password,
          role,
          ...(role === 'vendor' && {
            vendorDetails: {
              name: vendorName,
              category: vendorCategory,
              gstin: vendorGstin,
              phone: vendorPhone,
              address: vendorAddress,
              contactName: name,
              email: email
            }
          })
        }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    { label: 'Zenith Rep (Vendor)', email: 'vendor2@vendorbridge.com' },
    { label: 'Matrix Rep (Vendor)', email: 'vendor3@vendorbridge.com' },
    { label: 'System Admin', email: 'admin@vendorbridge.com' }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#070a13',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '950px' }}>
        
        {/* Brand Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'white',
              fontSize: '0.9rem'
            }}>VB</div>
            <span style={{ fontWeight: 800, letterSpacing: '0.5px', fontSize: '1rem' }}>VENDORBRIDGE ERP</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>Simplifying Enterprise Procurement</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem' }}>Centralized Vendor Relationships, RFQs, Approvals & Financial Invoices</p>
        </div>

        {/* Auth Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          
          {/* Left panel - Testing Preset Accounts */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8' }}>
              <Shield size={20} /> Fast-Track Testing Panel
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
              This ERP operates on strict role permissions.
              Use the credentials preset buttons below to automatically load pre-seeded data accounts and verify cross-role workflows instantly. Password is <code>password123</code>.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '0.5rem'
            }}>
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleAutofill(account.email)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: email === account.email ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{account.label}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{account.email}</span>
                </button>
              ))}
            </div>

            <div style={{
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '12px',
              padding: '0.85rem',
              fontSize: '0.75rem',
              color: '#a5b4fc',
              display: 'flex',
              gap: '8px',
              lineHeight: '1.4'
            }}>
              <HelpCircle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Workflow Sequence:</strong> Create an RFQ as <strong>Officer</strong> &rarr; Submit quotations as <strong>Vendors</strong> &rarr; Compare &amp; request approval as <strong>Officer</strong> &rarr; Approve as <strong>Manager</strong> &rarr; Print generated Invoice.
              </div>
            </div>
          </div>

          {/* Right panel - Login/Signup Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isSignUp ? 'Create ERP Account' : 'Secure Login'}</h3>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isSignUp ? 'Have an account? Login' : 'Need account? Sign up'}
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: '#fb7185',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {isSignUp && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignUp && (
                <>
                  <div className="form-group">
                    <label>ERP Core Role</label>
                    <select
                      className="form-control"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="officer">Procurement Officer (Creates RFQs, POs)</option>
                      <option value="approver">Finance Manager / Approver (Approve requests)</option>
                      <option value="vendor">Vendor (Submit price quotes)</option>
                      <option value="admin">System Admin (Configure users &amp; status)</option>
                    </select>
                  </div>

                  {role === 'vendor' && (
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginTop: '0.5rem'
                    }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>Vendor Profile Configuration</h4>
                      
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Company/Vendor Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Acme Tech Solutions"
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          required={role === 'vendor'}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Category</label>
                          <select
                            className="form-control"
                            value={vendorCategory}
                            onChange={(e) => setVendorCategory(e.target.value)}
                          >
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Services">Services</option>
                            <option value="Office">Office Supplies</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>GSTIN (15-chars)</label>
                          <input
                            type="text"
                            className="form-control"
                            maxLength={15}
                            placeholder="e.g. 27AAAAA1111A1Z1"
                            value={vendorGstin}
                            onChange={(e) => setVendorGstin(e.target.value)}
                            required={role === 'vendor'}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Contact Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Contact phone"
                          value={vendorPhone}
                          onChange={(e) => setVendorPhone(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Address</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Vendor office address"
                          value={vendorAddress}
                          onChange={(e) => setVendorAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                {loading ? 'Processing...' : isSignUp ? (
                  <>
                    <UserPlus size={18} /> Sign Up
                  </>
                ) : (
                  <>
                    <LogIn size={18} /> Authenticate
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          VendorBridge Procurement ERP v1.0.0 &copy; 2026. Designed with Node.js, Express, React, and PostgreSQL.
        </div>
      </div>
    </div>
  );
}
