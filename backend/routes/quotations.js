import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /myquote/:rfqId - Get active vendor's own quotation for an RFQ
router.get('/myquote/:rfqId', authenticateToken, requireRole(['vendor']), async (req, res) => {
  // TODO: Fetch vendor's quote for specific RFQ
  res.json(null);
});

// GET /rfq/:rfqId - Get all quotations submitted for an RFQ
router.get('/rfq/:rfqId', authenticateToken, requireRole(['officer', 'approver', 'admin']), async (req, res) => {
  // TODO: List all bids for side-by-side comparison
  res.json([]);
});

// POST / - Submit a bid quotation
router.post('/', authenticateToken, requireRole(['vendor']), async (req, res) => {
  // TODO: Insert a quotation (or update if already exists), validating deadline and assignment
  res.status(501).json({ message: 'Quotation submission not implemented yet' });
});

// PUT /:id - Edit an existing quotation
router.put('/:id', authenticateToken, requireRole(['vendor']), async (req, res) => {
  // TODO: Edit quotation unit_price and delivery_days
  res.status(501).json({ message: 'Quotation edit not implemented yet' });
});

export default router;
