import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { query, getPool } from './db.js';

const schemaPath = path.resolve(process.cwd(), 'schema.sql');

async function seed() {
  console.log('Starting database seeding...');
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await query(schemaSql);
    console.log('Schema created successfully');

    // Create Hashed Passwords
    const passwordHash = bcrypt.hashSync('password123', 10);

    // Insert Vendors
    const vendors = [
      ['Apex Industrial', 'Hardware', '27AAAAA1111A1Z1', 'John Doe', 'apex@industrial.com', '9876543210', 'active', 4.5, '102 Industrial Area, Pune, Maharashtra'],
      ['Zenith Corp', 'Services', '27BBBBB2222B2Z2', 'Alice Smith', 'zenith@corp.com', '9876543211', 'active', 4.2, 'Tech Park Phase 2, Bangalore, Karnataka'],
      ['Matrix Solutions', 'Software', '27CCCCC3333C3Z3', 'Bob Johnson', 'matrix@solutions.com', '9876543212', 'active', 4.8, 'SDF Building, Salt Lake, Kolkata, West Bengal']
    ];

    const vendorIds = [];
    for (const v of vendors) {
      const res = await query(
        `INSERT INTO vendors (name, category, gstin, contact_name, email, phone, status, rating, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        v
      );
      vendorIds.push(res.rows[0].id);
    }
    console.log(`Seeded ${vendorIds.length} vendors`);

    // Insert Users
    const users = [
      ['System Admin', 'admin@vendorbridge.com', passwordHash, 'admin', null],
      ['Procurement Officer', 'officer@vendorbridge.com', passwordHash, 'officer', null],
      ['Finance Manager', 'manager@vendorbridge.com', passwordHash, 'approver', null],
      ['Apex Rep', 'vendor1@vendorbridge.com', passwordHash, 'vendor', vendorIds[0]],
      ['Zenith Rep', 'vendor2@vendorbridge.com', passwordHash, 'vendor', vendorIds[1]],
      ['Matrix Rep', 'vendor3@vendorbridge.com', passwordHash, 'vendor', vendorIds[2]]
    ];

    const userMap = {};
    for (const u of users) {
      const res = await query(
        `INSERT INTO users (name, email, password_hash, role, vendor_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, role, email`,
        u
      );
      const createdUser = res.rows[0];
      userMap[createdUser.email] = createdUser.id;
    }
    console.log('Seeded user accounts');

    // Seed initial RFQ
    const officerId = userMap['officer@vendorbridge.com'];
    const rfqRes = await query(
      `INSERT INTO rfqs (title, description, category, quantity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['Office Laptops Procurement', 'Procurement of 50 enterprise-grade developer laptops (16GB RAM, 512GB SSD).', 'Hardware', 50, '2026-06-30', 'published', officerId]
    );
    const rfqId = rfqRes.rows[0].id;

    // Assign RFQ to Vendor 1 and 2
    await query(`INSERT INTO rfq_assignments (rfq_id, vendor_id) VALUES ($1, $2)`, [rfqId, vendorIds[0]]);
    await query(`INSERT INTO rfq_assignments (rfq_id, vendor_id) VALUES ($1, $2)`, [rfqId, vendorIds[1]]);
    console.log('Seeded RFQ and assignments');

    // Seed Quotations
    // Vendor 1 Quote (Apex Industrial)
    await query(
      `INSERT INTO quotations (rfq_id, vendor_id, unit_price, total_price, delivery_days, notes, status)
       VALUES ($1, $2, 55000.00, 2750000.00, 10, 'Includes 3 years onsite warranty. Delivery in batches of 10.', 'submitted')`,
      [rfqId, vendorIds[0]]
    );

    // Vendor 2 Quote (Zenith Corp)
    await query(
      `INSERT INTO quotations (rfq_id, vendor_id, unit_price, total_price, delivery_days, notes, status)
       VALUES ($1, $2, 53500.00, 2675000.00, 15, 'Standard warranty. 15 days delivery lead time.', 'submitted')`,
      [rfqId, vendorIds[1]]
    );
    console.log('Seeded quotations');

    // Seed Audit Logs
    const adminId = userMap['admin@vendorbridge.com'];
    const vendor1Id = userMap['vendor1@vendorbridge.com'];
    const vendor2Id = userMap['vendor2@vendorbridge.com'];

    const systemLogs = [
      [adminId, 'System Admin', 'admin', 'System initialization', 'Database tables created and default entities seeded.'],
      [officerId, 'Procurement Officer', 'officer', 'Created RFQ', 'Created RFQ #1: Office Laptops Procurement.'],
      [vendor1Id, 'Apex Rep', 'vendor', 'Submitted Quotation', 'Submitted quote of INR 2,750,000 for RFQ #1.'],
      [vendor2Id, 'Zenith Rep', 'vendor', 'Submitted Quotation', 'Submitted quote of INR 2,675,000 for RFQ #1.']
    ];

    for (const log of systemLogs) {
      await query(
        `INSERT INTO logs (user_id, user_name, user_role, action, details)
         VALUES ($1, $2, $3, $4, $5)`,
        log
      );
    }
    console.log('Seeded activity logs');

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    getPool().end();
  }
}

seed();
