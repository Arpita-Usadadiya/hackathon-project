import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_vendorbridge_erp_2026';

// POST /login - Authenticate user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // NOTE: A helper implementation is provided below so you can test logging in immediately.
  // Feel free to rewrite, expand, or integrate with database tables.
  try {
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, vendor_id: user.vendor_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, vendor_id: user.vendor_id }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database login error' });
  }
});

// POST /signup - Register user & optional vendor details
router.post('/signup', async (req, res) => {
  // TODO: Create a user account. If user role is 'vendor', register their vendor profile in vendors table and link the vendor_id.
  res.status(501).json({ message: 'Signup endpoint not implemented yet' });
});

// GET /me - Get active session user
router.get('/me', authenticateToken, async (req, res) => {
  // TODO: Get authenticated user details using req.user
  try {
    const userRes = await query('SELECT id, name, email, role, vendor_id FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(userRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
