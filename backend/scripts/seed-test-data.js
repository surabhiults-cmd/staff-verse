import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data (10 records for each table)...\n');

    // Get lookup IDs
    const [departments, jobRoles, empTypes, categories, roles] = await Promise.all([
      pool.query('SELECT id FROM departments LIMIT 5'),
      pool.query('SELECT id FROM job_roles LIMIT 5'),
      pool.query('SELECT id FROM employment_types'),
      pool.query('SELECT id FROM employee_categories'),
      pool.query('SELECT id FROM roles WHERE name = $1', ['administrator'])
    ]);

    const deptIds = departments.rows.map(r => r.id);
    const roleIds = jobRoles.rows.map(r => r.id);
    const typeIds = empTypes.rows.map(r => r.id);
    const catIds = categories.rows.map(r => r.id);
    const adminRoleId = roles.rows[0]?.id;

    console.log('Creating 10 employees...');
    const employees = [];
    
    const employeeData = [
      { name: 'Raj Kumar', dept: 0, role: 0, type: 0, category: 0, basic: 75000 },
      { name: 'Priya Sharma', dept: 0, role: 1, type: 0, category: 1, basic: 65000 },
      { name: 'Amit Patel', dept: 1, role: 2, type: 1, category: 2, basic: 45000 },
      { name: 'Sneha Reddy', dept: 2, role: 1, type: 0, category: 1, basic: 55000 },
      { name: 'Vikram Singh', dept: 3, role: 3, type: 0, category: 0, basic: 70000 },
      { name: 'Anjali Desai', dept: 4, role: 2, type: 0, category: 2, basic: 48000 },
      { name: 'Rohit Verma', dept: 0, role: 4, type: 0, category: 0, basic: 85000 },
      { name: 'Kavita Nair', dept: 1, role: 1, type: 0, category: 1, basic: 58000 },
      { name: 'Suresh Iyer', dept: 2, role: 2, type: 2, category: 3, basic: 35000 },
      { name: 'Meera Joshi', dept: 3, role: 0, type: 0, category: 1, basic: 62000 },
    ];

    for (let i = 0; i < 10; i++) {
      const emp = employeeData[i];
      const employeeId = `EMP${String(i + 1).padStart(3, '0')}`;
      const dateOfBirth = new Date(1985 + i, i % 12, (i * 3) % 28 + 1);
      const dateOfJoining = new Date(2020 + (i % 4), i % 12, (i * 5) % 28 + 1);

      const result = await pool.query(
        `INSERT INTO employees (
          employee_id, full_name, date_of_birth, contact_phone, contact_email,
          residential_address, date_of_joining, department_id, job_role_id,
          employment_type_id, employee_category_id, bank_account_number,
          bank_ifsc_code, bank_name, basic_pay
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`,
        [
          employeeId,
          emp.name,
          dateOfBirth.toISOString().split('T')[0],
          `+91${9000000000 + i}`,
          `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
          `${i + 1}, Sample Street, City ${i + 1}`,
          dateOfJoining.toISOString().split('T')[0],
          deptIds[emp.dept % deptIds.length],
          roleIds[emp.role % roleIds.length],
          typeIds[emp.type % typeIds.length],
          catIds[emp.category % catIds.length],
          `123456789${i}`,
          `BANK000${String(i + 1).padStart(3, '0')}`,
          'Sample Bank',
          emp.basic
        ]
      );
      employees.push({ id: result.rows[0].id, employeeId, name: emp.name });
    }
    console.log('✓ 10 employees created\n');

    // Create 10 additional users
    console.log('Creating 10 users...');
    const userNames = ['john_doe', 'jane_smith', 'mike_johnson', 'sarah_williams', 'david_brown', 
                       'lisa_anderson', 'chris_taylor', 'emily_martinez', 'james_wilson', 'amy_davis'];
    
    for (let i = 0; i < 10; i++) {
      const passwordHash = await bcrypt.hash('password123', 10);
      const roleId = i % 3 === 0 ? adminRoleId : (i % 3 === 1 ? 2 : 3); // Mix of roles
      
      try {
        await pool.query(
          `INSERT INTO users (username, email, password_hash, role_id)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (username) DO NOTHING`,
          [
            userNames[i],
            `${userNames[i]}@company.com`,
            passwordHash,
            roleId
          ]
        );
      } catch (error) {
        // Skip if user exists
      }
    }
    console.log('✓ 10 users created\n');

    // Create working days for current and previous month
    console.log('Creating working days records...');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    for (const emp of employees) {
      // Current month
      await pool.query(
        `INSERT INTO working_days (employee_id, month, year, days_worked, total_days)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (employee_id, month, year) DO UPDATE SET days_worked = $4`,
        [emp.id, currentMonth, currentYear, 28 + Math.floor(Math.random() * 2), 30]
      );

      // Previous month
      await pool.query(
        `INSERT INTO working_days (employee_id, month, year, days_worked, total_days)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (employee_id, month, year) DO UPDATE SET days_worked = $4`,
        [emp.id, lastMonth, lastYear, 30, 30]
      );
    }
    console.log('✓ Working days records created\n');

    // Create payroll records
    console.log('Creating payroll records...');
    
    // Import PayrollCalculator
    const payrollModule = await import('../utils/payrollCalculator.js');
    const PayrollCalculator = payrollModule.PayrollCalculator;

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      try {
        // Get working days for this employee
        const workingDaysResult = await pool.query(
          'SELECT days_worked, total_days FROM working_days WHERE employee_id = $1 AND month = $2 AND year = $3',
          [emp.id, currentMonth, currentYear]
        );
        
        const daysWorked = workingDaysResult.rows[0]?.days_worked || 28;
        const totalDays = workingDaysResult.rows[0]?.total_days || 30;

        const payrollData = await PayrollCalculator.calculatePayroll(
          emp.id,
          currentMonth,
          currentYear,
          daysWorked,
          totalDays
        );

        await pool.query(
          `INSERT INTO payroll_records (
            employee_id, month, year, basic_pay, dearness_allowance, house_rent_allowance,
            special_allowance, employer_nps_contribution, total_earnings,
            gpf_recovery, sli, gis, festival_bonus, home_building_advance,
            income_tax, rent_deduction, lic_contribution, medisep, additional_deductions,
            total_deductions, net_payable, days_worked, status, processed_by, processed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, CURRENT_TIMESTAMP)
          ON CONFLICT (employee_id, month, year) DO UPDATE SET
            basic_pay = $4, dearness_allowance = $5, house_rent_allowance = $6,
            special_allowance = $7, employer_nps_contribution = $8, total_earnings = $9,
            total_deductions = $21, net_payable = $22, days_worked = $23,
            updated_at = CURRENT_TIMESTAMP`,
          [
            emp.id, currentMonth, currentYear,
            payrollData.basic_pay, payrollData.dearness_allowance, payrollData.house_rent_allowance,
            payrollData.special_allowance, payrollData.employer_nps_contribution, payrollData.total_earnings,
            payrollData.gpf_recovery, payrollData.sli, payrollData.gis, payrollData.festival_bonus,
            payrollData.home_building_advance, payrollData.income_tax, payrollData.rent_deduction,
            payrollData.lic_contribution, payrollData.medisep, payrollData.additional_deductions,
            payrollData.total_deductions, payrollData.net_payable, payrollData.days_worked,
            (i % 3 === 0 ? 'draft' : i % 3 === 1 ? 'processed' : 'finalized'),
            adminRoleId
          ]
        );
      } catch (error) {
        console.log(`  ⚠ Skipped payroll for ${emp.name}: ${error.message}`);
      }
    }
    console.log('✓ Payroll records created\n');

    // Create allowance-deduction mappings
    console.log('Creating allowance-deduction mappings...');
    for (let i = 0; i < 10; i++) {
      try {
        await pool.query(
          `INSERT INTO allowance_deduction_mappings 
           (job_role_id, employment_type_id, allowance_id, deduction_id, default_amount, is_mandatory)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [
            roleIds[i % roleIds.length],
            typeIds[i % typeIds.length],
            i < 4 ? (i % 4) + 1 : null,
            (i % 10) + 1,
            (i + 1) * 500,
            i % 2 === 0
          ]
        );
      } catch (error) {
        // Skip if mapping already exists or references don't exist
      }
    }
    console.log('✓ Mappings created\n');

    // Create sample audit logs
    console.log('Creating audit logs...');
    for (let i = 0; i < 10; i++) {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_values, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          adminRoleId,
          ['create', 'update', 'delete'][i % 3],
          ['employees', 'payroll_records', 'users'][i % 3],
          employees[i % employees.length]?.id || i + 1,
          JSON.stringify({ test: 'data', timestamp: new Date().toISOString() }),
          '127.0.0.1'
        ]
      );
    }
    console.log('✓ Audit logs created\n');

    console.log('✅ Test data seeding completed!\n');
    console.log('Summary:');
    console.log('  - 10 employees created');
    console.log('  - 10 users created');
    console.log('  - Working days records created');
    console.log('  - Payroll records created');
    console.log('  - Audit logs created\n');
    console.log('You can now test all API endpoints!\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

seedTestData();
