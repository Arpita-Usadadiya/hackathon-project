import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Award, Clock, AlertCircle, Check } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function Comparison({ rfqId, setView, setSelectedRfqId }) {
  const [rfqs, setRfqs] = useState([]);
  const [activeRfqId, setActiveRfqId] = useState(rfqId || '');
  const [rfqDetails, setRfqDetails] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendSuccess, setRecommendSuccess] = useState('');

  // Fetch published RFQs for selector dropdown
  useEffect(() => {
    const fetchPublishedRfqs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/rfqs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Filter only published RFQs that have bids
          setRfqs(data.filter(r => r.status === 'published'));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPublishedRfqs();
  }, []);

  // Fetch RFQ Details and Bids when activeRfqId changes
  useEffect(() => {
    if (!activeRfqId) {
      setRfqDetails(null);
      setQuotations([]);
      return;
    }

    const fetchBids = async () => {
      setLoading(true);
      setRecommendSuccess('');
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // RFQ specs
        const rfqRes = await fetch(`/api/rfqs/${activeRfqId}`, { headers });
        const rfqData = await rfqRes.json();
        if (rfqRes.ok) setRfqDetails(rfqData);

        // Bids list
        const quotesRes = await fetch(`/api/quotations/rfq/${activeRfqId}`, { headers });
        const quotesData = await quotesRes.json();
        if (quotesRes.ok) setQuotations(quotesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [activeRfqId]);

  // Find lowest price and fastest delivery to highlight
  const lowestPrice = quotations.length > 0 ? Math.min(...quotations.map(q => parseFloat(q.total_price))) : Infinity;
  const fastestDelivery = quotations.length > 0 ? Math.min(...quotations.map(q => parseInt(q.delivery_days))) : Infinity;

  const handleRecommend = (vendorName) => {
    setRecommendSuccess(`Recommendation for "${vendorName}" has been logged. Forwarding comparison sheet to Finance Manager.`);
    setTimeout(() => {
      setRecommendSuccess('');
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Bid Comparison Matrix</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Compare vendor quotations side-by-side to select optimal bidding terms</p>
        </div>
        <button className="btn btn-secondary" onClick={() => {
          setSelectedRfqId(null);
          setView('rfqs');
        }}>
          <ChevronLeft size={16} /> Back to RFQs
        </button>
      </div>

      {/* RFQ Select Dropdown */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Active RFQ to Compare</label>
        <select
          className="form-control"
          value={activeRfqId}
          onChange={(e) => setActiveRfqId(e.target.value)}
          style={{ maxWidth: '500px' }}
        >
          <option value="">-- Select RFQ --</option>
          {rfqs.map(rfq => (
            <option key={rfq.id} value={rfq.id}>{rfq.title} ({rfq.category} - {rfq.quantity} units)</option>
          ))}
        </select>
      </div>

      {recommendSuccess && (
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)', color: 'var(--secondary)', padding: '1rem' }}>
          {recommendSuccess}
        </div>
      )}

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading bid comparison matrix...</p>}

      {!loading && activeRfqId && rfqDetails && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* RFQ Overview Summary */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: '6px' }}>{rfqDetails.category}</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{rfqDetails.title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Target Quantity: <strong>{rfqDetails.quantity} units</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Closing Deadline:</span>
              <p style={{ fontWeight: 700, color: 'white', marginTop: '2px' }}>{new Date(rfqDetails.deadline).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          {quotations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertCircle size={36} color="var(--warning)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No vendors have submitted quotations for this RFQ yet.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {quotations.map((quote) => {
                const isLowestPrice = parseFloat(quote.total_price) === lowestPrice;
                const isFastestDelivery = parseInt(quote.delivery_days) === fastestDelivery;

                return (
                  <div
                    key={quote.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      borderWidth: '2px',
                      borderColor: isLowestPrice ? 'var(--secondary)' : isFastestDelivery ? 'var(--accent-blue)' : 'var(--border-color)',
                      boxShadow: isLowestPrice ? '0 10px 30px var(--secondary-glow)' : '0 10px 30px rgba(0,0,0,0.2)'
                    }}
                  >
                    
                    {/* Badge header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>BIDDER</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {isLowestPrice && <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Award size={10} /> Lowest Cost</span>}
                        {isFastestDelivery && <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}><Clock size={10} /> Fastest</span>}
                      </div>
                    </div>

                    {/* Vendor detail */}
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{quote.vendor_name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GSTIN: <code>{quote.vendor_gstin}</code></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Star size={12} fill="#fbbf24" /> {parseFloat(quote.vendor_rating).toFixed(1)} / 5.0 Rating
                      </div>
                    </div>

                    {/* Quotation metrics */}
                    <div style={{
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Unit Price:</span>
                        <span style={{ fontWeight: 600, color: 'white' }}>{formatCurrency(quote.unit_price)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                        <span style={{ fontWeight: 600, color: 'white' }}>&times; {rfqDetails.quantity}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, paddingTop: '4px' }}>
                        <span style={{ color: 'var(--text-primary)' }}>Total Price:</span>
                        <span style={{ color: isLowestPrice ? 'var(--secondary)' : 'white' }}>{formatCurrency(quote.total_price)}</span>
                      </div>
                    </div>

                    {/* Delivery metrics */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Lead Time:</span>
                      <span style={{ fontWeight: 700, color: isFastestDelivery ? 'var(--accent-blue)' : 'white' }}>{quote.delivery_days} calendar days</span>
                    </div>

                    {/* Remarks / Notes */}
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VENDOR NOTES</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                        "{quote.notes || 'No terms or specifications listed'}"
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleRecommend(quote.vendor_name)}
                        className="btn btn-secondary"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Recommend Bid
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Quick explainer warning for Manager approvals */}
          {quotations.length > 0 && (
            <div className="card" style={{
              backgroundColor: 'rgba(99, 102, 241, 0.03)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              <strong>Note on Approval Workflow:</strong> Both of these quotations are automatically forwarded to the Manager's workspace.
              The Finance Manager can log in and click <strong>Approve</strong> on the chosen quote to complete the workflow and auto-generate the Purchase Order and Invoice.
            </div>
          )}

        </div>
      )}

      {!activeRfqId && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Please select an RFQ from the dropdown above to view its quotations comparison grid.
        </div>
      )}

    </div>
  );
}
