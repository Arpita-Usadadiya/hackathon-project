import React, { useEffect, useState } from 'react';
import { Plus, Search, X, Star } from 'lucide-react';
import api from '../api';

export default function Vendors({ user, showToast }) {
  const [vendors, setVendors]   = useState([]);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', gstin: '',
    contact_name: '', email: '', phone: '', address: '',
  });

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch {
      showToast('Failed to load vendors', 'danger');
    }
  };

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

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    return <span className="stars">{'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))}</span>;
  };

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Vendor Directory</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {vendors.length} registered vendor{vendors.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-input-wrap">
              <Search size={14} />
              <input
                className="form-control"
                placeholder="Search vendors…"
                value={search}
                onChange={e => setSearch(e.target.value)}
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
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{v.category}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.gstin}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{v.contact_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.phone}</div>
                    </td>
                    <td>{renderStars(v.rating)}</td>
                    <td>{statusBadge(v.status)}</td>
                    {user?.role === 'admin' && (
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {v.status !== 'active' && (
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(v.id, 'active')}>
                              Activate
                            </button>
                          )}
                          {v.status !== 'suspended' && (
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(v.id, 'suspended')}>
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
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
                  <label>GSTIN *</label>
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
    </>
  );
}