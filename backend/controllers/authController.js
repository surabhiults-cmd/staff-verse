import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password, role_id } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role_id',
      [username, email, passwordHash, role_id || 3] // Default to viewer role
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role_id: result.rows[0].role_id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const result = await pool.query(
      `SELECT u.*, r.name as role_name FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};


