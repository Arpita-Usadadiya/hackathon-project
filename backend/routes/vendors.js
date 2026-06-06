import express from 'express';
import { query } from '../db.js';
import { logAction } from '../utils/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET / - List all vendors
router.get('/', authenticateToken, async (req, res) => {
  const { category, status, search } = req.query;
  let queryText = 'SELECT * FROM vendors WHERE 1=1';
  const queryParams = [];

  if (category) {
    queryParams.push(category);
    queryText += ` AND category = $${queryParams.length}`;
  }

  if (status) {
    queryParams.push(status);
    queryText += ` AND status = $${queryParams.length}`;
  }

  if (search) {
    queryParams.push(`%${search}%`);
    queryText += ` AND (name ILIKE $${queryParams.length} OR contact_name ILIKE $${queryParams.length})`;
  }

  queryText += ' ORDER BY name ASC';

  try {
    const vendorsRes = await query(queryText, queryParams);
    res.json(vendorsRes.rows);
  } catch (err) {
    console.error('Fetch vendors error:', err);
    res.status(500).json({ error: 'Server error fetching vendors' });
  }
});

// POST / - Register new vendor
router.post('/', authenticateToken, async (req, res) => {
  const { name, category, gstin, contact_name, email, phone, address } = req.body;

  if (!name || !category || !gstin || !contact_name || !email || !phone) {
    return res.status(400).json({ error: 'Name, category, GSTIN, contact name, email, and phone are required' });
  }

  if (gstin.length !== 15) {
    return res.status(400).json({ error: 'GSTIN must be exactly 15 characters' });
  }

  try {
    const vendorRes = await query(
      `INSERT INTO vendors (name, category, gstin, contact_name, email, phone, status, rating, address)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', 5.0, $7) RETURNING *`,
      [name, category, gstin, contact_name, email, phone, address || '']
    );

    const newVendor = vendorRes.rows[0];

    // Log action
    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Register Vendor',
      `Registered vendor: ${name} (GSTIN: ${gstin}).`
    );

    res.status(201).json(newVendor);
  } catch (err) {
    console.error('Register vendor error:', err);
    res.status(500).json({ error: 'Server error registering vendor' });
  }
});

// PUT /:id/status - Update vendor status (Admin only)
router.put('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (active, pending, suspended) is required' });
  }

  try {
    const checkRes = await query('SELECT name FROM vendors WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendorName = checkRes.rows[0].name;

    const vendorRes = await query(
      `UPDATE vendors SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Update Vendor Status',
      `Updated vendor ${vendorName} status to ${status}.`
    );

    res.json(vendorRes.rows[0]);
  } catch (err) {
    console.error('Update vendor status error:', err);
    res.status(500).json({ error: 'Server error updating vendor status' });
  }
});

export default router;