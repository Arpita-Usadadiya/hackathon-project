import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL LOGS
|--------------------------------------------------------------------------
*/
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        id,
        user_name,
        user_role,
        action,
        details,
        timestamp
      FROM logs
      ORDER BY timestamp DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch logs'
    });
  }
});

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/
router.get('/analytics', authenticateToken, async (req, res) => {
  try {

    const rfqCount = await query(
      `SELECT COUNT(*) FROM rfqs WHERE status='published'`
    );

    const approvalCount = await query(
      `SELECT COUNT(*) FROM quotations WHERE status='submitted'`
    );

    const vendorCount = await query(
      `SELECT COUNT(*) FROM vendors`
    );

    const spendRes = await query(
      `SELECT COALESCE(SUM(grand_total),0) AS total
       FROM purchase_orders`
    );

    res.json({
      summary: {
        activeRfqs: Number(rfqCount.rows[0].count),
        pendingApprovals: Number(approvalCount.rows[0].count),
        activeVendors: Number(vendorCount.rows[0].count),
        totalSpend: Number(spendRes.rows[0].total),
        costSavings: 0
      },
      categorySpend: [],
      monthlySpend: [],
      vendorPerformance: []
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Failed to fetch analytics'
    });
  }
});

export default router;