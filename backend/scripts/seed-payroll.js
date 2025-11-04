import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seedPayroll() {
  try {
    console.log('💰 Seeding 10 payroll records...\n');

    // Check if required tables exist
    console.log('Checking required tables...');
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('roles', 'users', 'employees', 'allowance_deduction_mappings', 'allowances', 'deductions')
    `);

    const existingTables = tablesCheck.rows.map(r => r.table_name);
    const requiredTables = ['roles', 'users', 'employees', 'allowance_deduction_mappings', 'allowances', 'deductions'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      console.log('\n💡 Run this first: npm run create-tables\n');
      process.exit(1);
    }
    console.log('✓ All required tables exist\n');

    // Get all employees (or create some if none exist)
    let employees = await pool.query('SELECT id, employee_id, full_name FROM employees LIMIT 10');
    
    if (employees.rows.length === 0) {
      console.log('No employees found. Creating 10 employees first...\n');
      
      // Get lookup IDs
      const [depts, roles, types, categories] = await Promise.all([
        pool.query('SELECT id FROM departments LIMIT 1'),
        pool.query('SELECT id FROM job_roles LIMIT 1'),
        pool.query('SELECT id FROM employment_types LIMIT 1'),
        pool.query('SELECT id FROM employee_categories LIMIT 1')
      ]);

      const names = [
        'Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
        'Anjali Desai', 'Rohit Verma', 'Kavita Nair', 'Suresh Iyer', 'Meera Joshi'
      ];
      const salaries = [75000, 65000, 45000, 55000, 70000, 48000, 85000, 58000, 35000, 62000];

      for (let i = 0; i < 10; i++) {
        const result = await pool.query(
          `INSERT INTO employees (
            employee_id, full_name, date_of_birth, date_of_joining,
            department_id, job_role_id, employment_type_id, employee_category_id,
            contact_email, basic_pay
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, employee_id, full_name`,
          [
            `EMP${String(i + 1).padStart(3, '0')}`,
            names[i],
            new Date(1985 + i, 0, 1).toISOString().split('T')[0],
            new Date(2020, 0, 1).toISOString().split('T')[0],
            depts.rows[0]?.id,
            roles.rows[0]?.id,
            types.rows[0]?.id,
            categories.rows[0]?.id,
            `${names[i].toLowerCase().replace(' ', '.')}@company.com`,
            salaries[i]
          ]
        );
        employees.rows.push(result.rows[0]);
      }
      console.log('✓ 10 employees created\n');
    }

    // Get admin user ID
    const adminResult = await pool.query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    const adminUserId = adminResult.rows[0]?.id || 1;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    console.log(`Creating payroll records for ${currentMonth}/${currentYear}...\n`);

    // Import PayrollCalculator
    const payrollModule = await import('../utils/payrollCalculator.js');
    const PayrollCalculator = payrollModule.PayrollCalculator;

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < employees.rows.length; i++) {
      const emp = employees.rows[i];
      
      try {
        // Check if payroll already exists
        const existing = await pool.query(
          'SELECT id FROM payroll_records WHERE employee_id = $1 AND month = $2 AND year = $3',
          [emp.id, currentMonth, currentYear]
        );

        if (existing.rows.length > 0) {
          console.log(`  ⏭ Skipping ${emp.employee_id} - payroll already exists`);
          skipped++;
          continue;
        }

        // Ensure working days exist
        // Calculate days worked
        const daysWorked = 28 + (i % 3);
        const totalDays = 30;

        // Ensure working days record exists
        await pool.query(
          `INSERT INTO working_days (employee_id, month, year, days_worked, total_days)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, month, year) DO UPDATE SET days_worked = $4`,
          [emp.id, currentMonth, currentYear, daysWorked, totalDays]
        );

        // Calculate payroll
        let payrollData;
        try {
          payrollData = await PayrollCalculator.calculatePayroll(
            emp.id,
            currentMonth,
            currentYear,
            daysWorked,
            totalDays
          );
        } catch (calcError) {
          throw new Error(`Payroll calculation failed: ${calcError.message}`);
        }

        // Validate payroll data
        if (!payrollData) {
          throw new Error(`Payroll calculator returned null/undefined for employee ${emp.employee_id}`);
        }
        if (typeof payrollData.net_payable === 'undefined' || payrollData.net_payable === null) {
          throw new Error(`net_payable is undefined/null for employee ${emp.employee_id}. Payroll data: ${JSON.stringify(payrollData)}`);
        }

        // Determine status
        const status = i % 3 === 0 ? 'draft' : i % 3 === 1 ? 'processed' : 'finalized';

        // Insert payroll record (excluding processed_at as it can be NULL or set automatically)
        // Use nullish coalescing to provide default values if any field is undefined
        await pool.query(
          `INSERT INTO payroll_records (
            employee_id, month, year,
            basic_pay, dearness_allowance, house_rent_allowance,
            special_allowance, employer_nps_contribution, total_earnings,
            gpf_recovery, sli, gis, festival_bonus, home_building_advance,
            income_tax, rent_deduction, lic_contribution, medisep, additional_deductions,
            total_deductions, net_payable, days_worked, status, processed_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
          [
            emp.id,                                                          // $1 - employee_id
            currentMonth,                                                    // $2 - month
            currentYear,                                                     // $3 - year
            payrollData.basic_pay ?? 0,                                      // $4 - basic_pay
            payrollData.dearness_allowance ?? 0,                             // $5 - dearness_allowance
            payrollData.house_rent_allowance ?? 0,                           // $6 - house_rent_allowance
            payrollData.special_allowance ?? 0,                               // $7 - special_allowance
            payrollData.employer_nps_contribution ?? 0,                       // $8 - employer_nps_contribution
            payrollData.total_earnings ?? 0,                                 // $9 - total_earnings
            payrollData.gpf_recovery ?? 0,                                   // $10 - gpf_recovery
            payrollData.sli ?? 0,                                            // $11 - sli
            payrollData.gis ?? 0,                                            // $12 - gis
            payrollData.festival_bonus ?? 0,                                 // $13 - festival_bonus
            payrollData.home_building_advance ?? 0,                          // $14 - home_building_advance
            payrollData.income_tax ?? 0,                                     // $15 - income_tax
            payrollData.rent_deduction ?? 0,                                // $16 - rent_deduction
            payrollData.lic_contribution ?? 0,                                // $17 - lic_contribution
            payrollData.medisep ?? 0,                                         // $18 - medisep
            payrollData.additional_deductions ?? 0,                           // $19 - additional_deductions
            payrollData.total_deductions ?? 0,                                // $20 - total_deductions
            payrollData.net_payable ?? 0,                                    // $21 - net_payable
            daysWorked,                                                      // $22 - days_worked
            status,                                                          // $23 - status
            adminUserId                                                      // $24 - processed_by
          ]
        );

        const netPayable = payrollData.net_payable || 0;
        console.log(`  ✓ Created payroll for ${emp.employee_id} - ${emp.full_name} (₹${netPayable.toLocaleString('en-IN')})`);
        created++;
      } catch (error) {
        console.error(`  ✗ Error for ${emp.employee_id}: ${error.message}`);
        if (error.stack) {
          console.error(`    Stack: ${error.stack.split('\n')[0]}`);
        }
      }
    }

    console.log(`\n✅ Payroll seeding completed!`);
    console.log(`   Created: ${created} records`);
    console.log(`   Skipped: ${skipped} records (already exist)`);
    console.log(`\n💡 Test with: GET /api/payroll?month=${currentMonth}&year=${currentYear}\n`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await pool.end();
    process.exit(1);
  }
}

seedPayroll();
