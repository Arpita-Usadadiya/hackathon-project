import { query } from '../db.js';

export const logAction = async (userId, userName, userRole, action, details) => {
  try {
    await query(
      `INSERT INTO logs (user_id, user_name, user_role, action, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, userName, userRole, action, details]
    );
  } catch (err) {
    console.error('Failed to log action to database:', err);
  }
};
