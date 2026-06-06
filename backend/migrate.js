import fs from 'fs';
import path from 'path';
import { query, getPool } from './db.js';

const sql = fs.readFileSync(
  path.resolve(process.cwd(), 'migrations/add_vendor_ratings.sql'),
  'utf8'
);

try {
  await query(sql);
  console.log('✓ Migration complete: vendor_ratings table created');
} catch (err) {
  if (err.message.includes('already exists')) {
    console.log('✓ Table already exists — skipping');
  } else {
    console.error('Migration failed:', err.message);
  }
} finally {
  getPool().end();
}
