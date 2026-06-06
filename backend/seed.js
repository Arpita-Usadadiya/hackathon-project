import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { query, getPool } from './db.js';

const schemaPath = path.resolve(process.cwd(), 'schema.sql');

async function seed() {
  console.log('Starting boilerplate database seeding...');
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await query(schemaSql);
    console.log('Schema tables created successfully');

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

    for (const u of users) {
      await query(
        `INSERT INTO users (name, email, password_hash, role, vendor_id)
         VALUES ($1, $2, $3, $4, $5)`,
        u
      );
    }
    console.log('Seeded testing accounts');
    console.log('Boilerplate database seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    getPool().end();
  }
}

seed();
