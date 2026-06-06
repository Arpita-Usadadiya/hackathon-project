import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import api from '../api';

const BAR_COLORS = ['', 'green', 'purple', 'orange', 'rose', 'teal'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.get('/logs/analytics');
      setAnalytics(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!analytics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Active RFQs', analytics.summary.activeRfqs],
      ['Pending Approvals', analytics.summary.pendingApprovals],
      ['Active Vendors', analytics.summary.activeVendors],
      ['Total Spend', analytics.summary.totalSpend],
      ['Cost Savings', analytics.summary.costSavings],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'vendorbridge-analytics.csv',
    });
    a.click();
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading analytics…</div>;

  const summary = analytics?.summary ?? {};
  const categorySpend = analytics?.categorySpend ?? [];
  const monthlySpend  = analytics?.monthlySpend  ?? [];
  const vendorPerf    = analytics?.vendorPerformance ?? [];

  const maxCategorySpend = Math.max(...categorySpend.map(c => Number(c.amount)), 1);
  const maxMonthlySpend  = Math.max(...monthlySpend.map(m => Number(m.amount)), 1);

  return (
    <>
      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>Reports & Analytics</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>Procurement overview and spending insights</p>
        </div>
        <button className="btn btn-secondary" onClick={exportCSV}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="dashboard-grid">
        {[
          { label: 'Active RFQs',        value: summary.activeRfqs      ?? 0, color: 'blue'   },
          { label: 'Pending Approvals',  value: summary.pendingApprovals ?? 0, color: 'orange' },
          { label: 'Active Vendors',     value: summary.activeVendors    ?? 0, color: 'green'  },
          { label: 'Total Spend',        value: `₹${Number(summary.totalSpend  || 0).toLocaleString()}`, color: 'purple' },
          { label: 'Estimated Savings',  value: `₹${Number(summary.costSavings || 0).toLocaleString()}`, color: 'teal'   },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <h4>{s.label}</h4>
            <h1 style={{ fontSize: typeof s.value === 'string' ? '1.3rem' : '1.75rem' }}>{s.value}</h1>
          </div>
        ))}
      </div>

      {/* Category Spend */}
      <div className="card">
        <div className="card-header"><h3>Spend by Category</h3></div>
        {categorySpend.length === 0 ? (
          <div className="empty-state"><h4>No spend data yet</h4></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categorySpend.map((item, i) => {
              const pct = Math.round((Number(item.amount) / maxCategorySpend) * 100);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 500 }}>{item.category}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>₹{Number(item.amount).toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 10 }}>
                    <div className={`progress-bar-fill ${BAR_COLORS[i % BAR_COLORS.length]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Spend */}
      <div className="card">
        <div className="card-header"><h3>Monthly Spending Trend</h3></div>
        {monthlySpend.length === 0 ? (
          <div className="empty-state"><h4>No monthly data yet</h4></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monthlySpend.map((item, i) => {
              const pct = Math.round((Number(item.amount) / maxMonthlySpend) * 100);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minWidth: 80 }}>{item.month}</span>
                  <div className="progress-bar-track" style={{ flex: 1, height: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="progress-label">₹{Number(item.amount).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vendor Performance */}
      <div className="card">
        <div className="card-header"><h3>Vendor Performance</h3></div>
        {vendorPerf.length === 0 ? (
          <div className="empty-state"><h4>No vendor data yet</h4></div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendor</th>
                  <th>Rating</th>
                  <th>Score</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {vendorPerf.map((v, i) => {
                  const rating = parseFloat(v.rating) || 0;
                  const ratingPct = (rating / 5) * 100;
                  const ratingColor = rating >= 4 ? 'green' : rating >= 3 ? 'orange' : 'rose';
                  return (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{v.name}</td>
                      <td>
                        <span className="stars">
                          {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
                        </span>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar-track" style={{ flex: 1, height: 7 }}>
                            <div className={`progress-bar-fill ${ratingColor}`} style={{ width: `${ratingPct}%` }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 28 }}>{rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.orders}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}