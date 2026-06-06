import express from 'express';
import PDFDocument from 'pdfkit';
import { query } from '../db.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PURCHASE ORDER PDF
|--------------------------------------------------------------------------
*/
router.get('/po/:poId', async (req, res) => {
  try {
    const { poId } = req.params;

    const result = await query(
      `
      SELECT
        po.*,
        v.name AS vendor_name,
        v.email,
        v.phone,
        v.gstin,
        r.title AS rfq_title,
        r.description AS rfq_description
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN rfqs r ON po.rfq_id = r.id
      WHERE po.id = $1
      `,
      [poId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Purchase Order not found'
      });
    }

    const po = result.rows[0];

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${po.po_number}.pdf`
    );

    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({
      margin: 50
    });

    doc.pipe(res);

    doc.fontSize(24).text('PURCHASE ORDER', {
      align: 'center'
    });

    doc.moveDown();

    doc.text(`PO Number : ${po.po_number}`);
    doc.text(`Date : ${new Date(po.created_at).toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(16).text('Vendor Information');

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Vendor : ${po.vendor_name}`);
    doc.text(`Email : ${po.email}`);
    doc.text(`Phone : ${po.phone}`);
    doc.text(`GSTIN : ${po.gstin}`);

    doc.moveDown();

    doc.fontSize(16).text('RFQ Details');

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Title : ${po.rfq_title}`);
    doc.text(`Description : ${po.rfq_description}`);

    doc.moveDown();

    doc.fontSize(16).text('Amount Details');

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Subtotal : ₹${po.total_amount}`);
    doc.text(`GST (18%) : ₹${po.tax_amount}`);
    doc.text(`Grand Total : ₹${po.grand_total}`);

    doc.end();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to generate PO PDF'
    });
  }
});

/*
|--------------------------------------------------------------------------
| INVOICE PDF
|--------------------------------------------------------------------------
*/
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const result = await query(
      `
      SELECT
        i.*,
        v.name AS vendor_name,
        v.email,
        v.phone,
        v.gstin
      FROM invoices i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.id = $1
      `,
      [invoiceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoice.invoice_number}.pdf`
    );

    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({
      margin: 50
    });

    doc.pipe(res);

    doc.fontSize(24).text('TAX INVOICE', {
      align: 'center'
    });

    doc.moveDown();

    doc.text(`Invoice Number : ${invoice.invoice_number}`);
    doc.text(`PO Number : ${invoice.po_number}`);
    doc.text(`Date : ${new Date(invoice.created_at).toLocaleDateString()}`);
    doc.text(`Due Date : ${new Date(invoice.due_date).toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(16).text('Vendor Information');

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Vendor : ${invoice.vendor_name}`);
    doc.text(`Email : ${invoice.email}`);
    doc.text(`Phone : ${invoice.phone}`);
    doc.text(`GSTIN : ${invoice.gstin}`);

    doc.moveDown();

    doc.fontSize(16).text('Billing Summary');

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Subtotal : ₹${invoice.total_amount}`);
    doc.text(`GST (18%) : ₹${invoice.tax_amount}`);
    doc.text(`Grand Total : ₹${invoice.grand_total}`);

    doc.moveDown();

    doc.text(`Status : ${invoice.status}`);

    doc.end();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to generate Invoice PDF'
    });
  }
});

export default router;