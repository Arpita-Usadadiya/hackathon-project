import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Edit, DollarSign, Clock } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function Quotations({ rfq, user, onSubmissionSuccess }) {
  const [unitPrice, setUnitPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [existingQuote, setExistingQuote] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQuoteDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/quotations/myquote/${rfq.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setExistingQuote(data);
        setUnitPrice(data.unit_price);
        setDeliveryDays(data.delivery_days);
        setNotes(data.notes || '');
      }
    } catch (err) {
      console.error('Error fetching existing quotation details:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchQuoteDetails();
  }, [rfq.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (parseFloat(unitPrice) <= 0 || parseInt(deliveryDays) <= 0) {
      setError('Unit price and delivery timeline must be positive values.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rfq_id: rfq.id,
          unit_price: parseFloat(unitPrice),
          delivery_days: parseInt(deliveryDays),
          notes
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quotation');
      }

      setSuccess(existingQuote ? 'Quotation updated successfully!' : 'Quotation submitted successfully!');
      setExistingQuote(data);
      if (onSubmissionSuccess) {
        setTimeout(() => {
          onSubmissionSuccess();
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Fetching quotation details...</p>;
  }

  const calculatedTotal = parseFloat(unitPrice || 0) * parseInt(rfq.quantity);

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
      <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {existingQuote ? <Edit size={20} color="var(--primary)" /> : <Send size={20} color="var(--primary)" />}
        {existingQuote ? 'Update Price Bid' : 'Submit Quotation Bid'}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
        {existingQuote 
          ? 'You have already submitted a quotation. You can modify and re-submit your bid below before the deadline.'
          : 'You are invited to submit a quote. Enter your unit pricing and delivery capabilities below.'}
      </p>

      {error && <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: '0.85rem', color: '#fb7185', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
      {success && <div className="card" style={{ borderLeft: '4px solid var(--secondary)', padding: '0.85rem', color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.85rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> Unit Price (INR)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-control"
              placeholder="0.00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Delivery Timeline (Days)</label>
            <input
              type="number"
              min="1"
              className="form-control"
              placeholder="e.g. 10"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Dynamic calculations card */}
        {unitPrice && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Calculation:</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                {formatCurrency(parseFloat(unitPrice))} &times; {rfq.quantity} units
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Bid Price:</span>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', marginTop: '2px' }}>
                {formatCurrency(calculatedTotal)}
              </p>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Quotation Notes / Remarks (Optional)</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Warranty coverage details, shipping terms, bulk discounts..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
          {loading ? 'Submitting...' : existingQuote ? (
            <>
              <Edit size={16} /> Update Bid
            </>
          ) : (
            <>
              <Send size={16} /> Submit Bid
            </>
          )}
        </button>
      </form>
    </div>
  );
}
