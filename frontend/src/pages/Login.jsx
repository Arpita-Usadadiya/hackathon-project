import React, { useState } from 'react';
import { LogIn, Shield, Eye, EyeOff, UserPlus, ArrowLeft, Building2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'officer',  label: 'Procurement Officer', desc: 'Create RFQs, manage vendors, generate POs' },
  { value: 'approver', label: 'Finance Manager',      desc: 'Approve or reject procurement requests' },
  { value: 'vendor',   label: 'Vendor / Supplier',    desc: 'Submit quotations, track purchase orders' },
];

const ROLE_COLORS = {
  officer: '#2563eb', approver: '#059669', vendor: '#d97706', admin: '#7c3aed'
};

const DEMO_ACCOUNTS = [
  { label: 'Procurement Officer', email: 'officer@vendorbridge.com', role: 'officer' },
  { label: 'Finance Manager',     email: 'manager@vendorbridge.com', role: 'approver' },
  { label: 'Apex Rep (Vendor)',   email: 'vendor1@vendorbridge.com', role: 'vendor' },
  { label: 'System Admin',        email: 'admin@vendorbridge.com',   role: 'admin' },
];

/* ─── Shared shell ─────────────────────────────── */
function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#f4f6f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#4f46e5', color: 'white', width: 44, height: 44,
            borderRadius: 11, fontSize: 16, fontWeight: 800, marginBottom: 12
          }}>VB</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            VendorBridge
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 3 }}>
            Procurement & Vendor Management
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Error banner ─────────────────────────────── */
function ErrorBanner({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
      padding: '10px 12px', marginBottom: 14, fontSize: '0.8rem', color: '#b91c1c'
    }}>{msg}</div>
  );
}

