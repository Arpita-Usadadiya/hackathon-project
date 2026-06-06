import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const logs = [
    {
      id: 1,
      action: 'RFQ Created',
      user: 'Procurement Manager',
      timestamp: '2026-06-06 10:00 AM'
    },
    {
      id: 2,
      action: 'Quotation Submitted',
      user: 'Vendor ABC',
      timestamp: '2026-06-06 10:15 AM'
    },
    {
      id: 3,
      action: 'Vendor Approved',
      user: 'Admin',
      timestamp: '2026-06-06 10:30 AM'
    }
  ];

  res.json(logs);
});

export default router;