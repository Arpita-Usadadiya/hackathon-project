import { query } from '../db.js';

export const logAction = async (userId, userName, userRole, action, details) => {
  try {
    // TODO: Write a SQL query to insert logs into the database
    // INSERT INTO logs (user_id, user_name, user_role, action, details) VALUES ($1, $2, $3, $4, $5)
    console.log(`[AUDIT LOG] ${userName} (${userRole}) performed action: ${action} - ${details}`);
  } catch (err) {
    console.error('Failed to log action to database:', err);
  }
};
