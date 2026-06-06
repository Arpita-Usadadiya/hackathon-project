import React, { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';
import api from '../api';

export default function Approvals({ user, showToast }) {
  const [quotes, setQuotes]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actionModal, setActionModal] = useState(null); // { quote, action }
  const [remarks, setRemarks]   = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadQuotes(); }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/approvals');
      setQuotes(res.data);
    } catch {
      showToast('Failed to load approvals', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = async () => {
    const { quote, action } = actionModal;
    setProcessing(true);
    try {
      const res = await api.post(`/approvals/${quote.id}/action`, { action, remarks });
      if (action === 'approve') {
        showToast(`PO generated: ${res.data?.po?.po_number ?? ''}`, 'success', 'Quotation Approved');
      } else {
        showToast('Quotation rejected', 'warning', 'Rejected');
      }
      setActionModal(null);
      setRemarks('');
      loadQuotes();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Action failed', 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (s) => {
    const map = { submitted: 'badge-info', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  if (loading) {
    return <div className="loading-wrap"><div className="spinner" /> Loading approvals…</div>;
  }

  const pending  = quotes.filter(q => q.status === 'submitted');
  const reviewed = quotes.filter(q => q.status !== 'submitted');

  return (
    <>
      {/* Pending */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Pending Approvals</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {pending.length} quotation{pending.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={32} style={{ color: '#10b981' }} />
            <h4>All caught up!</h4>
            <p>No quotations pending review</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>RFQ</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(q => (
                  <tr key={q.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{q.vendor_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{q.vendor_category}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{q.rfq_title}</td>
                    <td>₹{Number(q.unit_price).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ₹{Number(q.total_price).toLocaleString()}
                    </td>
                    <td>{q.delivery_days} days</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setActionModal({ quote: q, action: 'approve' })}
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setActionModal({ quote: q, action: 'reject' })}
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Reviewed Quotations</h3>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>RFQ</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map(q => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 500 }}>{q.vendor_name}</td>
                    <td>{q.rfq_title}</td>
                    <td>₹{Number(q.total_price).toLocaleString()}</td>
                    <td>{statusBadge(q.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setActionModal(null)}>
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h3>{actionModal.action === 'approve' ? 'Approve Quotation' : 'Reject Quotation'}</h3>
              <button className="modal-close-btn" onClick={() => { setActionModal(null); setRemarks(''); }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', marginBottom: 4 }}>
                <div style={{ fontWeight: 600 }}>{actionModal.quote.vendor_name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {actionModal.quote.rfq_title} · ₹{Number(actionModal.quote.total_price).toLocaleString()}
                </div>
              </div>

              {actionModal.action === 'approve' && (
                <div style={{ display: 'flex', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', fontSize: '0.82rem', color: '#15803d' }}>
                  <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Approving will generate a <strong>Purchase Order</strong> and <strong>Invoice</strong> automatically.</span>
                </div>
              )}

              {actionModal.action === 'reject' && (
                <div style={{ display: 'flex', gap: 8, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 12px', fontSize: '0.82rem', color: '#b91c1c' }}>
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>This action cannot be undone.</span>
                </div>
              )}

              <div className="form-group">
                <label>Remarks (optional)</label>
                <textarea className="form-control" rows={3}
                  placeholder={actionModal.action === 'approve' ? 'Add any approval notes…' : 'Reason for rejection…'}
                  value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setActionModal(null); setRemarks(''); }}>
                Cancel
              </button>
              <button
                className={`btn ${actionModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={confirmAction} disabled={processing}
              >
                {processing ? 'Processing…' : actionModal.action === 'approve' ? 'Approve & Generate PO' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}