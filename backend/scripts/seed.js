import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdminUser() {
  try {
    console.log('Seeding admin user...\n');

    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE username = 'admin'"
    );

    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists. Skipping...\n');
      process.exit(0);
    }

    // Get administrator role ID
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = 'administrator'"
    );

    if (roleResult.rows.length === 0) {
      console.error('Administrator role not found. Please run migrations first.');
      process.exit(1);
    }

    const adminRoleId = roleResult.rows[0].id;

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email`,
      ['admin', 'admin@hrms.com', passwordHash, adminRoleId]
    );

    console.log('✓ Admin user created successfully!');
    console.log('\nLogin credentials:');
    console.log('  Username: admin');
    console.log('  Email: admin@hrms.com');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedAdminUser();
