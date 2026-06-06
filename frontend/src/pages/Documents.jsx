import React, { useState, useEffect } from 'react';
import { FileText, Printer, Mail, CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils';

export default function Documents({ user }) {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'invoices'
  const [pos, setPos] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal details state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docType, setDocType] = useState(''); // 'po' or 'invoice'
  const [showModal, setShowModal] = useState(false);

  // Email simulation state
  const [emailOpen, setEmailOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const posRes = await fetch('/api/documents/pos', { headers });
      const posData = await posRes.json();
      if (posRes.ok) setPos(posData);

      const invoicesRes = await fetch('/api/documents/invoices', { headers });
      const invoicesData = await invoicesRes.json();
      if (invoicesRes.ok) setInvoices(invoicesData);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleOpenDoc = (doc, type) => {
    setSelectedDoc(doc);
    setDocType(type);
    setShowModal(true);
    setEmailOpen(false);
    setRecipientEmail(type === 'invoice' ? 'finance@company.com' : 'vendor@company.com');
    setEmailSuccess('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailSend = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/documents/invoices/${selectedDoc.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSuccess(data.message);
        setTimeout(() => {
          setEmailOpen(false);
          setEmailSuccess('');
        }, 2500);
      } else {
        alert(data.error || 'Failed to email invoice');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/documents/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        // Update selected document state
        setSelectedDoc(prev => ({ ...prev, status: 'paid' }));
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to record payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Procurement Documents</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track issued Purchase Orders and Invoices generated from authorized tenders</p>
      </div>

      {/* Tabs selector */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('pos')}
          className={`nav-link ${activeTab === 'pos' ? 'active' : ''}`}
          style={{ borderBottom: '2px solid transparent', borderRadius: '0', padding: '0.75rem 1.5rem', transform: 'none' }}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`nav-link ${activeTab === 'invoices' ? 'active' : ''}`}
          style={{ borderBottom: '2px solid transparent', borderRadius: '0', padding: '0.75rem 1.5rem', transform: 'none' }}
        >
          Tax Invoices
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Fetching procurement documents...</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {activeTab === 'pos' ? (
            /* Purchase Orders Table */
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>RFQ Project</th>
                    <th>Vendor Particulars</th>
                    <th>Grand Total (Inc. GST)</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No Purchase Orders found.
                      </td>
                    </tr>
                  ) : (
                    pos.map(po => (
                      <tr key={po.id}>
                        <td>
                          <span style={{ fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>{po.po_number}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{po.rfq_title}</span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>{po.vendor_name}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{formatCurrency(po.grand_total)}</span>
                        </td>
                        <td>
                          <span>{formatDate(po.created_at)}</span>
                        </td>
                        <td>
                          <span className="badge badge-success">{po.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" onClick={() => handleOpenDoc(po, 'po')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            View Document
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Invoices Table */
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Linked PO</th>
                    <th>Vendor Particulars</th>
                    <th>Grand Total (Inc. GST)</th>
                    <th>Due Date</th>
                    <th>Payment Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No Tax Invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id}>
                        <td>
                          <span style={{ fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>{inv.invoice_number}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{inv.po_number}</span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>{inv.vendor_name}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{formatCurrency(inv.grand_total)}</span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><Calendar size={14} /> {formatDate(inv.due_date)}</span>
                        </td>
                        <td>
                          <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" onClick={() => handleOpenDoc(inv, 'invoice')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            View Document
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal - Document Preview */}
      {showModal && selectedDoc && (
        <div className="modal-overlay no-print">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2>Document Viewer</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>Close Window</button>
            </div>
            <div className="modal-body">
              
              {/* Document Printable container */}
              <div className="print-document" style={{
                backgroundColor: 'white',
                color: '#1f2937',
                padding: '2.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                fontFamily: 'sans-serif'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #374151', paddingBottom: '1.25rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                      {docType === 'po' ? 'PURCHASE ORDER' : 'TAX INVOICE'}
                    </h1>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>VendorBridge Procurement Network</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', fontFamily: 'monospace' }}>
                      {docType === 'po' ? selectedDoc.po_number : selectedDoc.invoice_number}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>
                      Date: {formatDate(selectedDoc.created_at)}
                    </span>
                  </div>
                </div>

                {/* Company details billing info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>ISSUED TO (VENDOR):</span>
                    <strong style={{ color: '#111827', fontSize: '1rem' }}>{selectedDoc.vendor_name}</strong>
                    <p style={{ color: '#4b5563', marginTop: '4px', lineHeight: '1.4' }}>
                      GSTIN: {selectedDoc.vendor_gstin || '27AAAAA1111A1Z1'}<br />
                      Contact Name: {selectedDoc.vendor_contact || 'Vendor Account Rep'}<br />
                      Address: {selectedDoc.address || 'Corporate Office, Phase II'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>ISSUED BY (BUYER):</span>
                    <strong style={{ color: '#111827', fontSize: '1rem' }}>VendorBridge Enterprise Ltd.</strong>
                    <p style={{ color: '#4b5563', marginTop: '4px', lineHeight: '1.4' }}>
                      GSTIN: 27VBBUY8888E1Z9<br />
                      Email: procurement@vendorbridge.com<br />
                      Address: 404, Tech Hub Complex, Sector 62, Noida, UP
                    </p>
                  </div>
                </div>

                {/* Invoice Table list */}
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb' }}>Product Description</th>
                        <th style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.75rem 1rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>Total (Excl. Tax)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '1rem', border: '1px solid #e5e7eb', fontWeight: 600 }}>
                          {selectedDoc.rfq_title || `Procurement supply for PO #${selectedDoc.po_number}`}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                          {formatCurrency(parseFloat(selectedDoc.total_amount) / (selectedDoc.rfq_quantity || 1))}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                          {selectedDoc.rfq_quantity || 1}
                        </td>
                        <td style={{ padding: '1rem', border: '1px solid #e5e7eb', textAlign: 'right' }}>
                          {formatCurrency(selectedDoc.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calculations details */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                      <span>Subtotal (Net Amount):</span>
                      <strong style={{ color: '#111827' }}>{formatCurrency(selectedDoc.total_amount)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                      <span>CGST + SGST (18%):</span>
                      <strong style={{ color: '#111827' }}>{formatCurrency(selectedDoc.tax_amount)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                      <span style={{ color: '#111827' }}>Grand Total:</span>
                      <span style={{ color: '#047857' }}>{formatCurrency(selectedDoc.grand_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and conditions */}
                <div style={{ fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', lineHeight: '1.4' }}>
                  <strong>Terms &amp; Conditions:</strong><br />
                  1. Goods are subject to inspections and audits upon receipt.<br />
                  2. Invoices are subject to standard due cycles of 30 days from creation.<br />
                  3. For support queries, contact accounts@vendorbridge.com.
                </div>
              </div>

              {/* Email Simulating Drawer */}
              {emailOpen && (
                <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Send Document via Email</h4>
                  {emailSuccess && <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>{emailSuccess}</p>}
                  
                  <form onSubmit={handleEmailSend} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      className="form-control"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="recipient@domain.com"
                      required
                      style={{ flexGrow: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={emailLoading}>
                      {emailLoading ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              )}

            </div>
            <div className="modal-footer no-print">
              <button type="button" className="btn btn-secondary" onClick={() => setEmailOpen(!emailOpen)}>
                <Mail size={16} /> Email Document
              </button>
              <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                <Printer size={16} /> Print / Save PDF
              </button>

              {docType === 'invoice' && selectedDoc.status === 'issued' && user.role !== 'vendor' && (
                <button type="button" className="btn btn-success" onClick={() => handleMarkPaid(selectedDoc.id)}>
                  <CreditCard size={16} /> Record Payment (Paid)
                </button>
              )}

              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
