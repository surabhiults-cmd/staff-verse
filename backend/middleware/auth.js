import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Get user with role information
    const userResult = await pool.query(
      'SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = $1 AND u.is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const auditLog = async (req, actionType, tableName, recordId, oldValues = null, newValues = null) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user?.id || null,
        actionType,
        tableName,
        recordId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent']
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};


