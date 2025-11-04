import pool from '../config/database.js';

export class PayrollCalculator {
  static async calculatePayroll(employeeId, month, year, daysWorked, totalDays = 30) {
    try {
      // Get employee details
      const employeeResult = await pool.query(
        `SELECT e.*, 
         ec.name as category_name,
         d.name as department_name,
         jr.name as job_role_name,
         et.name as employment_type_name
         FROM employees e
         LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN job_roles jr ON e.job_role_id = jr.id
         LEFT JOIN employment_types et ON e.employment_type_id = et.id
         WHERE e.id = $1`,
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        throw new Error('Employee not found');
      }

      const employee = employeeResult.rows[0];

      // Get HRA configuration
      const hraConfigResult = await pool.query(
        'SELECT percentage FROM hra_configurations WHERE employee_category_id = $1',
        [employee.employee_category_id]
      );
      const hraPercentage = hraConfigResult.rows[0]?.percentage || 0;

      // Get DA configuration
      const daConfigResult = await pool.query(
        'SELECT percentage FROM da_configurations WHERE employee_category_id = $1',
        [employee.employee_category_id]
      );
      const daPercentage = daConfigResult.rows[0]?.percentage || 0;

      // Calculate pro-rata factor
      const proRataFactor = daysWorked / totalDays;

      // Calculate Basic Pay (pro-rated)
      const basicPay = (employee.basic_pay || 0) * proRataFactor;

      // Calculate DA (percentage of basic pay)
      const dearnessAllowance = (basicPay * daPercentage) / 100;

      // Calculate HRA (percentage of basic pay)
      const houseRentAllowance = (basicPay * hraPercentage) / 100;

      // Get default allowances from mapping
      const allowanceMappingResult = await pool.query(
        `SELECT adm.allowance_id, adm.default_amount, a.name, a.is_taxable
         FROM allowance_deduction_mappings adm
         JOIN allowances a ON adm.allowance_id = a.id
         WHERE (adm.job_role_id = $1 OR adm.job_role_id IS NULL)
           AND (adm.employment_type_id = $2 OR adm.employment_type_id IS NULL)`,
        [employee.job_role_id, employee.employment_type_id]
      );

      let specialAllowance = 0;
      allowanceMappingResult.rows.forEach(row => {
        if (row.name.toLowerCase().includes('special')) {
          specialAllowance = row.default_amount * proRataFactor;
        }
      });

      // Default special allowance if not found (10% of basic)
      if (specialAllowance === 0) {
        specialAllowance = (basicPay * 10) / 100;
      }

      // Employer NPS Contribution (typically 10% of basic)
      const employerNpsContribution = (basicPay * 10) / 100;

      // Calculate Total Earnings
      const totalEarnings = basicPay + dearnessAllowance + houseRentAllowance + 
                           specialAllowance + employerNpsContribution;

      // Get default deductions from mapping
      const deductionMappingResult = await pool.query(
        `SELECT adm.deduction_id, adm.default_amount, d.name
         FROM allowance_deduction_mappings adm
         JOIN deductions d ON adm.deduction_id = d.id
         WHERE (adm.job_role_id = $1 OR adm.job_role_id IS NULL)
           AND (adm.employment_type_id = $2 OR adm.employment_type_id IS NULL)`,
        [employee.job_role_id, employee.employment_type_id]
      );

      // Initialize deduction components
      let gpfRecovery = 0;
      let sli = 0;
      let gis = 0;
      let festivalBonus = 0;
      let homeBuildingAdvance = 0;
      let incomeTax = 0;
      let rentDeduction = 0;
      let licContribution = 0;
      let medisep = 0;
      let additionalDeductions = 0;

      // Map deductions
      deductionMappingResult.rows.forEach(row => {
        const amount = row.default_amount * proRataFactor;
        const name = row.name.toLowerCase();

        if (name.includes('gpf') || name.includes('recovery')) {
          gpfRecovery = amount;
        } else if (name.includes('sli')) {
          sli = amount;
        } else if (name.includes('gis')) {
          gis = amount;
        } else if (name.includes('festival') || name.includes('bonus')) {
          festivalBonus = amount;
        } else if (name.includes('building') || name.includes('advance') || name.includes('hba')) {
          homeBuildingAdvance = amount;
        } else if (name.includes('tax') || name.includes('income')) {
          incomeTax = amount;
        } else if (name.includes('rent')) {
          rentDeduction = amount;
        } else if (name.includes('lic')) {
          licContribution = amount;
        } else if (name.includes('medi')) {
          medisep = amount;
        } else {
          additionalDeductions += amount;
        }
      });

      // Calculate Income Tax (simplified - can be enhanced)
      if (incomeTax === 0 && totalEarnings > 250000) {
        // Simplified tax calculation (should be replaced with proper tax slabs)
        const taxableIncome = totalEarnings - 50000; // Standard deduction
        incomeTax = (taxableIncome * 5) / 100; // Simplified 5% tax
      }

      // Calculate Total Deductions
      const totalDeductions = gpfRecovery + sli + gis + festivalBonus + 
                             homeBuildingAdvance + incomeTax + rentDeduction + 
                             licContribution + medisep + additionalDeductions;

      // Calculate Net Payable
      const netPayable = totalEarnings - totalDeductions;

      // Wage limits for daily wage workers
      if (employee.employment_type_name === 'Daily Wage') {
        const maxDailyWage = 500; // Configurable limit
        const calculatedWage = netPayable;
        if (calculatedWage > maxDailyWage * daysWorked) {
          return {
            ...this,
            netPayable: maxDailyWage * daysWorked,
            warning: 'Daily wage limit applied'
          };
        }
      }

      return {
        employee_id: employeeId,
        month,
        year,
        basic_pay: parseFloat(basicPay.toFixed(2)),
        dearness_allowance: parseFloat(dearnessAllowance.toFixed(2)),
        house_rent_allowance: parseFloat(houseRentAllowance.toFixed(2)),
        special_allowance: parseFloat(specialAllowance.toFixed(2)),
        employer_nps_contribution: parseFloat(employerNpsContribution.toFixed(2)),
        total_earnings: parseFloat(totalEarnings.toFixed(2)),
        gpf_recovery: parseFloat(gpfRecovery.toFixed(2)),
        sli: parseFloat(sli.toFixed(2)),
        gis: parseFloat(gis.toFixed(2)),
        festival_bonus: parseFloat(festivalBonus.toFixed(2)),
        home_building_advance: parseFloat(homeBuildingAdvance.toFixed(2)),
        income_tax: parseFloat(incomeTax.toFixed(2)),
        rent_deduction: parseFloat(rentDeduction.toFixed(2)),
        lic_contribution: parseFloat(licContribution.toFixed(2)),
        medisep: parseFloat(medisep.toFixed(2)),
        additional_deductions: parseFloat(additionalDeductions.toFixed(2)),
        total_deductions: parseFloat(totalDeductions.toFixed(2)),
        net_payable: parseFloat(netPayable.toFixed(2)),
        days_worked: daysWorked,
        total_days: totalDays
      };
    } catch (error) {
      throw new Error(`Payroll calculation error: ${error.message}`);
    }
  }

