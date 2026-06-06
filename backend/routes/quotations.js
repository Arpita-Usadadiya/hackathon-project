import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// GET CURRENT VENDOR'S QUOTATION FOR SPECIFIC RFQ (VENDOR ONLY)
router.get('/myquote/:rfqId', authenticateToken, requireRole(['vendor']), async (req, res) => {
  const { rfqId } = req.params;
  if (!req.user.vendor_id) {
    return res.status(400).json({ error: 'User is not associated with a vendor profile' });
  }

  try {
    const quoteRes = await query(
      'SELECT * FROM quotations WHERE rfq_id = $1 AND vendor_id = $2',
      [rfqId, req.user.vendor_id]
    );
    if (quoteRes.rows.length === 0) {
      return res.json(null);
    }
    res.json(quoteRes.rows[0]);
  } catch (err) {
    console.error('Fetch vendor single quote error:', err);
    res.status(500).json({ error: 'Server error fetching quote details' });
  }
});

// GET QUOTATIONS FOR AN RFQ (OFFICER, APPROVER, ADMIN)
router.get('/rfq/:rfqId', authenticateToken, requireRole(['officer', 'approver', 'admin']), async (req, res) => {
  const { rfqId } = req.params;

  try {
    const quotesRes = await query(
      `SELECT q.*, v.name as vendor_name, v.category as vendor_category,
              v.gstin as vendor_gstin, v.rating as vendor_rating, v.contact_name as vendor_contact
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.rfq_id = $1
       ORDER BY q.total_price ASC`,
      [rfqId]
    );
    res.json(quotesRes.rows);
  } catch (err) {
    console.error('Fetch RFQ quotations error:', err);
    res.status(500).json({ error: 'Server error fetching quotations' });
  }
});

// SUBMIT QUOTATION (VENDOR ONLY)
router.post('/', authenticateToken, requireRole(['vendor']), async (req, res) => {
  const { rfq_id, unit_price, delivery_days, notes } = req.body;

  if (!rfq_id || !unit_price || !delivery_days) {
    return res.status(400).json({ error: 'RFQ ID, unit price, and delivery timeline are required' });
  }

  if (!req.user.vendor_id) {
    return res.status(400).json({ error: 'User is not associated with a vendor profile' });
  }

  try {
    // 1. Check if RFQ exists and is published (open)
    const rfqCheck = await query('SELECT title, quantity, status, deadline FROM rfqs WHERE id = $1', [rfq_id]);
    if (rfqCheck.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const rfq = rfqCheck.rows[0];
    if (rfq.status !== 'published') {
      return res.status(400).json({ error: 'Quotations can only be submitted for published (open) RFQs' });
    }

    // Check deadline
    const today = new Date();
    const deadlineDate = new Date(rfq.deadline);
    if (today > deadlineDate) {
      return res.status(400).json({ error: 'The deadline for submitting quotations has passed' });
    }

    // 2. Check if Vendor is assigned to the RFQ
    const assignmentCheck = await query(
      'SELECT 1 FROM rfq_assignments WHERE rfq_id = $1 AND vendor_id = $2',
      [rfq_id, req.user.vendor_id]
    );
    if (assignmentCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You are not invited to submit a quotation for this RFQ' });
    }

    // 3. Check if quotation already exists for this vendor/RFQ
    const existingQuote = await query(
      'SELECT id FROM quotations WHERE rfq_id = $1 AND vendor_id = $2',
      [rfq_id, req.user.vendor_id]
    );

    let quoteRes;
    const totalPrice = parseFloat(unit_price) * parseInt(rfq.quantity);

    if (existingQuote.rows.length > 0) {
      // Update existing quotation
      quoteRes = await query(
        `UPDATE quotations
         SET unit_price = $1, total_price = $2, delivery_days = $3, notes = $4, status = 'submitted', created_at = CURRENT_TIMESTAMP
         WHERE id = $5 RETURNING *`,
        [unit_price, totalPrice, delivery_days, notes || '', existingQuote.rows[0].id]
      );
      await logAction(
        req.user.id,
        req.user.name,
        req.user.role,
        'Update Quotation',
        `Updated quote for RFQ #${rfq_id} (${rfq.title}). Total: INR ${totalPrice}.`
      );
    } else {
      // Insert new quotation
      quoteRes = await query(
        `INSERT INTO quotations (rfq_id, vendor_id, unit_price, total_price, delivery_days, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'submitted') RETURNING *`,
        [rfq_id, req.user.vendor_id, unit_price, totalPrice, delivery_days, notes || '']
      );
      await logAction(
        req.user.id,
        req.user.name,
        req.user.role,
        'Submit Quotation',
        `Submitted quote for RFQ #${rfq_id} (${rfq.title}). Total: INR ${totalPrice}.`
      );
    }

    res.status(201).json(quoteRes.rows[0]);
  } catch (err) {
    console.error('Submit quotation error:', err);
    res.status(500).json({ error: 'Server error submitting quotation' });
  }
});

// EDIT QUOTATION BY ID (VENDOR ONLY)
router.put('/:id', authenticateToken, requireRole(['vendor']), async (req, res) => {
  const { id } = req.params;
  const { unit_price, delivery_days, notes } = req.body;

  if (!unit_price || !delivery_days) {
    return res.status(400).json({ error: 'Unit price and delivery timeline are required' });
  }

  try {
    // Check if quotation exists and belongs to the vendor
    const quoteCheck = await query('SELECT * FROM quotations WHERE id = $1', [id]);
    if (quoteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quote = quoteCheck.rows[0];
    if (quote.vendor_id !== req.user.vendor_id) {
      return res.status(403).json({ error: 'Forbidden: You cannot edit quotations for other vendors' });
    }

    // Check if RFQ is still open/published
    const rfqCheck = await query('SELECT title, quantity, status FROM rfqs WHERE id = $1', [quote.rfq_id]);
    const rfq = rfqCheck.rows[0];
    if (rfq.status !== 'published') {
      return res.status(400).json({ error: 'You cannot edit quotations for closed or draft RFQs' });
    }

    const totalPrice = parseFloat(unit_price) * parseInt(rfq.quantity);

    const quoteRes = await query(
      `UPDATE quotations
       SET unit_price = $1, total_price = $2, delivery_days = $3, notes = $4, status = 'submitted', created_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [unit_price, totalPrice, delivery_days, notes || '', id]
    );

    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Edit Quotation',
      `Edited quotation ID #${id} for RFQ #${quote.rfq_id}. New Total: INR ${totalPrice}.`
    );

    res.json(quoteRes.rows[0]);
  } catch (err) {
    console.error('Edit quotation error:', err);
    res.status(500).json({ error: 'Server error editing quotation' });
  }
});

export default router;