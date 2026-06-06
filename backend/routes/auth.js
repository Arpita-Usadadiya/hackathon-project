import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'supersecret_key_vendorbridge_erp_2026';

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const user = userRes.rows[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendor_id: user.vendor_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    console.error(err);

    res.status(500).json({
      error: 'Database login error'
    });
  }
});

/*
|--------------------------------------------------------------------------
| SIGNUP
|--------------------------------------------------------------------------
*/
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      category,
      gstin,
      contact_name,
      phone,
      address
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Required fields missing'
      });
    }

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let vendorId = null;

    /*
    --------------------------------------------------
    CREATE VENDOR RECORD
    --------------------------------------------------
    */
    if (role === 'vendor') {
      if (
        !category ||
        !gstin ||
        !contact_name ||
        !phone
      ) {
        return res.status(400).json({
          error:
            'Vendor registration requires category, gstin, contact_name and phone'
        });
      }

      const vendorRes = await query(
        `
        INSERT INTO vendors
        (
          name,
          category,
          gstin,
          contact_name,
          email,
          phone,
          address,
          status
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,'active')
        RETURNING id
        `,
        [
          name,
          category,
          gstin,
          contact_name,
          email,
          phone,
          address || ''
        ]
      );

      vendorId = vendorRes.rows[0].id;
    }

    /*
    --------------------------------------------------
    CREATE USER
    --------------------------------------------------
    */
    const userRes = await query(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        vendor_id
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING
      id,
      name,
      email,
      role,
      vendor_id
      `,
      [
        name,
        email,
        passwordHash,
        role,
        vendorId
      ]
    );

    const user = userRes.rows[0];

    /*
    --------------------------------------------------
    CREATE ACTIVITY LOG
    --------------------------------------------------
    */
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
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [
        user.id,
        user.name,
        user.role,
        'User Registered',
        `${user.role} account created`
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Registration failed'
    });
  }
});

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRes = await query(
      `
      SELECT
        id,
        name,
        email,
        role,
        vendor_id
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json(userRes.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Database error'
    });
  }
});

export default router;