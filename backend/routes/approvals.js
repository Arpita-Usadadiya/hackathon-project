import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();

// GET ALL PENDING APPROVALS (MANAGER / APPROVER ONLY)
router.get('/', authenticateToken, requireRole(['approver', 'admin']), async (req, res) => {
  try {
    // Return all submitted quotations that need approval, along with RFQ and Vendor details
    const approvalsRes = await query(
      `SELECT q.*, r.title as rfq_title, r.quantity as rfq_quantity,
              v.name as vendor_name, v.rating as vendor_rating
       FROM quotations q
       JOIN rfqs r ON q.rfq_id = r.id
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.status = 'submitted' AND r.status = 'published'
       ORDER BY q.created_at ASC`
    );
    res.json(approvalsRes.rows);
  } catch (err) {
    console.error('Fetch pending approvals error:', err);
    res.status(500).json({ error: 'Server error fetching approvals' });
  }
});

// APPROVE OR REJECT A QUOTATION (MANAGER / APPROVER ONLY)
router.post('/:quoteId/action', authenticateToken, requireRole(['approver', 'admin']), async (req, res) => {
  const { quoteId } = req.params;
  const { action, remarks } = req.body; // action: 'approve' or 'reject'

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
  }

  try {
    // 1. Fetch quotation and related RFQ details
    const quoteRes = await query(
      `SELECT q.*, r.title as rfq_title, r.quantity as rfq_quantity, r.status as rfq_status,
              v.name as vendor_name, v.email as vendor_email
       FROM quotations q
       JOIN rfqs r ON q.rfq_id = r.id
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.id = $1`,
      [quoteId]
    );

    if (quoteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const quote = quoteRes.rows[0];

    if (quote.rfq_status !== 'published') {
      return res.status(400).json({ error: 'RFQ is not in a published (open) state' });
    }

    await query('BEGIN');

    if (action === 'approve') {
      // A. Update current quotation status to approved
      await query(`UPDATE quotations SET status = 'approved' WHERE id = $1`, [quoteId]);

      // B. Update all other quotations for the same RFQ to rejected
      await query(
        `UPDATE quotations SET status = 'rejected' WHERE rfq_id = $1 AND id != $2`,
        [quote.rfq_id, quoteId]
      );

      // C. Update the RFQ status to closed
      await query(`UPDATE rfqs SET status = 'closed' WHERE id = $1`, [quote.rfq_id]);

      // D. Generate PO Number
      const poCountRes = await query('SELECT COUNT(*) FROM purchase_orders');
      const poCount = parseInt(poCountRes.rows[0].count);
      const poNumber = `VB-PO-2026-${String(poCount + 1).padStart(4, '0')}`;

      // Calculations (18% GST)
      const totalAmount = parseFloat(quote.total_price);
      const taxAmount = totalAmount * 0.18;
      const grandTotal = totalAmount + taxAmount;

      // Insert Purchase Order
      const poRes = await query(
        `INSERT INTO purchase_orders (po_number, rfq_id, quotation_id, vendor_id, total_amount, tax_amount, grand_total, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'issued') RETURNING id`,
        [poNumber, quote.rfq_id, quoteId, quote.vendor_id, totalAmount, taxAmount, grandTotal]
      );
      const poId = poRes.rows[0].id;

      // E. Generate Invoice Number
      const invCountRes = await query('SELECT COUNT(*) FROM invoices');
      const invCount = parseInt(invCountRes.rows[0].count);
      const invoiceNumber = `VB-INV-2026-${String(invCount + 1).padStart(4, '0')}`;

      // Set Due Date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      // Insert Invoice
      await query(
        `INSERT INTO invoices (invoice_number, po_id, po_number, vendor_id, total_amount, tax_amount, grand_total, status, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'issued', $8)`,
        [invoiceNumber, poId, poNumber, quote.vendor_id, totalAmount, taxAmount, grandTotal, 'issued', dueDateStr]
      );

      await query('COMMIT');

      // Log actions
      await logAction(
        req.user.id,
        req.user.name,
        req.user.role,
        'Approve Quotation',
        `Approved quotation ID #${quoteId} from "${quote.vendor_name}" for RFQ #${quote.rfq_id} (${quote.rfq_title}). Remarks: "${remarks || 'None'}". PO ${poNumber} and Invoice ${invoiceNumber} created.`
      );

      res.json({ message: 'Quotation approved, PO and Invoice generated successfully', poNumber, invoiceNumber });
    } else {
      // Reject Action
      await query(`UPDATE quotations SET status = 'rejected' WHERE id = $1`, [quoteId]);
      await query('COMMIT');

      await logAction(
        req.user.id,
        req.user.name,
        req.user.role,
        'Reject Quotation',
        `Rejected quotation ID #${quoteId} from "${quote.vendor_name}" for RFQ #${quote.rfq_id} (${quote.rfq_title}). Remarks: "${remarks || 'None'}".`
      );

      res.json({ message: 'Quotation rejected successfully' });
    }
  } catch (err) {
    await query('ROLLBACK');
    console.error('Approval action error:', err);
    res.status(500).json({ error: 'Server error processing approval action' });
  }
});

export default router;
