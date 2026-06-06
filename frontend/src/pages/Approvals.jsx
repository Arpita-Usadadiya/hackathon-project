import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function Approvals({ user }) {
  const [approvals, setApprovals] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApprovals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleAction = async (quoteId, action) => {
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    const remarkText = remarks[quoteId] || '';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/approvals/${quoteId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, remarks: remarkText })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process approval action');
      }

      if (action === 'approve') {
        setSuccessMessage(`Quotation approved! Generated Purchase Order (${data.poNumber}) and Invoice (${data.invoiceNumber}) successfully.`);
      } else {
        setSuccessMessage('Quotation has been rejected and sent back to the bidding pool.');
      }

      // Clear remarks for this quotation
      const newRemarks = { ...remarks };
      delete newRemarks[quoteId];
      setRemarks(newRemarks);

      // Refresh list
      fetchPendingApprovals();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemarkChange = (quoteId, value) => {
    setRemarks({
      ...remarks,
      [quoteId]: value
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading approvals workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Procurement Approvals Queue</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review pending quotations submitted by procurement officers and authorize purchases</p>
      </div>

      {successMessage && (
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem' }}>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)', color: '#fb7185', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Approvals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {approvals.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 1rem' }} />
            No pending approvals found in your queue.
          </div>
        ) : (
          approvals.map((app) => (
            <div key={app.id} className="card" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', borderLeft: '4px solid var(--warning)' }}>
              
              {/* Left Column: Bid and RFQ particulars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span className="badge badge-warning" style={{ marginBottom: '6px' }}>Pending Approval</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{app.rfq_title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Target quantity: {app.rfq_quantity} units &bull; Bidder: <strong>{app.vendor_name} ({parseFloat(app.vendor_rating).toFixed(1)} ★)</strong>
                  </p>
                </div>

                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> Bid unit price:</span>
                    <span style={{ fontWeight: 600, color: 'white' }}>{formatCurrency(app.unit_price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                    <span style={{ fontWeight: 600, color: 'white' }}>&times; {app.rfq_quantity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, paddingTop: '4px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>Total bid price:</span>
                    <span style={{ color: 'var(--secondary)' }}>{formatCurrency(app.total_price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '4px', borderTop: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Delivery timeline:</span>
                    <span style={{ fontWeight: 700, color: 'white' }}>{app.delivery_days} calendar days</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>VENDOR NOTES</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{app.notes || 'No notes provided'}"
                  </p>
                </div>
              </div>

              {/* Right Column: Approval action form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '2rem' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={14} /> Approver remarks</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Write feedback, approval reasoning, budget notes..."
                    value={remarks[app.id] || ''}
                    onChange={(e) => handleRemarkChange(app.id, e.target.value)}
                    style={{ height: '100%', minHeight: '100px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    disabled={submitting}
                    onClick={() => handleAction(app.id, 'reject')}
                    className="btn btn-danger"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleAction(app.id, 'approve')}
                    className="btn btn-success"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Check size={16} /> Approve
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
