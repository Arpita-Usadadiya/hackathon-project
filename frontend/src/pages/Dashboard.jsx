import React from 'react';

export default function Dashboard({ user, setView }) {
  // TODO: Fetch analytics summaries from GET /api/logs/analytics and display stats card metrics.
  // Add quick links for role-specific operations.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h2 style={{ fontWeight: 800 }}>Dashboard Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Welcome, {user.name} ({user.role}). Customize this view to render KPI statistics cards, pending notifications counters, and activity metrics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h4 style={{ fontWeight: 700 }}>Active RFQs</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px' }}>0</p>
        </div>
        <div className="card">
          <h4 style={{ fontWeight: 700 }}>Pending Approvals</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px' }}>0</p>
        </div>
        <div className="card">
          <h4 style={{ fontWeight: 700 }}>Issued POs</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '8px' }}>₹0.00</p>
        </div>
      </div>
    </div>
  );
}
