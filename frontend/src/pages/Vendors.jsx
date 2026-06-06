import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, X, Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

/* ─── Interactive star picker ────────────────────── */
function StarPicker({ value, onChange, size = 24 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: n <= (hovered || value) ? '#f59e0b' : '#e2e8f0',
            transition: 'color 0.1s', lineHeight: 1,
          }}
        >
          <Star size={size} fill={n <= (hovered || value) ? '#f59e0b' : 'none'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

/* ─── Static star display ────────────────────────── */
function StarDisplay({ value, size = 14 }) {
  const rounded = Math.round(parseFloat(value) || 0);
  return (
    <span style={{ display: 'inline-flex', gap: 2, lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n} size={size} strokeWidth={1.5}
          fill={n <= rounded ? '#f59e0b' : 'none'}
          color={n <= rounded ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </span>
  );
}

/* ─── Rating badge (compact) ─────────────────────── */
function RatingBadge({ rating, total }) {
  const r = parseFloat(rating) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <StarDisplay value={r} size={13} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {r.toFixed(1)}
        {total !== undefined && (
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> ({total})</span>
        )}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function Vendors({ user, showToast }) {
  const [vendors, setVendors]     = useState([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rating modal state
  const [rateModal, setRateModal] = useState(null);   // vendor object
  const [rateValue, setRateValue] = useState(0);
  const [rateReview, setRateReview] = useState('');
  const [ratingSub, setRatingSub] = useState(false);

  // Ratings panel (expanded per vendor)
  const [ratingsPanel, setRatingsPanel] = useState(null); // vendor id
  const [ratingsData, setRatingsData]   = useState({});   // { [vendorId]: { ratings, average, total } }

  const [form, setForm] = useState({
    name: '', category: '', gstin: '',
    contact_name: '', email: '', phone: '', address: '',
  });

  const canRate = ['admin', 'officer', 'approver'].includes(user?.role);

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch {
      showToast('Failed to load vendors', 'danger');
    }
  };

  /* ─── Load ratings for one vendor ────────────────── */
  const loadRatings = useCallback(async (vendorId) => {
    try {
      const res = await api.get(`/vendors/${vendorId}/ratings`);
      setRatingsData(prev => ({ ...prev, [vendorId]: res.data }));
    } catch {
      showToast('Could not load ratings', 'danger');
    }
  }, []);

  const toggleRatingsPanel = (vendorId) => {
    if (ratingsPanel === vendorId) {
      setRatingsPanel(null);
    } else {
      setRatingsPanel(vendorId);
      if (!ratingsData[vendorId]) loadRatings(vendorId);
    }
  };

  /* ─── Open rate modal ─────────────────────────────── */
  const openRateModal = (vendor) => {
    setRateModal(vendor);
    setRateValue(0);
    setRateReview('');
  };

  /* ─── Submit rating ───────────────────────────────── */
  const submitRating = async () => {
    if (rateValue === 0) {
      showToast('Please select a star rating', 'warning');
      return;
    }
    setRatingSub(true);
    try {
      const res = await api.post(`/vendors/${rateModal.id}/rate`, {
        rating: rateValue,
        review: rateReview,
      });
      showToast(`Rated ${rateModal.name} ${rateValue}/5 stars`, 'success', 'Rating Submitted');
      setRateModal(null);
      // Refresh vendor list (to update avg rating displayed) and ratings panel
      await loadVendors();
      setRatingsData(prev => ({ ...prev, [rateModal.id]: undefined }));
      if (ratingsPanel === rateModal.id) loadRatings(rateModal.id);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to submit rating', 'danger');
    } finally {
      setRatingSub(false);
    }
  };

  /* ─── Add vendor ──────────────────────────────────── */
  const createVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vendors', form);
      showToast('Vendor added successfully', 'success', 'Vendor Created');
      setForm({ name: '', category: '', gstin: '', contact_name: '', email: '', phone: '', address: '' });
      setShowModal(false);
      loadVendors();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create vendor', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/vendors/${id}/status`, { status });
      showToast(`Vendor ${status}`, 'success');
      loadVendors();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update vendor', 'danger');
    }
  };

  const statusBadge = (s) => {
    const map = { active: 'badge-success', suspended: 'badge-danger', pending: 'badge-warning' };
    return <span className={`badge ${map[s] ?? 'badge-neutral'}`}>{s}</span>;
  };

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  const ROLE_LABEL = { admin: 'Admin', officer: 'Officer', approver: 'Finance Mgr' };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Vendor Directory</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {vendors.length} registered vendor{vendors.length !== 1 ? 's' : ''}
              {canRate && <span style={{ color: 'var(--primary)' }}> · You can rate vendors</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                className="form-control" placeholder="Search vendors…"
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
            {(user?.role === 'officer' || user?.role === 'admin') && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Add Vendor
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h4>No vendors found</h4>
            <p>{search ? 'Try a different search term' : 'Add your first vendor to get started'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>GSTIN</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <React.Fragment key={v.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 500 }}>{v.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.email}</div>
                      </td>
                      <td><span className="badge badge-info">{v.category}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.gstin}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{v.contact_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.phone}</div>
                      </td>
                      <td>
                        <RatingBadge rating={v.rating} />
                      </td>
                      <td>{statusBadge(v.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {/* Show ratings panel toggle */}
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => toggleRatingsPanel(v.id)}
                            style={{ color: 'var(--primary)' }}
                            title="View ratings"
                          >
                            <MessageSquare size={13} />
                            {ratingsPanel === v.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          {/* Rate button */}
                          {canRate && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openRateModal(v)}
                              title="Rate this vendor"
                            >
                              <Star size={12} /> Rate
                            </button>
                          )}

                          {/* Admin status actions */}
                          {user?.role === 'admin' && v.status !== 'active' && (
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(v.id, 'active')}>
                              Activate
                            </button>
                          )}
                          {user?.role === 'admin' && v.status !== 'suspended' && (
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v.id, 'suspended')}>
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* ─── Ratings panel row ─────────────────────── */}
                    {ratingsPanel === v.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                          <RatingsPanel
                            vendorId={v.id}
                            vendorName={v.name}
                            data={ratingsData[v.id]}
                            loading={!ratingsData[v.id]}
                            roleLabel={ROLE_LABEL}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add Vendor Modal ──────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3>Add New Vendor</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={createVendor}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input className="form-control" placeholder="e.g. Apex Industrial" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input className="form-control" placeholder="e.g. Hardware, Services" value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>GSTIN * (15 characters)</label>
                  <input className="form-control" placeholder="15-character GST number" maxLength={15}
                    value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person *</label>
                    <input className="form-control" placeholder="Full name" value={form.contact_name}
                      onChange={e => setForm({ ...form, contact_name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input className="form-control" placeholder="10-digit number" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" className="form-control" placeholder="vendor@company.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea className="form-control" placeholder="Full address" rows={2} value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding…' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Rate Vendor Modal ─────────────────────────── */}
      {rateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRateModal(null)}>
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Rate Vendor</h3>
              <button className="modal-close-btn" onClick={() => setRateModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Vendor summary */}
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rateModal.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  {rateModal.category} · Current avg: {parseFloat(rateModal.rating || 0).toFixed(1)}/5
                </div>
              </div>

              {/* Star picker */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  Your rating *
                </div>
                <StarPicker value={rateValue} onChange={setRateValue} size={30} />
                {rateValue > 0 && (
                  <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rateValue]} — {rateValue}/5
                  </div>
                )}
              </div>

              {/* Review */}
              <div className="form-group">
                <label>Review / Comment <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  className="form-control" rows={3}
                  placeholder="Describe your experience with this vendor — delivery, quality, communication…"
                  value={rateReview} onChange={e => setRateReview(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '8px 10px', borderRadius: 6 }}>
                ℹ️ You can update your rating at any time. The vendor's average rating updates instantly.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRateModal(null)}>Cancel</button>
              <button
                className="btn btn-primary" onClick={submitRating}
                disabled={ratingSub || rateValue === 0}
              >
                <Star size={13} /> {ratingSub ? 'Submitting…' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Ratings panel component ─────────────────────── */
function RatingsPanel({ vendorId, vendorName, data, loading, roleLabel }) {
  if (loading) {
    return (
      <div style={{ padding: '20px 24px', display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        <div className="spinner" style={{ width: 16, height: 16 }} /> Loading ratings…
      </div>
    );
  }

  if (!data) return null;

  const { ratings, average, total } = data;

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
  }));
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div style={{ padding: '20px 24px', background: '#fafbfc', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>

        {/* ─── Summary block ─────────────────────── */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>
            Rating Summary
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
              {average.toFixed(1)}
            </span>
            <div style={{ paddingBottom: 6 }}>
              <StarDisplay value={average} size={16} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {total} review{total !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Distribution bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {distribution.map(({ star, count }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 8 }}>{star}</span>
                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999, background: '#f59e0b',
                    width: `${(count / maxCount) * 100}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 16, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Reviews list ──────────────────────── */}
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>
            Reviews
          </div>
          {ratings.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', padding: '8px 0' }}>
              No reviews yet. Be the first to rate this vendor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 260, overflowY: 'auto' }}>
              {ratings.map(r => (
                <div key={r.id} style={{
                  background: 'white', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', background: '#eef2ff',
                        color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {r.user_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.user_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {roleLabel[r.user_role] || r.user_role}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <StarDisplay value={r.rating} size={13} />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {r.review && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                      "{r.review}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}