import React from 'react';

export default function Logs() {
  // TODO: Fetch system logs list from GET /api/logs.
  // Add a chronological audit trail timeline.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontWeight: 800 }}>Audit Logs &amp; Notifications</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review chronological logging of all procurement updates, vendor proposals, and approvals</p>
      </div>

      <div className="card">
        <h3 className="card-title">Procurement Activity Timeline</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Chronological events logs trail. Implement database logs querying.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontWeight: 700, color: 'white' }}>System Initialization</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Database tables created and default entities seeded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
