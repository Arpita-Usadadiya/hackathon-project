import React, { useState } from 'react';

export default function Documents({ user }) {
  const [tab, setTab] = useState('pos'); // 'pos' or 'invoices'

  // TODO: Fetch POs list (GET /api/documents/pos) and Invoices list (GET /api/documents/invoices).
  // Provide document preview modals.
  // Add browser printing hooks (window.print()) and email simulation triggers.
  // Add payment logging buttons (POST /api/documents/invoices/:id/pay).
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontWeight: 800 }}>Procurement Documents</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Track issued Purchase Orders and Invoices generated from authorized tenders</p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <button className={`nav-link ${tab === 'pos' ? 'active' : ''}`} onClick={() => setTab('pos')}>Purchase Orders</button>
        <button className={`nav-link ${tab === 'invoices' ? 'active' : ''}`} onClick={() => setTab('invoices')}>Tax Invoices</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              {tab === 'pos' ? (
                <tr>
                  <th>PO Number</th>
                  <th>RFQ Project</th>
                  <th>Vendor</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Invoice Number</th>
                  <th>Linked PO</th>
                  <th>Vendor</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                </tr>
              )}
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No documents loaded. Implement GET /api/documents logic.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
