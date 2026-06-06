import React, { useState } from 'react';

export default function Approvals({ user }) {
  // TODO: Fetch pending approvals queue from GET /api/approvals.
  // Add action buttons to approve or reject bids (POST /api/approvals/:quoteId/action).
  // Upon approval, display the generated PO and Invoice numbers.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontWeight: 800 }}>Procurement Approvals Queue</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Review pending quotations submitted by procurement officers and authorize purchases</p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Pending Approval Quote #1</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
          Vendor: Apex Industrial &bull; Total Bid: ₹27,50,000.00
        </p>

        <form style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', alignItems: 'center' }}>
          <input type="text" className="form-control" placeholder="Approver remarks..." style={{ flexGrow: 1 }} />
          <button type="button" className="btn btn-danger">Reject</button>
          <button type="button" className="btn btn-success">Approve</button>
        </form>
      </div>
    </div>
  );
}
