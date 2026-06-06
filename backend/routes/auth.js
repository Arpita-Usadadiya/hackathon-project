import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { logAction } from '../utils/logger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_key_vendorbridge_erp_2026';

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

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

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, vendor_id: user.vendor_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAction(user.id, user.name, user.role, 'Login', `User ${user.email} successfully logged in.`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendor_id: user.vendor_id
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password, role, vendorDetails } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  try {
    // Check if user already exists
    const checkUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    let vendorId = null;

    // If role is vendor, register a vendor profile
    if (role === 'vendor') {
      if (!vendorDetails || !vendorDetails.name || !vendorDetails.category || !vendorDetails.gstin) {
        return res.status(400).json({ error: 'Vendor profile details (name, category, GSTIN) are required for vendor accounts' });
      }
      
      if (vendorDetails.gstin.length !== 15) {
        return res.status(400).json({ error: 'GSTIN must be exactly 15 characters' });
      }

      // Insert new vendor profile
      const vendorRes = await query(
        `INSERT INTO vendors (name, category, gstin, contact_name, email, phone, status, address)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7) RETURNING id`,
        [
          vendorDetails.name,
          vendorDetails.category,
          vendorDetails.gstin,
          vendorDetails.contactName || name,
          vendorDetails.email || email,
          vendorDetails.phone || 'N/A',
          vendorDetails.address || ''
        ]
      );
      vendorId = vendorRes.rows[0].id;
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create user
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, role, vendor_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, vendor_id`,
      [name, email, hashedPassword, role, vendorId]
    );

    const newUser = userRes.rows[0];

    // Log the signup
    await logAction(newUser.id, newUser.name, newUser.role, 'Signup', `User ${newUser.email} signed up with role ${newUser.role}.`);

    // Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, vendor_id: newUser.vendor_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// GET CURRENT USER SESSION
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await query(
      `SELECT id, name, email, role, vendor_id FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User session expired or not found' });
    }
    res.json(userRes.rows[0]);
  } catch (err) {
    console.error('Session error:', err);
    res.status(500).json({ error: 'Server error fetching session' });
  }
});

export default router;
