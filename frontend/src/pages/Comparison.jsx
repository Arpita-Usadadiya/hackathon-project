import React, { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, XCircle, X, Trophy } from 'lucide-react';

export default function Comparison({ rfqId, setView, setSelectedRfqId, showToast }) {
  const [bids, setBids]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirmModal, setConfirmModal] = useState(null); // { bid, action }
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (rfqId) fetchBids();
    else setLoading(false);
  }, [rfqId]);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quotations/rfq/${rfqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBids(data);
    } catch (err) {
      showToast(err.message || 'Failed to load quotations', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async () => {
    const { bid, action } = confirmModal;
    setProcessing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/approvals/${bid.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (action === 'approve') {
        showToast(`PO ${data.po?.po_number} generated`, 'success', 'Quotation Approved');
        setView('documents');
      } else {
        showToast('Quotation rejected', 'warning');
        fetchBids();
      }
      setConfirmModal(null);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (s) => {
    const map = { submitted: 'badge-info', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  if (!rfqId) {
    return (
      <div className="card">
        <div className="empty-state">
          <BarChart2 size={32} />
          <h4>No RFQ selected</h4>
          <p>Go to RFQs & Tenders and click "Compare Bids" on an open RFQ</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /> Loading bids…</div>;

  const lowestPrice = bids.length > 0 ? Math.min(...bids.map(b => Number(b.total_price))) : 0;
  const maxPrice    = bids.length > 0 ? Math.max(...bids.map(b => Number(b.total_price))) : 1;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Bid Comparison — RFQ #{rfqId}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {bids.length} quotation{bids.length !== 1 ? 's' : ''} received · sorted by price
            </p>
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="empty-state">
            <BarChart2 size={32} />
            <h4>No quotations yet</h4>
            <p>Vendors haven't submitted bids for this RFQ</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Price Bar</th>
                  <th>Delivery</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, idx) => {
                  const isLowest  = Number(bid.total_price) === lowestPrice;
                  const barWidth  = `${(Number(bid.total_price) / maxPrice) * 100}%`;
                  const rating    = parseFloat(bid.vendor_rating) || 0;
                  return (
                    <tr key={bid.id} className={isLowest && bid.status === 'submitted' ? 'row-highlight-green' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {isLowest && bid.status === 'submitted' && <Trophy size={14} style={{ color: '#f59e0b' }} />}
                          <div>
                            <div style={{ fontWeight: 500 }}>{bid.vendor_name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{bid.vendor_category}</div>
                          </div>
                        </div>
                      </td>
                      <td>₹{Number(bid.unit_price).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(bid.total_price).toLocaleString()}</td>
                      <td style={{ minWidth: 120 }}>
                        <div className="progress-bar-track">
                          <div
                            className={`progress-bar-fill ${isLowest ? 'green' : ''}`}
                            style={{ width: barWidth }}
                          />
                        </div>
                      </td>
                      <td>{bid.delivery_days} days</td>
                      <td>
                        <span className="stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
                      </td>
                      <td>{statusBadge(bid.status)}</td>
                      <td>
                        {bid.status === 'submitted' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => setConfirmModal({ bid, action: 'approve' })}
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)', borderColor: '#fca5a5' }}
                              onClick={() => setConfirmModal({ bid, action: 'reject' })}
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                        {bid.status === 'approved' && <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.82rem' }}>✓ Approved</span>}
                        {bid.status === 'rejected' && <span style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>Rejected</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setConfirmModal(null)}>
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>{confirmModal.action === 'approve' ? 'Approve & Generate PO' : 'Reject Quotation'}</h3>
              <button className="modal-close-btn" onClick={() => setConfirmModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 600 }}>{confirmModal.bid.vendor_name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Total: ₹{Number(confirmModal.bid.total_price).toLocaleString()} · {confirmModal.bid.delivery_days} days
                </div>
              </div>
              {confirmModal.action === 'approve' && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  This will automatically generate a <strong>Purchase Order</strong> and <strong>Invoice</strong>. Are you sure?
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button
                className={`btn ${confirmModal.action === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={performAction} disabled={processing}
              >
                {processing ? 'Processing…' : confirmModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}