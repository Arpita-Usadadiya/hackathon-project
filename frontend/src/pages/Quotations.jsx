import React, { useEffect, useState } from 'react';
import { Send, Edit2, X, FileText } from 'lucide-react';
import api from '../api';

export default function Quotations({ user, showToast }) {
  const [rfqs, setRfqs]         = useState([]);
  const [myQuotes, setMyQuotes] = useState({});
  const [loading, setLoading]   = useState(true);
  const [editModal, setEditModal] = useState(null); // { rfq, quote }
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ unit_price: '', delivery_days: '', notes: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rfqRes = await api.get('/rfqs');
      const openRfqs = rfqRes.data.filter(r => r.status === 'published');
      setRfqs(openRfqs);

      // Load my quote for each open RFQ
      const quoteMap = {};
      await Promise.all(
        openRfqs.map(async rfq => {
          try {
            const r = await api.get(`/quotations/myquote/${rfq.id}`);
            if (r.data) quoteMap[rfq.id] = r.data;
          } catch {}
        })
      );
      setMyQuotes(quoteMap);
    } catch {
      showToast('Failed to load RFQs', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (rfq) => {
    const existing = myQuotes[rfq.id];
    setForm({
      unit_price:    existing?.unit_price    ?? '',
      delivery_days: existing?.delivery_days ?? '',
      notes:         existing?.notes         ?? '',
    });
    setEditModal({ rfq, quote: existing });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { rfq, quote } = editModal;
    try {
      if (quote) {
        await api.put(`/quotations/${quote.id}`, form);
        showToast('Quotation updated', 'success', 'Quote Updated');
      } else {
        await api.post('/quotations', { rfq_id: rfq.id, ...form });
        showToast('Quotation submitted', 'success', 'Quote Submitted');
      }
      setEditModal(null);
      loadData();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to submit', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s) => {
    const map = { submitted: 'badge-info', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  if (loading) {
    return <div className="loading-wrap"><div className="spinner" /> Loading your RFQs…</div>;
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>My Quotations</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Open RFQs you can bid on · {rfqs.length} available
            </p>
          </div>
        </div>

        {rfqs.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} />
            <h4>No open RFQs</h4>
            <p>You'll be notified when procurement officers publish new RFQs for you</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>RFQ</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Deadline</th>
                  <th>Your Quote</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map(rfq => {
                  const q = myQuotes[rfq.id];
                  return (
                    <tr key={rfq.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{rfq.title}</div>
                        {rfq.description && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {rfq.description.slice(0, 60)}{rfq.description.length > 60 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td><span className="badge badge-info">{rfq.category}</span></td>
                      <td>{Number(rfq.quantity).toLocaleString()}</td>
                      <td style={{ fontSize: '0.84rem' }}>{rfq.deadline?.split('T')[0]}</td>
                      <td>
                        {q ? (
                          <div>
                            <div style={{ fontWeight: 600 }}>₹{Number(q.total_price).toLocaleString()}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              ₹{Number(q.unit_price).toLocaleString()}/unit · {q.delivery_days}d
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Not submitted</span>
                        )}
                      </td>
                      <td>{q ? statusBadge(q.status) : <span className="badge badge-neutral">Pending</span>}</td>
                      <td>
                        {q?.status !== 'approved' && (
                          <button className="btn btn-primary btn-sm" onClick={() => openModal(rfq)}>
                            {q ? <><Edit2 size={12} /> Update</> : <><Send size={12} /> Quote</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit/Edit Quote Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editModal.quote ? 'Update Quotation' : 'Submit Quotation'}</h3>
              <button className="modal-close-btn" onClick={() => setEditModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>RFQ</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: 4 }}>{editModal.rfq.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Quantity: <strong>{Number(editModal.rfq.quantity).toLocaleString()}</strong> · Deadline: {editModal.rfq.deadline?.split('T')[0]}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit Price (₹) *</label>
                    <input type="number" className="form-control" placeholder="0.00" min={0.01} step={0.01}
                      value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Delivery Days *</label>
                    <input type="number" className="form-control" placeholder="e.g. 14" min={1}
                      value={form.delivery_days} onChange={e => setForm({ ...form, delivery_days: e.target.value })} required />
                  </div>
                </div>

                {form.unit_price && (
                  <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Bid Amount: </span>
                    <strong style={{ color: 'var(--primary)' }}>
                      ₹{(parseFloat(form.unit_price || 0) * parseInt(editModal.rfq.quantity || 0)).toLocaleString()}
                    </strong>
                  </div>
                )}

                <div className="form-group">
                  <label>Notes / Terms & Conditions</label>
                  <textarea className="form-control" rows={3} placeholder="Warranty, delivery conditions, GST details…"
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting…' : editModal.quote ? 'Update Quote' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}