import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  requireRole(['approver', 'admin']),
  async (req, res) => {
    try {
      const result = await query(
        `
        SELECT
          q.id,
          q.rfq_id,
          q.vendor_id,
          q.unit_price,
          q.total_price,
          q.delivery_days,
          q.notes,
          q.status,
          q.created_at,

          r.title AS rfq_title,
          r.category,

          v.name AS vendor_name,
          v.gstin,
          v.email

        FROM quotations q
        JOIN rfqs r ON q.rfq_id = r.id
        JOIN vendors v ON q.vendor_id = v.id
        WHERE q.status = 'submitted'
        ORDER BY q.created_at DESC
        `
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'Failed to fetch quotations',
      });
    }
  }
);


router.post(
  '/:quoteId/action',
  authenticateToken,
  requireRole(['approver', 'admin']),
  async (req, res) => {
    const { quoteId } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Action must be approve or reject',
      });
    }

    try {
     
      const quoteRes = await query(
        `
        SELECT
          q.*,
          r.title AS rfq_title,
          r.quantity
        FROM quotations q
        JOIN rfqs r ON q.rfq_id = r.id
        WHERE q.id = $1
        `,
        [quoteId]
      );

      if (quoteRes.rows.length === 0) {
        return res.status(404).json({
          error: 'Quotation not found',
        });
      }

      const quotation = quoteRes.rows[0];

      if (action === 'reject') {
        await query(
          `
          UPDATE quotations
          SET status='rejected'
          WHERE id=$1
          `,
          [quoteId]
        );

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
            'Quotation Rejected',
            `Quotation #${quoteId} rejected`,
          ]
        );

        return res.json({
          success: true,
          message: 'Quotation rejected successfully',
        });
      }

      // Approve selected quotation
      await query(
        `
        UPDATE quotations
        SET status='approved'
        WHERE id=$1
        `,
        [quoteId]
      );

      // Reject all competing quotations
      await query(
        `
        UPDATE quotations
        SET status='rejected'
        WHERE rfq_id=$1
        AND id<>$2
        `,
        [quotation.rfq_id, quoteId]
      );

      // Close RFQ
      await query(
        `
        UPDATE rfqs
        SET status='closed'
        WHERE id=$1
        `,
        [quotation.rfq_id]
      );

      const subtotal = Number(quotation.total_price);
      const taxAmount = Number((subtotal * 0.18).toFixed(2));
      const grandTotal = Number((subtotal + taxAmount).toFixed(2));

      const poCountRes = await query(
        `
        SELECT COUNT(*) AS total
        FROM purchase_orders
        `
      );

      const poSequence =
        String(Number(poCountRes.rows[0].total) + 1).padStart(4, '0');

      const poNumber = `PO-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', '')}-${poSequence}`;


      const poRes = await query(
        `
        INSERT INTO purchase_orders
        (
          po_number,
          rfq_id,
          quotation_id,
          vendor_id,
          total_amount,
          tax_amount,
          grand_total
        )
        VALUES($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          poNumber,
          quotation.rfq_id,
          quotation.id,
          quotation.vendor_id,
          subtotal,
          taxAmount,
          grandTotal,
        ]
      );

      const purchaseOrder = poRes.rows[0];

      const invoiceCountRes = await query(
        `
        SELECT COUNT(*) AS total
        FROM invoices
        `
      );

      const invoiceSequence =
        String(Number(invoiceCountRes.rows[0].total) + 1).padStart(4, '0');

      const invoiceNumber = `INV-${new Date()
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', '')}-${invoiceSequence}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceRes = await query(
        `
        INSERT INTO invoices
        (
          invoice_number,
          po_id,
          po_number,
          vendor_id,
          total_amount,
          tax_amount,
          grand_total,
          status,
          due_date
        )
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          invoiceNumber,
          purchaseOrder.id,
          poNumber,
          quotation.vendor_id,
          subtotal,
          taxAmount,
          grandTotal,
          'issued',
          dueDate,
        ]
      );

      const invoice = invoiceRes.rows[0];

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
          'Quotation Approved',
          `Quotation #${quotation.id} approved. PO=${poNumber}, Invoice=${invoiceNumber}`,
        ]
      );

      res.json({
        success: true,
        message: 'Quotation approved successfully',
        quotation_id: quotation.id,
        po: purchaseOrder,
        invoice,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: 'Approval process failed',
      });
    }
  }
);

export default router;