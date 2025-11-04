import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin user...\n');

    // Check if admin exists
    const adminCheck = await pool.query(
      "SELECT id, username, email, role_id, is_active FROM users WHERE username = 'admin'"
    );

    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user does NOT exist');
      console.log('\nCreating admin user now...\n');

      // Get administrator role ID
      const roleResult = await pool.query(
        "SELECT id FROM roles WHERE name = 'administrator'"
      );

      if (roleResult.rows.length === 0) {
        console.error('❌ Administrator role not found!');
        console.error('Run: npm run fix-roles');
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

      console.log('✅ Admin user created successfully!');
      console.log('\nLogin credentials:');
      console.log('  Username: admin');
      console.log('  Email: admin@hrms.com');
      console.log('  Password: admin123');
    } else {
      const admin = adminCheck.rows[0];
      console.log('✅ Admin user exists!');
      console.log('\nUser details:');
      console.log('  ID:', admin.id);
      console.log('  Username:', admin.username);
      console.log('  Email:', admin.email);
      console.log('  Role ID:', admin.role_id);
      console.log('  Is Active:', admin.is_active);

      // Test password
      console.log('\nTesting password...');
      const userWithPassword = await pool.query(
        "SELECT password_hash FROM users WHERE username = 'admin'"
      );

      if (userWithPassword.rows.length > 0) {
        const isValid = await bcrypt.compare('admin123', userWithPassword.rows[0].password_hash);
        if (isValid) {
          console.log('✅ Password "admin123" is correct');
        } else {
          console.log('❌ Password "admin123" does NOT match!');
          console.log('\nResetting password...');
          const newHash = await bcrypt.hash('admin123', 10);
          await pool.query(
            "UPDATE users SET password_hash = $1 WHERE username = 'admin'",
            [newHash]
          );
          console.log('✅ Password reset to "admin123"');
        }
      }

      // Check if user is active
      if (!admin.is_active) {
        console.log('\n⚠️  User is inactive! Activating...');
        await pool.query("UPDATE users SET is_active = true WHERE username = 'admin'");
        console.log('✅ User activated');
      }
    }

    console.log('\n✅ Ready to login!');
    console.log('\nUse these credentials:');
    console.log('  Username: admin');
    console.log('  Password: admin123\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure roles table exists: npm run fix-roles');
    console.error('2. Check database connection in .env file');
    await pool.end();
    process.exit(1);
  }
}

checkAdmin();