/* ─── Card wrapper ─────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
      padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', ...style
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  SIGN-IN                                        */
/* ═══════════════════════════════════════════════ */
function SignIn({ onLoginSuccess, onGoSignUp }) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Demo accounts */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Shield size={15} color="#4f46e5" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Demo Accounts</span>
          </div>
          <p style={{ fontSize: '0.77rem', color: '#94a3b8', marginBottom: 14 }}>
            Click to autofill. Password: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>password123</code>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email} type="button"
                onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                style={{
                  background: email === acc.email ? '#eef2ff' : '#f8fafc',
                  border: `1px solid ${email === acc.email ? '#a5b4fc' : '#e2e8f0'}`,
                  borderRadius: 8, padding: '9px 12px', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: ROLE_COLORS[acc.role], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{acc.label}</div>
                  <div style={{ fontSize: '0.71rem', color: '#94a3b8', marginTop: 1 }}>{acc.email}</div>
                </div>
                <div style={{ fontSize: '0.64rem', fontWeight: 700, color: ROLE_COLORS[acc.role], textTransform: 'uppercase' }}>
                  {acc.role}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Sign-in form */}
        <Card>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 18 }}>
            Sign in to your account
          </h2>
          <ErrorBanner msg={error} />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" className="form-control" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} className="form-control"
                  placeholder="••••••••" style={{ paddingRight: 38 }}
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex'
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8,
              padding: '10px', fontWeight: 600, fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 2, transition: 'background 0.15s',
            }}>
              <LogIn size={14} /> {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>New to VendorBridge? </span>
            <button type="button" onClick={onGoSignUp} style={{
              background: 'none', border: 'none', color: '#4f46e5',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0,
            }}>
              Create an account
            </button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════ */
/*  SIGN-UP                                        */
/* ═══════════════════════════════════════════════ */
function SignUp({ onLoginSuccess, onGoSignIn }) {
  const [step, setStep]       = useState(1); // 1 = role pick, 2 = form
  const [role, setRole]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    // vendor-only
    category: '', gstin: '', contact_name: '', phone: '', address: '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (role === 'vendor' && form.gstin.length !== 15) {
      setError('GSTIN must be exactly 15 characters');
      return;
    }

    setLoading(true);
    try {
      const body = { name: form.name, email: form.email, password: form.password, role };
      if (role === 'vendor') {
        Object.assign(body, {
          category: form.category, gstin: form.gstin,
          contact_name: form.contact_name, phone: form.phone, address: form.address,
        });
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto sign-in after signup
      const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error('Account created — please sign in manually');
      onLoginSuccess(loginData.token, loginData.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Step 1 — Role picker */
  if (step === 1) {
    return (
      <Shell>
        <Card style={{ maxWidth: 520, margin: '0 auto' }}>
          <button type="button" onClick={onGoSignIn} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 20, padding: 0,
          }}>
            <ArrowLeft size={14} /> Back to sign in
          </button>

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Create your account
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 22 }}>
            Choose your role to get started
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ROLE_OPTIONS.map(r => (
              <button
                key={r.value} type="button"
                onClick={() => { setRole(r.value); setStep(2); }}
                style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '14px 16px', textAlign: 'left',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: ROLE_COLORS[r.value] + '18',
                  color: ROLE_COLORS[r.value],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {r.value === 'vendor' ? <Building2 size={17} /> : <UserPlus size={17} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{r.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </Shell>
    );
  }

  /* Step 2 — Details form */
  const selectedRole = ROLE_OPTIONS.find(r => r.value === role);

  return (
    <Shell>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <button type="button" onClick={() => { setStep(1); setError(''); }} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18, padding: 0,
        }}>
          <ArrowLeft size={14} /> Change role
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            background: ROLE_COLORS[role] + '18', color: ROLE_COLORS[role],
            width: 36, height: 36, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {role === 'vendor' ? <Building2 size={16} /> : <UserPlus size={16} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Register as {selectedRole?.label}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedRole?.desc}</p>
          </div>
        </div>

        <ErrorBanner msg={error} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {/* Common fields */}
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-control" placeholder="John Smith"
                value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" className="form-control" placeholder="you@company.com"
                value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} className="form-control"
                  placeholder="Min. 6 characters" style={{ paddingRight: 38 }}
                  value={form.password} onChange={set('password')} required minLength={6}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex',
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type={showPw ? 'text' : 'password'} className="form-control"
                placeholder="Re-enter password"
                value={form.confirmPassword} onChange={set('confirmPassword')} required
              />
            </div>
          </div>

          {/* Vendor-only fields */}
          {role === 'vendor' && (
            <>
              <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Business Details
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label>Business Category *</label>
                  <input className="form-control" placeholder="e.g. Hardware, IT Services"
                    value={form.category} onChange={set('category')} required />
                </div>
                <div className="form-group">
                  <label>GSTIN * (15 chars)</label>
                  <input className="form-control" placeholder="27AAAAA0000A1Z5"
                    maxLength={15} value={form.gstin} onChange={set('gstin')} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input className="form-control" placeholder="Primary contact name"
                    value={form.contact_name} onChange={set('contact_name')} required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input className="form-control" placeholder="10-digit number"
                    value={form.phone} onChange={set('phone')} required />
                </div>
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea className="form-control" rows={2} placeholder="Full registered address"
                  value={form.address} onChange={set('address')} />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={{
            background: '#4f46e5', color: 'white', border: 'none', borderRadius: 8,
            padding: '10px', fontWeight: 600, fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4,
          }}>
            <UserPlus size={14} /> {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Already have an account? </span>
          <button type="button" onClick={onGoSignIn} style={{
            background: 'none', border: 'none', color: '#4f46e5',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0,
          }}>
            Sign in
          </button>
        </div>
      </Card>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════ */
/*  ROOT EXPORT — switches between sign-in/sign-up */
/* ═══════════════════════════════════════════════ */
export default function Login({ onLoginSuccess }) {
  const [page, setPage] = useState('signin');

  if (page === 'signup') {
    return <SignUp onLoginSuccess={onLoginSuccess} onGoSignIn={() => setPage('signin')} />;
  }
  return <SignIn onLoginSuccess={onLoginSuccess} onGoSignUp={() => setPage('signup')} />;
}
