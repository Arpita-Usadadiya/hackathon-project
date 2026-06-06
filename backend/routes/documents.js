import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /pos - List Purchase Orders
router.get('/pos', authenticateToken, async (req, res) => {
  // TODO: Fetch POs. Vendors see only their own. Officers/Managers see all.
  res.json([]);
});

// GET /invoices - List Invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  // TODO: Fetch Invoices. Vendors see only their own. Officers/Managers/Admins see all.
  res.json([]);
});

// POST /invoices/:id/pay - Record invoice payment status
router.post('/invoices/:id/pay', authenticateToken, requireRole(['officer', 'approver', 'admin']), async (req, res) => {
  // TODO: Update invoice status to 'paid'
  res.status(501).json({ message: 'Record payment endpoint not implemented yet' });
});

// POST /invoices/:id/email - Simulate sending invoice via email
router.post('/invoices/:id/email', authenticateToken, async (req, res) => {
  // TODO: Mock email delivery, log audit trail, return success message
  res.status(501).json({ message: 'Email document simulation not implemented yet' });
});

export default router;
