import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET / - List all pending quotations awaiting approval
router.get('/', authenticateToken, requireRole(['approver', 'admin']), async (req, res) => {
  // TODO: Fetch all submitted quotations for open RFQs
  res.json([]);
});

// POST /:quoteId/action - Approve or Reject a quotation
router.post('/:quoteId/action', authenticateToken, requireRole(['approver', 'admin']), async (req, res) => {
  // TODO: Process approval/rejection. If approved:
  // - Mark target quote as approved, reject others.
  // - Close the RFQ.
  // - Auto-generate unique Purchase Order.
  // - Auto-generate unique Invoice with 18% GST math.
  res.status(501).json({ message: 'Approval action not implemented yet' });
});

export default router;
