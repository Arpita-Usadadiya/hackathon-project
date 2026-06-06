import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'vendorbridge',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

export const query = (text, params) => pool.query(text, params);
export const getPool = () => pool;
