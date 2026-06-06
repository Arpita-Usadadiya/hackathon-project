import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PURCHASE ORDERS LIST
|--------------------------------------------------------------------------
*/
router.get('/pos', authenticateToken, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'vendor') {
      result = await query(
        `
        SELECT *
        FROM purchase_orders
        WHERE vendor_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.vendor_id]
      );
    } else {
      result = await query(
        `
        SELECT *
        FROM purchase_orders
        ORDER BY created_at DESC
        `
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to fetch purchase orders'
    });
  }
});

/*
|--------------------------------------------------------------------------
| INVOICE LIST
|--------------------------------------------------------------------------
*/
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'vendor') {
      result = await query(
        `
        SELECT *
        FROM invoices
        WHERE vendor_id = $1
        ORDER BY created_at DESC
        `,
        [req.user.vendor_id]
      );
    } else {
      result = await query(
        `
        SELECT *
        FROM invoices
        ORDER BY created_at DESC
        `
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch invoices'
    });
  }
});

/*
|--------------------------------------------------------------------------
| MARK INVOICE PAID
|--------------------------------------------------------------------------
*/
router.post(
  '/invoices/:id/pay',
  authenticateToken,
  requireRole(['officer', 'approver', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const invoiceRes = await query(
        `
        UPDATE invoices
        SET status='paid'
        WHERE id=$1
        RETURNING *
        `,
        [id]
      );

      if (invoiceRes.rows.length === 0) {
        return res.status(404).json({
          error: 'Invoice not found'
        });
      }

      await query(
        `
        INSERT INTO logs
        (
          user_id,
          user_name,
          user_role,
          action,
          details
        )
        VALUES($1,$2,$3,$4,$5)
        `,
        [
          req.user.id,
          req.user.name,
          req.user.role,
          'Invoice Paid',
          `Invoice ID ${id} marked as paid`
        ]
      );

      res.json({
        success: true,
        message: 'Invoice marked as paid',
        invoice: invoiceRes.rows[0]
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: 'Failed to update invoice'
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| EMAIL INVOICE
|--------------------------------------------------------------------------
*/
router.post(
  '/invoices/:id/email',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const invoiceRes = await query(
        `
        SELECT
          i.*,
          v.name AS vendor_name,
          v.email
        FROM invoices i
        JOIN vendors v
        ON i.vendor_id = v.id
        WHERE i.id = $1
        `,
        [id]
      );

      if (invoiceRes.rows.length === 0) {
        return res.status(404).json({
          error: 'Invoice not found'
        });
      }

      const invoice = invoiceRes.rows[0];

      /*
      --------------------------------------------------
      Mock Email Sending
      --------------------------------------------------
      */

      console.log(`
      ===========================================
      EMAIL SENT
      ===========================================
      To: ${invoice.email}
      Invoice: ${invoice.invoice_number}
      Amount: ₹${invoice.grand_total}
      ===========================================
      `);

      await query(
        `
        INSERT INTO logs
        (
          user_id,
          user_name,
          user_role,
          action,
          details
        )
        VALUES($1,$2,$3,$4,$5)
        `,
        [
          req.user.id,
          req.user.name,
          req.user.role,
          'Invoice Emailed',
          `Invoice ${invoice.invoice_number} emailed to ${invoice.email}`
        ]
      );

      res.json({
        success: true,
        message: `Invoice emailed successfully to ${invoice.email}`
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: 'Failed to email invoice'
      });
    }
  }
);

export default router;