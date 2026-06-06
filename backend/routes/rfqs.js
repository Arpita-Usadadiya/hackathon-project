import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET / - List all RFQs
router.get('/', authenticateToken, async (req, res) => {
  // TODO: Fetch RFQs. Vendors should only see RFQs assigned to them. Officers see all.
  res.json([]);
});

// POST / - Create a new RFQ and assign to vendors
router.post('/', authenticateToken, requireRole(['officer']), async (req, res) => {
  // TODO: Insert RFQ and insert mapping rows inside rfq_assignments table (use database transactions)
  res.status(501).json({ message: 'RFQ creation not implemented yet' });
});

// GET /:id - Retrieve detailed specifications of an RFQ
router.get('/:id', authenticateToken, async (req, res) => {
  // TODO: Fetch single RFQ details, including lists of assigned vendors
  res.status(501).json({ message: 'RFQ details lookup not implemented yet' });
});

// POST /:id/close - Close an RFQ from bidding
router.post('/:id/close', authenticateToken, requireRole(['officer']), async (req, res) => {
  // TODO: Change RFQ status to 'closed'
  res.status(501).json({ message: 'RFQ closing not implemented yet' });
});

export default router;
