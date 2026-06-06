import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, Calendar, Users, FileText, Send, CheckCircle, Clock, Lock } from 'lucide-react';
import { formatDate } from '../utils';
import Quotations from './Quotations';

export default function Rfqs({ user, setView, setSelectedRfqId }) {
  const [rfqs, setRfqs] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'details'
  
  // Single RFQ Detail state
  const [selectedRfq, setSelectedRfq] = useState(null);
  
  // Create Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    quantity: 1,
    deadline: '',
    vendorIds: []
  });
  
  const [activeVendors, setActiveVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRfqs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rfqs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRfqs(data);
      }
    } catch (err) {
      console.error('Error fetching RFQs:', err);
    }
  };

  const fetchActiveVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendors?status=active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveVendors(data);
      }
    } catch (err) {
      console.error('Error fetching active vendors:', err);
    }
  };

  useEffect(() => {
    fetchRfqs();
    if (user.role === 'officer') {
      fetchActiveVendors();
    }
  }, [user]);

  const handleOpenDetails = async (rfqId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rfqs/${rfqId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedRfq(data);
        setActiveTab('details');
      } else {
        alert(data.error || 'Failed to fetch RFQ details');
      }
    } catch (err) {
      console.error('Error fetching RFQ details:', err);
    }
  };

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.vendorIds.length === 0) {
      setError('Please assign at least one vendor to this RFQ');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, status: 'published' }) // Directly publish
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create RFQ');
      }

      setSuccess(`RFQ "${formData.title}" created and published successfully!`);
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Hardware',
        quantity: 1,
        deadline: '',
        vendorIds: []
      });
      fetchRfqs();
      setTimeout(() => {
        setActiveTab('list');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseRfq = async (rfqId) => {
    if (!window.confirm('Are you sure you want to close this RFQ? No further quotations will be accepted.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/rfqs/${rfqId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh details
        handleOpenDetails(rfqId);
        fetchRfqs();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to close RFQ');
      }
    } catch (err) {
      console.error('Error closing RFQ:', err);
    }
  };

  const handleVendorCheck = (vendorId) => {
    const isChecked = formData.vendorIds.includes(vendorId);
    if (isChecked) {
      setFormData({
        ...formData,
        vendorIds: formData.vendorIds.filter(id => id !== vendorId)
      });
    } else {
      setFormData({
        ...formData,
        vendorIds: [...formData.vendorIds, vendorId]
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* List View */}
      {activeTab === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Request For Quotations (RFQs)</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Invite vendors to submit quotes and review current procurement timelines</p>
            </div>
            {user.role === 'officer' && (
              <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
                <Plus size={16} /> Create RFQ
              </button>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>RFQ Details</th>
                    <th>Category</th>
                    <th>Required Qty</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    {user.role === 'vendor' && <th>My Quote Status</th>}
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.length === 0 ? (
                    <tr>
                      <td colSpan={user.role === 'vendor' ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No RFQs found.
                      </td>
                    </tr>
                  ) : (
                    rfqs.map((rfq) => (
                      <tr key={rfq.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: 'white' }}>{rfq.title}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rfq.description || 'No description provided'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">{rfq.category}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{rfq.quantity} units</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Calendar size={14} color="var(--text-muted)" /> {formatDate(rfq.deadline)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            rfq.status === 'published' ? 'badge-success' : 
                            rfq.status === 'draft' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {rfq.status === 'published' ? 'open' : rfq.status}
                          </span>
                        </td>
                        {user.role === 'vendor' && (
                          <td>
                            {rfq.quote_status ? (
                              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={10} /> Quoted
                              </span>
                            ) : (
                              <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </td>
                        )}
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" onClick={() => handleOpenDetails(rfq.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            Open Workspace
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create RFQ Form */}
      {activeTab === 'create' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('list')} style={{ marginBottom: '1.5rem' }}>
            <ChevronLeft size={16} /> Back to List
          </button>

          <div className="card">
            <h3 className="card-title"><FileText size={20} color="var(--primary)" /> Initiate Procurement RFQ</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Fill in the specification requirements and assign vendors. The RFQ will be published to the selected vendor channels immediately.
            </p>

            {error && <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '1rem', color: '#fb7185', marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="card" style={{ borderLeft: '4px solid var(--secondary)', padding: '1rem', color: 'var(--secondary)', marginBottom: '1rem' }}>{success}</div>}

            <form onSubmit={handleCreateRfq} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>RFQ Title / Product Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Developer Laptops Procurement 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Detailed Specifications / Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe technical specs, item specifics, and delivery terms..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Procurement Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Services">Services</option>
                    <option value="Office">Office Supplies</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity Required</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Quotation Submission Deadline</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>

              {/* Vendor Checklist */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> Assign Invited Vendors</label>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)'
                }}>
                  {activeVendors.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>No active vendors registered. Register vendors first!</p>
                  ) : (
                    activeVendors.map(vendor => (
                      <label key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 0' }}>
                        <input
                          type="checkbox"
                          checked={formData.vendorIds.includes(vendor.id)}
                          onChange={() => handleVendorCheck(vendor.id)}
                          style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'white' }}>{vendor.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vendor.category} | Rating: {vendor.rating} ★</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
                <Send size={18} /> Publish RFQ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RFQ Details Pane */}
      {activeTab === 'details' && selectedRfq && (
        <div>
          <button className="btn btn-secondary" onClick={() => setActiveTab('list')} style={{ marginBottom: '1.5rem' }}>
            <ChevronLeft size={16} /> Back to List
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Column: RFQ Description & Bidding Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: '6px' }}>{selectedRfq.category}</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedRfq.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Created by {selectedRfq.creator_name} on {formatDate(selectedRfq.created_at)}</p>
                  </div>
                  <span className={`badge ${
                    selectedRfq.status === 'published' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {selectedRfq.status === 'published' ? 'active' : selectedRfq.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Specifications</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {selectedRfq.description || 'No detailed specifications entered.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Required Quantity:</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginTop: '2px' }}>{selectedRfq.quantity} units</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quotation Deadline:</span>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={16} /> {formatDate(selectedRfq.deadline)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close RFQ action for Officers */}
                {user.role === 'officer' && selectedRfq.status === 'published' && (
                  <button
                    onClick={() => handleCloseRfq(selectedRfq.id)}
                    className="btn btn-danger"
                    style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
                  >
                    <Lock size={16} /> Close RFQ Bidding
                  </button>
                )}
              </div>

              {/* Vendor Quote Submission workspace */}
              {user.role === 'vendor' && (
                <Quotations rfq={selectedRfq} user={user} onSubmissionSuccess={() => handleOpenDetails(selectedRfq.id)} />
              )}
            </div>

            {/* Right Column: Invitations & Comparison triggers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Invitations status */}
              <div className="card">
                <h3 className="card-title"><Users size={18} color="var(--primary)" /> Invited Vendors</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.75rem' }}>
                  {selectedRfq.assignedVendors && selectedRfq.assignedVendors.map(vendor => (
                    <div key={vendor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{vendor.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{vendor.contact_name} | {vendor.email}</span>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Invited</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison & Procurement actions for Officers / Approvers */}
              {user.role === 'officer' && selectedRfq.status === 'published' && (
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <h3 className="card-title">Compare Bids</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4' }}>
                    Open the side-by-side quotation comparison screen to review vendor pricing details, delivery timelines, and select the winning vendor.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRfqId(selectedRfq.id);
                      setView('compare');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Compare Quotes Matrix
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
