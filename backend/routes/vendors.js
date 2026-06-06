import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET / - List all vendors
router.get('/', authenticateToken, async (req, res) => {
  // TODO: Implement vendor query, supporting status, category filters and text searches
  res.json([]);
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
