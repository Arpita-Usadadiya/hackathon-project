import React, { useState } from 'react';

export default function Vendors({ user }) {
  // TODO: Fetch vendors list from GET /api/vendors.
  // Add a registration form in a modal sending POST /api/vendors.
  // Allow Admins to toggle statuses using PUT /api/vendors/:id/status.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 800 }}>Vendor Management Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View registered suppliers and corporate GSTIN credentials</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Implement modal form registration!')}>
          Register Vendor
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vendor Profile</th>
                <th>Category</th>
                <th>GSTIN Details</th>
                <th>Primary Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Vendor list not fetched. Implement GET /api/vendors logic.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
