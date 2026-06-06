import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import api from '../api';

const actionColors = {
  'Submit Quotation': 'blue',
  'Update Quotation': 'blue',
  'Edit Quotation':   'blue',
  'Approve Quotation':'green',
  'Reject Quotation': 'rose',
  'User Registered':  'purple',
  'RFQ Created':      'teal',
  'PO Generated':     'orange',
};

const actionDot = (action) => {
  const color = actionColors[action];
  const styles = {
    blue:   { bg: '#dbeafe', color: '#2563eb' },
    green:  { bg: '#dcfce7', color: '#16a34a' },
    rose:   { bg: '#ffe4e6', color: '#e11d48' },
    purple: { bg: '#f3e8ff', color: '#9333ea' },
    teal:   { bg: '#ccfbf1', color: '#0d9488' },
    orange: { bg: '#ffedd5', color: '#ea580c' },
  };
  const s = styles[color] || { bg: '#f1f5f9', color: '#64748b' };
  return <div className="timeline-dot" style={{ background: s.bg, color: s.color }}><Activity size={14} /></div>;
};

export default function Logs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading logs…</div>;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Activity Log</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {logs.length} events recorded
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <Activity size={32} />
          <h4>No activity yet</h4>
          <p>System events will appear here</p>
        </div>
      ) : (
        <div className="timeline">
          {logs.map(log => (
            <div key={log.id} className="timeline-item">
              <div className="timeline-left">
                {actionDot(log.action)}
                <div className="timeline-line" />
              </div>
              <div className="timeline-content">
                <h4>{log.action}</h4>
                <p>{log.details}</p>
                <div className="timeline-meta">
                  <span>{log.user_name}</span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{log.user_role}</span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}