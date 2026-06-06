import React from 'react';

export default function Quotations({ rfq, user, onSubmissionSuccess }) {
  // TODO: Fetch any existing quote using GET /api/quotations/myquote/:rfqId.
  // Add a form to submit or update a quotation bid (POST /api/quotations).
  return (
    <div className="card">
      <h3 className="card-title">Quotation Bid Workspace</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
        Tender Project: {rfq.title}
      </p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Unit Price (INR)</label>
          <input type="number" className="form-control" placeholder="0.00" />
        </div>
        <div className="form-group">
          <label>Delivery Days</label>
          <input type="number" className="form-control" placeholder="e.g. 10" />
        </div>
        <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
          Submit Quotation Bid
        </button>
      </form>
    </div>
  );
}
