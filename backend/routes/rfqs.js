import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// GET ALL RFQS (ROLE-BASED FILTERING)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let rfqsRes;
    if (req.user.role === 'vendor') {
      if (!req.user.vendor_id) {
        return res.status(400).json({ error: 'User is not associated with a vendor profile' });
      }
      // Vendors only see non-draft RFQs assigned to them
      rfqsRes = await query(
        `SELECT r.*, q.status as quote_status, q.id as quote_id
         FROM rfqs r
         JOIN rfq_assignments a ON r.id = a.rfq_id
         LEFT JOIN quotations q ON r.id = q.rfq_id AND q.vendor_id = $1
         WHERE a.vendor_id = $1 AND r.status != 'draft'
         ORDER BY r.created_at DESC`,
        [req.user.vendor_id]
      );
    } else {
      // Officer, Approver, Admin see all RFQs
      rfqsRes = await query('SELECT * FROM rfqs ORDER BY created_at DESC');
    }
    res.json(rfqsRes.rows);
  } catch (err) {
    console.error('Fetch RFQs error:', err);
    res.status(500).json({ error: 'Server error fetching RFQs' });
  }
});

// CREATE NEW RFQ (OFFICER ONLY)
router.post('/', authenticateToken, requireRole(['officer']), async (req, res) => {
  const { title, description, category, quantity, deadline, vendorIds, status } = req.body;

  if (!title || !category || !quantity || !deadline || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({ error: 'Title, category, quantity, deadline, and assigned vendors are required' });
  }

  const rfqStatus = status || 'draft'; // defaults to draft

  try {
    // Start transactional query
    await query('BEGIN');

    const insertRfqQuery = `
      INSERT INTO rfqs (title, description, category, quantity, deadline, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const rfqRes = await query(insertRfqQuery, [
      title,
      description || '',
      category,
      quantity,
      deadline,
      rfqStatus,
      req.user.id
    ]);

    const newRfq = rfqRes.rows[0];

    // Insert assignments
    for (const vendorId of vendorIds) {
      await query(
        `INSERT INTO rfq_assignments (rfq_id, vendor_id) VALUES ($1, $2)`,
        [newRfq.id, vendorId]
      );
    }

    await query('COMMIT');

    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Create RFQ',
      `Created RFQ #${newRfq.id}: "${title}" (Status: ${rfqStatus}). Assigned to ${vendorIds.length} vendors.`
    );

    res.status(201).json(newRfq);
  } catch (err) {
    await query('ROLLBACK');
    console.error('Create RFQ error:', err);
    res.status(500).json({ error: 'Server error creating RFQ' });
  }
});

// GET SINGLE RFQ DETAILS
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Verify access if vendor
    if (req.user.role === 'vendor') {
      const accessCheck = await query(
        `SELECT 1 FROM rfq_assignments WHERE rfq_id = $1 AND vendor_id = $2`,
        [id, req.user.vendor_id]
      );
      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden: You are not assigned to this RFQ' });
      }
    }

    const rfqRes = await query(
      `SELECT r.*, u.name as creator_name
       FROM rfqs r
       JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (rfqRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const rfq = rfqRes.rows[0];

    // Get assigned vendors details
    const vendorsRes = await query(
      `SELECT v.id, v.name, v.category, v.contact_name, v.email, v.phone, v.rating
       FROM vendors v
       JOIN rfq_assignments a ON v.id = a.vendor_id
       WHERE a.rfq_id = $1`,
      [id]
    );

    rfq.assignedVendors = vendorsRes.rows;

    res.json(rfq);
  } catch (err) {
    console.error('Fetch RFQ details error:', err);
    res.status(500).json({ error: 'Server error fetching RFQ details' });
  }
});

// CLOSE RFQ (OFFICER ONLY)
router.post('/:id/close', authenticateToken, requireRole(['officer']), async (req, res) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT title, status FROM rfqs WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const rfq = checkRes.rows[0];
    if (rfq.status === 'closed') {
      return res.status(400).json({ error: 'RFQ is already closed' });
    }

    const rfqRes = await query(
      `UPDATE rfqs SET status = 'closed' WHERE id = $1 RETURNING *`,
      [id]
    );

    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Close RFQ',
      `Closed RFQ #${id}: "${rfq.title}".`
    );

    res.json(rfqRes.rows[0]);
  } catch (err) {
    console.error('Close RFQ error:', err);
    res.status(500).json({ error: 'Server error closing RFQ' });
  }
});

export default router;
