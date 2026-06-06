import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, Users, CheckSquare, Plus, ArrowRight, Activity, Award } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function Dashboard({ user, setView }) {
  const [analytics, setAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch analytics
        const analyticsRes = await fetch('/api/logs/analytics', { headers });
        if (!analyticsRes.ok) throw new Error('Failed to load dashboard metrics');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);

        // Fetch logs
        const logsRes = await fetch('/api/logs', { headers });
        if (!logsRes.ok) throw new Error('Failed to load activity logs');
        const logsData = await logsRes.json();
        setRecentLogs(logsData.slice(0, 5)); // show latest 5
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', margin: '2rem 0' }}>
        <p style={{ color: '#fb7185' }}>Error loading dashboard: {error}</p>
      </div>
    );
  }

  const { summary } = analytics;
  const savingPercentage = summary.totalSpend > 0 
    ? Math.round((summary.costSavings / (summary.totalSpend + summary.costSavings)) * 100) 
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.03))',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back, {user.name}!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.95rem' }}>
            You are logged in as a <strong style={{ color: 'var(--primary)' }}>{user.role.toUpperCase()}</strong>. Here is your procurement status.
          </p>
        </div>
        <div className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
          ERP Version 1.0
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Spend Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Purchase Orders</span>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{formatCurrency(summary.totalSpend)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved and issued POs</span>
        </div>

        {/* Cost Savings Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cost Savings Secured</span>
            <Award size={18} color="var(--secondary)" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>{formatCurrency(summary.costSavings)}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--secondary)' }}>{savingPercentage}% savings</strong> compared to highest bids
          </span>
        </div>

        {/* Active RFQs */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active RFQs</span>
            <FileText size={18} color="var(--accent-blue)" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.activeRfqs}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Published and open for quotes</span>
        </div>

        {/* Pending Approvals */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pending Approvals</span>
            <CheckSquare size={18} color="var(--warning)" />
          </div>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: summary.pendingApprovals > 0 ? 'var(--warning)' : 'var(--text-primary)'
          }}>{summary.pendingApprovals}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quotes awaiting manager approval</span>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Activity Logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.5fr',
        gap: '2rem'
      }}>
        
        {/* Left Column: Quick Actions & Savings Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Actions Card */}
          <div className="card">
            <h3 className="card-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              
              {user.role === 'officer' && (
                <>
                  <button className="btn btn-primary" onClick={() => setView('rfqs')} style={{ justifyContent: 'space-between' }}>
                    <span>Create new RFQ</span>
                    <Plus size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => setView('compare')} style={{ justifyContent: 'space-between' }}>
                    <span>Compare Quotations</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}

              {user.role === 'vendor' && (
                <>
                  <button className="btn btn-primary" onClick={() => setView('rfqs')} style={{ justifyContent: 'space-between' }}>
                    <span>Submit Price Quote</span>
                    <ArrowRight size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => setView('documents')} style={{ justifyContent: 'space-between' }}>
                    <span>View Purchase Orders</span>
                    <ArrowRight size={16} />
                  </button>
                </>
              )}

              {user.role === 'approver' && (
                <button className="btn btn-primary" onClick={() => setView('approvals')} style={{ justifyContent: 'space-between' }}>
                  <span>Review Pending Approvals</span>
                  <CheckSquare size={16} />
                </button>
              )}

              {user.role === 'admin' && (
                <>
                  <button className="btn btn-primary" onClick={() => setView('vendors')} style={{ justifyContent: 'space-between' }}>
                    <span>Manage Vendors Directory</span>
                    <Users size={16} />
                  </button>
                  <button className="btn btn-secondary" onClick={() => setView('logs')} style={{ justifyContent: 'space-between' }}>
                    <span>Access System Logs</span>
                    <Activity size={16} />
                  </button>
                </>
              )}

              <button className="btn btn-secondary" onClick={() => setView('analytics')} style={{ justifyContent: 'space-between' }}>
                <span>View Reports &amp; Spending Trends</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Cost Savings visual gauge */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--secondary)"
                  strokeDasharray={`${savingPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--secondary)'
              }}>
                {savingPercentage}%
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem' }}>Procurement Efficiency</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px', lineHeight: '1.3' }}>
                Your team is saving {savingPercentage}% on closed procurement files by routing tenders via side-by-side bid negotiations.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Audit Trail */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="card-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: 0 }}>
            <Activity size={18} color="var(--primary)" /> Recent Procurement Activity Logs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                No recent activity logs recorded yet.
              </p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{log.action}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(log.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.details}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)' }}>{log.user_name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>•</span>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>{log.user_role}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setView('logs')}
            style={{ marginTop: 'auto', alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            View Full Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
