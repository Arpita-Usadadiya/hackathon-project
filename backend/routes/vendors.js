import express from 'express';
import { query } from '../db.js';
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
  // TODO: Insert a new vendor record in the vendors table
  res.status(501).json({ message: 'Vendor registration not implemented yet' });
});

// PUT /:id/status - Update vendor status (Admin only)
router.put('/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  // TODO: Update vendor status matching parameters
  res.status(501).json({ message: 'Vendor status update not implemented yet' });
});

export default router;
