import React, { useEffect, useState } from 'react';
import { FileText, Users, CheckSquare, ShoppingCart, FileSpreadsheet, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Dashboard({ user, setView, showToast }) {
  const [data, setData] = useState({
    rfqs: [], vendors: [], approvals: [], pos: [], invoices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const requests = [
        api.get('/rfqs'),
        api.get('/vendors'),
        api.get('/documents/pos'),
        api.get('/documents/invoices'),
      ];
      if (user.role === 'approver' || user.role === 'admin') {
        requests.push(api.get('/approvals'));
      }
      const results = await Promise.all(requests);
      setData({
        rfqs:      results[0].data,
        vendors:   results[1].data,
        pos:       results[2].data,
        invoices:  results[3].data,
        approvals: results[4]?.data ?? [],
      });
    } catch (err) {
      showToast('Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      published: 'badge-success',
      draft:     'badge-neutral',
      closed:    'badge-warning',
      active:    'badge-success',
      suspended: 'badge-danger',
      pending:   'badge-warning',
    };
    return <span className={`badge ${map[status] ?? 'badge-neutral'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" /> Loading dashboard…
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active RFQs',
      value: data.rfqs.filter(r => r.status === 'published').length,
      icon: <FileText size={17} />, color: 'blue',
      action: () => setView('rfqs'), roles: ['officer','admin','approver']
    },
    {
      label: 'Registered Vendors',
      value: data.vendors.length,
      icon: <Users size={17} />, color: 'green',
      action: () => setView('vendors'), roles: ['admin','officer']
    },
    {
      label: 'Pending Approvals',
      value: data.approvals.length,
      icon: <CheckSquare size={17} />, color: 'orange',
      action: () => setView('approvals'), roles: ['approver','admin']
    },
    {
      label: 'Purchase Orders',
      value: data.pos.length,
      icon: <ShoppingCart size={17} />, color: 'purple',
      action: () => setView('documents'), roles: ['admin','officer','approver','vendor']
    },
    {
      label: 'Invoices Issued',
      value: data.invoices.filter(i => i.status !== 'paid').length,
      icon: <FileSpreadsheet size={17} />, color: 'rose',
      action: () => setView('documents'), roles: ['admin','officer','approver','vendor']
    },
    {
      label: 'Total Vendors',
      value: data.vendors.filter(v => v.status === 'active').length,
      icon: <TrendingUp size={17} />, color: 'teal',
      action: () => setView('vendors'), roles: ['admin','officer']
    },
  ].filter(c => c.roles.includes(user.role));

  return (
    <>
      {/* Stat Cards */}
      <div className="dashboard-grid">
        {statCards.map(card => (
          <div
            key={card.label}
            className="stat-card"
            onClick={card.action}
            style={{ cursor: 'pointer' }}
          >
            <div className={`stat-card-icon ${card.color}`}>{card.icon}</div>
            <div>
              <h4>{card.label}</h4>
              <h1>{card.value}</h1>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {(user.role === 'officer' || user.role === 'admin') && (
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setView('rfqs')}>
              <FileText size={14} /> New RFQ
            </button>
            <button className="btn btn-secondary" onClick={() => setView('vendors')}>
              <Users size={14} /> Manage Vendors
            </button>
            <button className="btn btn-secondary" onClick={() => setView('documents')}>
              <ShoppingCart size={14} /> View Orders
            </button>
            {user.role === 'admin' && (
              <button className="btn btn-secondary" onClick={() => setView('analytics')}>
                <TrendingUp size={14} /> Analytics
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent RFQs */}
      <div className="card">
        <div className="card-header">
          <h3>Recent RFQs</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('rfqs')}>
            View all <ArrowRight size={13} />
          </button>
        </div>
        {data.rfqs.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} />
            <h4>No RFQs yet</h4>
            <p>Create your first RFQ to start procurement</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rfqs.slice(0, 6).map(rfq => (
                  <tr key={rfq.id}>
                    <td style={{ fontWeight: 500 }}>{rfq.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{rfq.category}</td>
                    <td>{rfq.quantity.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{rfq.deadline?.split('T')[0]}</td>
                    <td>{statusBadge(rfq.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      {(user.role === 'approver' || user.role === 'admin') && (
        <div className="card">
          <div className="card-header">
            <h3>Pending Approvals</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('approvals')}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          {data.approvals.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={32} />
              <h4>No pending approvals</h4>
              <p>All quotations have been reviewed</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr><th>RFQ</th><th>Vendor</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {data.approvals.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.rfq_title}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.vendor_name}</td>
                      <td>₹{Number(item.total_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}