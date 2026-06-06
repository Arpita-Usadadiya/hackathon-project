import express from 'express';
import { query } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET SYSTEM AUDIT LOGS (ROLE-BASED)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let logsRes;
    if (req.user.role === 'vendor') {
      // Vendors only see logs related to their own actions
      logsRes = await query(
        `SELECT * FROM logs
         WHERE user_id = $1
         ORDER BY timestamp DESC
         LIMIT 100`,
        [req.user.id]
      );
    } else {
      // Officers, Approvers, Admins see all logs
      logsRes = await query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 200');
    }
    res.json(logsRes.rows);
  } catch (err) {
    console.error('Fetch logs error:', err);
    res.status(500).json({ error: 'Server error fetching audit logs' });
  }
});

// GET ANALYTICS DATA (OFFICER, APPROVER, ADMIN, OR GENERAL SUMMARY FOR DASHBOARDS)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // 1. Dashboard summary counters
    const activeRfqsCount = await query(`SELECT COUNT(*) FROM rfqs WHERE status = 'published'`);
    const pendingApprovalsCount = await query(
      `SELECT COUNT(*) FROM quotations q JOIN rfqs r ON q.rfq_id = r.id WHERE q.status = 'submitted' AND r.status = 'published'`
    );
    const activeVendorsCount = await query(`SELECT COUNT(*) FROM vendors WHERE status = 'active'`);
    const totalSpendRes = await query(`SELECT SUM(grand_total) FROM purchase_orders`);

    // 2. Spending by Category (Hardware, Software, Services, Office etc.)
    const categorySpendRes = await query(
      `SELECT r.category, SUM(po.grand_total) as value
       FROM purchase_orders po
       JOIN rfqs r ON po.rfq_id = r.id
       GROUP BY r.category`
    );

    // 3. Monthly procurement trends (last 6 months)
    const monthlySpendRes = await query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
              SUM(grand_total) as value,
              MIN(created_at) as sort_date
       FROM purchase_orders
       GROUP BY TO_CHAR(created_at, 'Mon YYYY')
       ORDER BY sort_date ASC
       LIMIT 6`
    );

    // 4. Vendor Performance List (score based on rating, cost effectiveness, etc.)
    const vendorPerformanceRes = await query(
      `SELECT v.id, v.name, v.category, v.rating,
              COUNT(po.id) as orders_completed,
              COALESCE(SUM(po.grand_total), 0) as total_business
       FROM vendors v
       LEFT JOIN purchase_orders po ON v.id = po.vendor_id
       GROUP BY v.id, v.name, v.category, v.rating
       ORDER BY v.rating DESC`
    );

    // 5. Calculate Cost Savings (Difference between maximum bid price and approved bid price for same RFQ)
    const savingsRes = await query(
      `SELECT COALESCE(SUM(savings.saving), 0) as total_savings
       FROM (
         SELECT (MAX(q.total_price) - MIN(q.total_price)) as saving
         FROM quotations q
         JOIN rfqs r ON q.rfq_id = r.id
         WHERE r.status = 'closed'
         GROUP BY q.rfq_id
         HAVING COUNT(q.id) > 1
       ) savings`
    );

    res.json({
      summary: {
        activeRfqs: parseInt(activeRfqsCount.rows[0].count),
        pendingApprovals: parseInt(pendingApprovalsCount.rows[0].count),
        activeVendors: parseInt(activeVendorsCount.rows[0].count),
        totalSpend: parseFloat(totalSpendRes.rows[0].sum || 0),
        costSavings: parseFloat(savingsRes.rows[0].total_savings || 0)
      },
      categorySpend: categorySpendRes.rows.map(row => ({
        category: row.category,
        value: parseFloat(row.value)
      })),
      monthlySpend: monthlySpendRes.rows.map(row => ({
        month: row.month,
        value: parseFloat(row.value)
      })),
      vendorPerformance: vendorPerformanceRes.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        rating: parseFloat(row.rating),
        orders: parseInt(row.orders_completed),
        business: parseFloat(row.total_business)
      }))
    });
  } catch (err) {
    console.error('Fetch analytics error:', err);
    res.status(500).json({ error: 'Server error generating reports and analytics' });
  }
});

export default router;
