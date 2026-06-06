import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Star, Check, EyeOff } from 'lucide-react';

export default function Vendors({ user }) {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal registration form state
  const [showModal, setShowModal] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: 'Hardware',
    gstin: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/vendors?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVendors(data);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search, categoryFilter, statusFilter]);

  const handleRegisterVendor = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionSuccess('');

    if (newVendor.gstin.length !== 15) {
      setFormError('GSTIN must be exactly 15 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newVendor)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register vendor');
      }

      setActionSuccess(`Vendor ${newVendor.name} registered successfully!`);
      setShowModal(false);
      // Reset form
      setNewVendor({
        name: '',
        category: 'Hardware',
        gstin: '',
        contact_name: '',
        email: '',
        phone: '',
        address: ''
      });
      fetchVendors();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update vendor status');
      }
      fetchVendors();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Vendor Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track and manage registered vendor profiles and GST credentials</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Register Vendor
        </button>
      </div>

      {actionSuccess && (
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)', padding: '1rem', color: 'var(--secondary)' }}>
          {actionSuccess}
        </div>
      )}

      {/* Filter panel */}
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
            placeholder="Search vendor name or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem', width: '100%' }}
          />
        </div>

        {/* Category */}
        <select
          className="form-control"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Categories</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Services">Services</option>
          <option value="Office">Office Supplies</option>
        </select>

        {/* Status */}
        <select
          className="form-control"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Vendors Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Profile</th>
                <th>Category</th>
                <th>GSTIN Details</th>
                <th>Primary Contact</th>
                <th>Rating</th>
                <th>Status</th>
                {user.role === 'admin' && <th style={{ textAlign: 'right' }}>Admin Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={user.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No vendors found matching search criteria.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 700, color: 'white' }}>{vendor.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vendor.address || 'No address registered'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{vendor.category}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', color: '#a5b4fc', letterSpacing: '0.5px' }}>{vendor.gstin}</code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600 }}>{vendor.contact_name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{vendor.email} | {vendor.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Star size={14} fill="#fbbf24" /> {parseFloat(vendor.rating).toFixed(1)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        vendor.status === 'active' ? 'badge-success' : 
                        vendor.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    {user.role === 'admin' && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {vendor.status !== 'active' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(vendor.id, 'active')}
                              className="btn btn-secondary"
                              title="Set Active"
                              style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                            >
                              <Check size={14} color="var(--secondary)" />
                            </button>
                          )}
                          {vendor.status !== 'suspended' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(vendor.id, 'suspended')}
                              className="btn btn-secondary"
                              title="Suspend Vendor"
                              style={{ padding: '0.35rem 0.65rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}
                            >
                              <EyeOff size={14} color="var(--danger)" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Register Vendor */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Register New Vendor</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
            <form onSubmit={handleRegisterVendor}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formError && (
                  <div style={{ color: '#fb7185', fontSize: '0.8rem', fontWeight: 600 }}>
                    {formError}
                  </div>
                )}
                
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter company name"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={newVendor.category}
                      onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    >
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Services">Services</option>
                      <option value="Office">Office Supplies</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>GSTIN Number (15 digits)</label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength={15}
                      placeholder="e.g. 27AAAAA1111A1Z1"
                      value={newVendor.gstin}
                      onChange={(e) => setNewVendor({ ...newVendor, gstin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Primary Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contact person"
                      value={newVendor.contact_name}
                      onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="vendor@company.com"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone number"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Office Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Full corporate office address"
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
