import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// GET ALL PURCHASE ORDERS (ROLE-BASED)
router.get('/pos', authenticateToken, async (req, res) => {
  try {
    let posRes;
    if (req.user.role === 'vendor') {
      posRes = await query(
        `SELECT po.*, r.title as rfq_title, v.name as vendor_name
         FROM purchase_orders po
         JOIN rfqs r ON po.rfq_id = r.id
         JOIN vendors v ON po.vendor_id = v.id
         WHERE po.vendor_id = $1
         ORDER BY po.created_at DESC`,
        [req.user.vendor_id]
      );
    } else {
      posRes = await query(
        `SELECT po.*, r.title as rfq_title, v.name as vendor_name
         FROM purchase_orders po
         JOIN rfqs r ON po.rfq_id = r.id
         JOIN vendors v ON po.vendor_id = v.id
         ORDER BY po.created_at DESC`
      );
    }
    res.json(posRes.rows);
  } catch (err) {
    console.error('Fetch POs error:', err);
    res.status(500).json({ error: 'Server error fetching purchase orders' });
  }
});

// GET ALL INVOICES (ROLE-BASED)
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    let invoicesRes;
    if (req.user.role === 'vendor') {
      invoicesRes = await query(
        `SELECT inv.*, po.po_number, v.name as vendor_name
         FROM invoices inv
         JOIN purchase_orders po ON inv.po_id = po.id
         JOIN vendors v ON inv.vendor_id = v.id
         WHERE inv.vendor_id = $1
         ORDER BY inv.created_at DESC`,
        [req.user.vendor_id]
      );
    } else {
      invoicesRes = await query(
        `SELECT inv.*, po.po_number, v.name as vendor_name
         FROM invoices inv
         JOIN purchase_orders po ON inv.po_id = po.id
         JOIN vendors v ON inv.vendor_id = v.id
         ORDER BY inv.created_at DESC`
      );
    }
    res.json(invoicesRes.rows);
  } catch (err) {
    console.error('Fetch invoices error:', err);
    res.status(500).json({ error: 'Server error fetching invoices' });
  }
});

// RECORD INVOICE PAYMENT (OFFICER, APPROVER, ADMIN)
router.post('/invoices/:id/pay', authenticateToken, requireRole(['officer', 'approver', 'admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const checkRes = await query('SELECT invoice_number, status FROM invoices WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = checkRes.rows[0];
    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Invoice is already marked as paid' });
    }

    const updateRes = await query(
      `UPDATE invoices SET status = 'paid' WHERE id = $1 RETURNING *`,
      [id]
    );

    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Pay Invoice',
      `Marked invoice ${invoice.invoice_number} as PAID.`
    );

    res.json(updateRes.rows[0]);
  } catch (err) {
    console.error('Record invoice payment error:', err);
    res.status(500).json({ error: 'Server error marking invoice as paid' });
  }
});

// SIMULATE SEND INVOICE VIA EMAIL
router.post('/invoices/:id/email', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { recipientEmail } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ error: 'Recipient email is required' });
  }

  try {
    const invRes = await query(
      `SELECT inv.*, v.name as vendor_name
       FROM invoices inv
       JOIN vendors v ON inv.vendor_id = v.id
       WHERE inv.id = $1`,
      [id]
    );

    if (invRes.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invRes.rows[0];

    // Log the simulation
    await logAction(
      req.user.id,
      req.user.name,
      req.user.role,
      'Email Invoice',
      `Emailed invoice ${invoice.invoice_number} from vendor "${invoice.vendor_name}" to ${recipientEmail}.`
    );

    res.json({
      success: true,
      message: `Invoice ${invoice.invoice_number} has been sent successfully to ${recipientEmail}!`
    });
  } catch (err) {
    console.error('Email invoice error:', err);
    res.status(500).json({ error: 'Server error emailing invoice' });
  }
});

export default router;