  static async processMonthlyPayroll(month, year, processedBy) {
    try {
      // Get all active employees
      const employeesResult = await pool.query(
        'SELECT id FROM employees WHERE is_active = true'
      );

      const processedRecords = [];
      const errors = [];

      for (const employee of employeesResult.rows) {
        try {
          // Get working days for the month
          const workingDaysResult = await pool.query(
            'SELECT days_worked, total_days FROM working_days WHERE employee_id = $1 AND month = $2 AND year = $3',
            [employee.id, month, year]
          );

          const daysWorked = workingDaysResult.rows[0]?.days_worked || 30;
          const totalDays = workingDaysResult.rows[0]?.total_days || 30;

          // Calculate payroll
          const payrollData = await this.calculatePayroll(employee.id, month, year, daysWorked, totalDays);

          // Save or update payroll record
          const existingRecord = await pool.query(
            'SELECT id FROM payroll_records WHERE employee_id = $1 AND month = $2 AND year = $3',
            [employee.id, month, year]
          );

          if (existingRecord.rows.length > 0) {
            // Update existing record
            await pool.query(
              `UPDATE payroll_records SET
               basic_pay = $1, dearness_allowance = $2, house_rent_allowance = $3,
               special_allowance = $4, employer_nps_contribution = $5, total_earnings = $6,
               gpf_recovery = $7, sli = $8, gis = $9, festival_bonus = $10,
               home_building_advance = $11, income_tax = $12, rent_deduction = $13,
               lic_contribution = $14, medisep = $15, additional_deductions = $16,
               total_deductions = $17, net_payable = $18, days_worked = $19,
               status = 'processed', processed_by = $20, processed_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
               WHERE id = $21`,
              [
                payrollData.basic_pay, payrollData.dearness_allowance, payrollData.house_rent_allowance,
                payrollData.special_allowance, payrollData.employer_nps_contribution, payrollData.total_earnings,
                payrollData.gpf_recovery, payrollData.sli, payrollData.gis, payrollData.festival_bonus,
                payrollData.home_building_advance, payrollData.income_tax, payrollData.rent_deduction,
                payrollData.lic_contribution, payrollData.medisep, payrollData.additional_deductions,
                payrollData.total_deductions, payrollData.net_payable, payrollData.days_worked,
                processedBy, existingRecord.rows[0].id
              ]
            );
          } else {
            // Insert new record
            await pool.query(
              `INSERT INTO payroll_records (
               employee_id, month, year, basic_pay, dearness_allowance, house_rent_allowance,
               special_allowance, employer_nps_contribution, total_earnings,
               gpf_recovery, sli, gis, festival_bonus, home_building_advance,
               income_tax, rent_deduction, lic_contribution, medisep, additional_deductions,
               total_deductions, net_payable, days_worked, status, processed_by, processed_at
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, CURRENT_TIMESTAMP)`,
              [
                employee.id, month, year, payrollData.basic_pay, payrollData.dearness_allowance,
                payrollData.house_rent_allowance, payrollData.special_allowance,
                payrollData.employer_nps_contribution, payrollData.total_earnings,
                payrollData.gpf_recovery, payrollData.sli, payrollData.gis, payrollData.festival_bonus,
                payrollData.home_building_advance, payrollData.income_tax, payrollData.rent_deduction,
                payrollData.lic_contribution, payrollData.medisep, payrollData.additional_deductions,
                payrollData.total_deductions, payrollData.net_payable, payrollData.days_worked,
                'processed', processedBy
              ]
            );
          }

          processedRecords.push({ employee_id: employee.id, status: 'success' });
        } catch (error) {
          errors.push({ employee_id: employee.id, error: error.message });
        }
      }

      return {
        success: true,
        processed: processedRecords.length,
        errors: errors.length,
        details: { processedRecords, errors }
      };
    } catch (error) {
      throw new Error(`Monthly payroll processing error: ${error.message}`);
    }
  }
}


