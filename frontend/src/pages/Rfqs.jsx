import React, { useState } from 'react';

export default function Rfqs({ user, setView, setSelectedRfqId }) {
  const [tab, setTab] = useState('list'); // 'list' or 'create'

  // TODO: Fetch RFQ list from GET /api/rfqs.
  // Add a form component to POST /api/rfqs (Officer role).
  // Allow Vendors to submit unit pricing quotations.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 800 }}>Request For Quotations (RFQs)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Publish new procurement tenders and check vendor bidding lines</p>
        </div>
        {user.role === 'officer' && (
          <button className="btn btn-primary" onClick={() => setTab(tab === 'list' ? 'create' : 'list')}>
            {tab === 'list' ? 'Create RFQ' : 'View RFQs List'}
          </button>
        )}
      </div>

      {tab === 'list' ? (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>RFQ title</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    RFQ data not fetched. Implement GET /api/rfqs logic.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="card-title">Create Tender RFQ</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Tender Title</label>
              <input type="text" className="form-control" placeholder="e.g. Office Hardware Supplies" />
            </div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
              Publish Tender
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
