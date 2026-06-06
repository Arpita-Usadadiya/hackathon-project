import React, { useState } from 'react';

export default function Comparison({ rfqId, setView, setSelectedRfqId }) {
  // TODO: Fetch RFQ quotes details via GET /api/quotations/rfq/:rfqId.
  // Compare bids side-by-side.
  // Highlight the lowest price and fastest delivery bids.
  // Allow Officers to recommend a bid for manager review.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontWeight: 800 }}>Bid Comparison Matrix</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Compare vendor quotations side-by-side to select optimal bidding terms</p>
      </div>

      <div className="card">
        <h3 className="card-title">Quotation Comparison Table</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
          Selected RFQ Project ID: {rfqId || 'None. Go to RFQs page and open comparison.'}
        </p>
        
        {/* Comparison columns boilerplate */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ flexGrow: 1, border: '1px dashed var(--border-color)' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Implement side-by-side bid columns comparison.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
