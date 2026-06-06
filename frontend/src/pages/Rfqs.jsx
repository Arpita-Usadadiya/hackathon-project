import React, { useEffect, useState } from 'react';
import { Plus, X, FileText, Send } from 'lucide-react';
import api from '../api';

export default function Rfqs({ user, setView, setSelectedRfqId, showToast }) {
  const [rfqs, setRfqs]       = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [quoteModal, setQuoteModal] = useState(null); // holds rfq object for vendor quote
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    quantity: '', deadline: '', vendorIds: [],
  });

  const [quoteForm, setQuoteForm] = useState({
    unit_price: '', delivery_days: '', notes: ''
  });

  useEffect(() => {
    loadRfqs();
    if (user.role === 'officer' || user.role === 'admin') loadVendors();
  }, []);

  const loadRfqs    = async () => { try { const r = await api.get('/rfqs'); setRfqs(r.data); } catch {} };
  const loadVendors = async () => { try { const r = await api.get('/vendors'); setVendors(r.data.filter(v => v.status === 'active')); } catch {} };

  const createRfq = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/rfqs', { ...form, quantity: Number(form.quantity), status: 'published' });
      showToast('RFQ published successfully', 'success', 'RFQ Created');
      setForm({ title: '', description: '', category: '', quantity: '', deadline: '', vendorIds: [] });
      setShowModal(false);
      loadRfqs();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create RFQ', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/quotations', { rfq_id: quoteModal.id, ...quoteForm });
      showToast('Quotation submitted successfully', 'success', 'Quote Submitted');
      setQuoteModal(null);
      setQuoteForm({ unit_price: '', delivery_days: '', notes: '' });
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to submit quotation', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVendor = (id) => {
    setForm(prev => ({
      ...prev,
      vendorIds: prev.vendorIds.includes(id)
        ? prev.vendorIds.filter(v => v !== id)
        : [...prev.vendorIds, id]
    }));
  };

  const statusBadge = (s) => {
    const map = { published: 'badge-success', draft: 'badge-neutral', closed: 'badge-warning' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
    if (diff < 0) return <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>Expired</span>;
    if (diff <= 3) return <span style={{ color: 'var(--warning)', fontSize: '0.75rem' }}>{diff}d left</span>;
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{diff}d left</span>;
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>RFQs & Tenders</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {rfqs.length} total · {rfqs.filter(r => r.status === 'published').length} open
            </p>
          </div>
          {user.role === 'officer' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Create RFQ
            </button>
          )}
        </div>

        {rfqs.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} />
            <h4>No RFQs yet</h4>
            <p>{user.role === 'officer' ? 'Create your first RFQ to begin procurement' : 'No RFQs assigned to you yet'}</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfqs.map(rfq => (
                  <tr key={rfq.id}>
                    <td style={{ fontWeight: 500 }}>{rfq.title}</td>
                    <td><span className="badge badge-info">{rfq.category}</span></td>
                    <td>{Number(rfq.quantity).toLocaleString()}</td>
                    <td>
                      <div>{rfq.deadline?.split('T')[0]}</div>
                      {daysLeft(rfq.deadline)}
                    </td>
                    <td>{statusBadge(rfq.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {user.role === 'officer' && rfq.status === 'published' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => { setSelectedRfqId(rfq.id); setView('compare'); }}
                          >
                            Compare Bids
                          </button>
                        )}
                        {user.role === 'vendor' && rfq.status === 'published' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setQuoteModal(rfq)}
                          >
                            <Send size={12} /> Submit Quote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create RFQ Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3>Create New RFQ</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={createRfq}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Title *</label>
                  <input className="form-control" placeholder="e.g. Office Furniture Procurement Q3"
                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={3} placeholder="Describe the procurement requirement…"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <input className="form-control" placeholder="e.g. Hardware, Services"
                      value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input type="number" className="form-control" placeholder="0" min={1}
                      value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Submission Deadline *</label>
                  <input type="date" className="form-control"
                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Assign Vendors ({form.vendorIds.length} selected)</label>
                  <div className="vendor-checkbox-list">
                    {vendors.length === 0
                      ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '4px' }}>No active vendors</p>
                      : vendors.map(v => (
                          <label key={v.id} className="vendor-checkbox-item">
                            <input type="checkbox"
                              checked={form.vendorIds.includes(v.id)}
                              onChange={() => toggleVendor(v.id)} />
                            <span>{v.name}</span>
                            <span className="vendor-cat">{v.category}</span>
                          </label>
                        ))
                    }
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Publishing…' : 'Publish RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Quote Modal (Vendor) */}
      {quoteModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setQuoteModal(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit Quotation</h3>
              <button className="modal-close-btn" onClick={() => setQuoteModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={submitQuote}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '12px 14px', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>RFQ Details</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{quoteModal.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Qty: {Number(quoteModal.quantity).toLocaleString()} · Deadline: {quoteModal.deadline?.split('T')[0]}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Unit Price (₹) *</label>
                    <input type="number" className="form-control" placeholder="0.00" min={0.01} step={0.01}
                      value={quoteForm.unit_price} onChange={e => setQuoteForm({ ...quoteForm, unit_price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Delivery (days) *</label>
                    <input type="number" className="form-control" placeholder="e.g. 14" min={1}
                      value={quoteForm.delivery_days} onChange={e => setQuoteForm({ ...quoteForm, delivery_days: e.target.value })} required />
                  </div>
                </div>
                {quoteForm.unit_price && quoteModal.quantity && (
                  <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    Estimated Total: <strong>₹{(parseFloat(quoteForm.unit_price) * parseInt(quoteModal.quantity)).toLocaleString()}</strong>
                  </div>
                )}
                <div className="form-group">
                  <label>Notes / Terms</label>
                  <textarea className="form-control" rows={3} placeholder="Any conditions, warranty terms, or additional info…"
                    value={quoteForm.notes} onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setQuoteModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  <Send size={13} /> {submitting ? 'Submitting…' : 'Submit Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}