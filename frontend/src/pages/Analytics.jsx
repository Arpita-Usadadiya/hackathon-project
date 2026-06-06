import React from 'react';

export default function Analytics() {
  // TODO: Fetch analytics reports metrics from GET /api/logs/analytics.
  // Render SVG charts for category distributions and monthly spending trends.
  // Add a trigger button for CSV reports exporting.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 800 }}>Reports &amp; Procurement Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Access monthly spending aggregates, cost savings, and vendor performance audits</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Implement CSV report export!')}>
          Export CSV Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Implement SVG Monthly Spending Trend Chart.</p>
        </div>
        
        <div className="card" style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Implement Category Allocations Chart.</p>
        </div>
      </div>
    </div>
  );
}
