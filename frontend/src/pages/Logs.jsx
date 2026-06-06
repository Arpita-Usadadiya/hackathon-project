import React, { useState, useEffect } from 'react';
import { Activity, Clock, Search, Filter } from 'lucide-react';
import { formatDate } from '../utils';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    
    const matchesAction = actionFilter ? log.action.includes(actionFilter) : true;

    return matchesSearch && matchesAction;
  });

  // Extract unique actions for filters
  const uniqueActions = [...new Set(logs.map(log => {
    // Group actions to general categories
    if (log.action.includes('Login')) return 'Login';
    if (log.action.includes('Signup')) return 'Signup';
    if (log.action.includes('RFQ')) return 'RFQ';
    if (log.action.includes('Quotation')) return 'Quotation';
    if (log.action.includes('Vendor')) return 'Vendor';
    if (log.action.includes('Invoice') || log.action.includes('PO') || log.action.includes('Payment')) return 'Finance';
    return log.action;
  }))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Audit Logs &amp; Notifications</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review chronological logging of all procurement updates, vendor proposals, and approvals</p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', padding: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Filter size={16} /> Filters:
        </div>
        
        {/* Search */}
        <div style={{ position: 'relative', flexGrow: 1, minWidth: '200px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search logs by action, actor, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>

        {/* Action Category Filter */}
        <select
          className="form-control"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">All Categories</option>
          <option value="Login">Authentication Logins</option>
          <option value="RFQ">RFQ Procedures</option>
          <option value="Quotation">Vendor Quotations</option>
          <option value="Vendor">Vendor Registrations</option>
          <option value="Approve">Manager Approvals</option>
          <option value="Invoice">Invoicing &amp; POs</option>
        </select>
      </div>

      {/* Timeline Panel */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading system logs...</p>
      ) : (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredLogs.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              No audit logs match your search.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)', gap: '1.5rem' }}>
              {filteredLogs.map((log) => (
                <div key={log.id} style={{ position: 'relative' }}>
                  
                  {/* Bullet Node */}
                  <div style={{
                    position: 'absolute',
                    left: '-2.4rem',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: log.action.includes('Approve') ? 'var(--secondary)' : log.action.includes('Reject') ? 'var(--danger)' : 'var(--primary)',
                    border: '3px solid var(--bg-primary)',
                    boxShadow: '0 0 0 1px var(--border-color)'
                  }}></div>

                  {/* Log Card body */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{log.action}</span>
                        <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>{log.user_role}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} &bull; {formatDate(log.timestamp)}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '4px' }}>
                      {log.details}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Triggered by: <strong style={{ color: 'var(--primary)' }}>{log.user_name}</strong>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
