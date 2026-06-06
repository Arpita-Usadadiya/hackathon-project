import React, { useEffect, useState } from 'react';
import { Download, Mail, ShoppingCart, FileSpreadsheet } from 'lucide-react';
import api from '../api';

export default function Documents({ user, showToast }) {
  const [tab, setTab]           = useState('pos');
  const [pos, setPos]           = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [poRes, invRes] = await Promise.all([
        api.get('/documents/pos'),
        api.get('/documents/invoices'),
      ]);
      setPos(poRes.data);
      setInvoices(invRes.data);
    } catch {
      showToast('Failed to load documents', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (id) => {
    try {
      await api.post(`/documents/invoices/${id}/pay`);
      showToast('Invoice marked as paid', 'success');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update', 'danger');
    }
  };

  const emailInvoice = async (id) => {
    try {
      const res = await api.post(`/documents/invoices/${id}/email`);
      showToast(res.data.message || 'Invoice sent', 'success', 'Email Sent');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send email', 'danger');
    }
  };

  const poStatusBadge = (s) => {
    const map = { issued: 'badge-info', acknowledged: 'badge-success' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  const invStatusBadge = (s) => {
    const map = { issued: 'badge-info', paid: 'badge-success', draft: 'badge-neutral' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading documents…</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Financial Documents</h3>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'pos' ? 'active' : ''}`} onClick={() => setTab('pos')}>
          <ShoppingCart size={14} style={{ display: 'inline', marginRight: 6 }} />
          Purchase Orders ({pos.length})
        </button>
        <button className={`tab-btn ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>
          <FileSpreadsheet size={14} style={{ display: 'inline', marginRight: 6 }} />
          Invoices ({invoices.length})
        </button>
      </div>

      {/* Purchase Orders */}
      {tab === 'pos' && (
        pos.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={32} />
            <h4>No purchase orders yet</h4>
            <p>Approve a quotation to generate your first PO</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Amount</th>
                  <th>Tax</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>{po.po_number}</td>
                    <td>₹{Number(po.total_amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>₹{Number(po.tax_amount).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(po.grand_total).toLocaleString()}</td>
                    <td>{poStatusBadge(po.status)}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(po.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <a
                        href={`${import.meta.env.VITE_API_URL}/api/pdf/po/${po.id}`}
                        target="_blank" rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <Download size={12} /> PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Invoices */}
      {tab === 'invoices' && (
        invoices.length === 0 ? (
          <div className="empty-state">
            <FileSpreadsheet size={32} />
            <h4>No invoices yet</h4>
            <p>Invoices are generated automatically when a PO is created</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Amount</th>
                  <th>Tax</th>
                  <th>Grand Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>{inv.invoice_number}</td>
                    <td>₹{Number(inv.total_amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>₹{Number(inv.tax_amount).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(inv.grand_total).toLocaleString()}</td>
                    <td>{invStatusBadge(inv.status)}</td>
                    <td style={{ color: inv.status !== 'paid' && new Date(inv.due_date) < new Date() ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/api/pdf/invoice/${inv.id}`}
                          target="_blank" rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ textDecoration: 'none' }}
                        >
                          <Download size={12} /> PDF
                        </a>
                        <button className="btn btn-secondary btn-sm" onClick={() => emailInvoice(inv.id)}>
                          <Mail size={12} /> Email
                        </button>
                        {inv.status !== 'paid' && (user?.role === 'admin' || user?.role === 'officer' || user?.role === 'approver') && (
                          <button className="btn btn-success btn-sm" onClick={() => markPaid(inv.id)}>
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}