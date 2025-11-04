import pool from '../config/database.js';
import { PayrollCalculator } from '../utils/payrollCalculator.js';
import { auditLog } from '../middleware/auth.js';

export const calculatePayroll = async (req, res, next) => {
  try {
    const { employee_id, month, year } = req.body;

    // Get working days
    const workingDaysResult = await pool.query(
      'SELECT days_worked, total_days FROM working_days WHERE employee_id = $1 AND month = $2 AND year = $3',
      [employee_id, month, year]
    );

    const daysWorked = workingDaysResult.rows[0]?.days_worked || 30;
    const totalDays = workingDaysResult.rows[0]?.total_days || 30;

    const payrollData = await PayrollCalculator.calculatePayroll(
      employee_id,
      month,
      year,
      daysWorked,
      totalDays
    );

    res.json({ payroll: payrollData });
  } catch (error) {
    next(error);
  }
};

export const getPayrollRecord = async (req, res, next) => {
  try {
    const { employee_id, month, year } = req.query;

    let query = `SELECT pr.*, 
                 e.full_name, e.employee_id as employee_id_string, e.department_id, e.job_role_id,
                 d.name as department_name,
                 jr.name as job_role_name
                 FROM payroll_records pr
                 JOIN employees e ON pr.employee_id = e.id
                 LEFT JOIN departments d ON e.department_id = d.id
                 LEFT JOIN job_roles jr ON e.job_role_id = jr.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

    if (employee_id) {
      query += ` AND pr.employee_id = $${paramCount}`;
      params.push(employee_id);
      paramCount++;
    }

    if (month) {
      query += ` AND pr.month = $${paramCount}`;
      params.push(month);
      paramCount++;
    }

    if (year) {
      query += ` AND pr.year = $${paramCount}`;
      params.push(year);
      paramCount++;
    }

    query += ' ORDER BY pr.year DESC, pr.month DESC, e.full_name';

    const result = await pool.query(query, params);
    res.json({ payroll_records: result.rows });
  } catch (error) {
    next(error);
  }
};

export const processMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const result = await PayrollCalculator.processMonthlyPayroll(
      month,
      year,
      req.user.id
    );

    await auditLog(req, 'create', 'payroll_records', null, null, { month, year, ...result });

    res.json({
      message: 'Monthly payroll processed successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const finalizePayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    const result = await pool.query(
      `UPDATE payroll_records 
       SET status = 'finalized', updated_at = CURRENT_TIMESTAMP
       WHERE month = $1 AND year = $2 AND status = 'processed'
       RETURNING *`,
      [month, year]
    );

    await auditLog(req, 'update', 'payroll_records', null, null, { month, year, finalized: true });

    res.json({
      message: 'Payroll finalized successfully',
      records_finalized: result.rowCount
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkingDays = async (req, res, next) => {
  try {
    const { employee_id, month, year, days_worked, total_days } = req.body;

    // Check if record exists
    const existing = await pool.query(
      'SELECT id FROM working_days WHERE employee_id = $1 AND month = $2 AND year = $3',
      [employee_id, month, year]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update
      result = await pool.query(
        `UPDATE working_days 
         SET days_worked = $1, total_days = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [days_worked, total_days || 30, existing.rows[0].id]
      );
    } else {
      // Insert
      result = await pool.query(
        `INSERT INTO working_days (employee_id, month, year, days_worked, total_days)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [employee_id, month, year, days_worked, total_days || 30]
      );
    }

    // If payroll record exists, recalculate
    const payrollRecord = await pool.query(
      'SELECT id FROM payroll_records WHERE employee_id = $1 AND month = $2 AND year = $3',
      [employee_id, month, year]
    );

    if (payrollRecord.rows.length > 0) {
      // Recalculate payroll
      const payrollData = await PayrollCalculator.calculatePayroll(
        employee_id,
        month,
        year,
        days_worked,
        total_days || 30
      );

      await pool.query(
        `UPDATE payroll_records SET
         basic_pay = $1, dearness_allowance = $2, house_rent_allowance = $3,
         special_allowance = $4, employer_nps_contribution = $5, total_earnings = $6,
         total_deductions = $7, net_payable = $8, days_worked = $9,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $10`,
        [
          payrollData.basic_pay, payrollData.dearness_allowance, payrollData.house_rent_allowance,
          payrollData.special_allowance, payrollData.employer_nps_contribution, payrollData.total_earnings,
          payrollData.total_deductions, payrollData.net_payable, payrollData.days_worked,
          payrollRecord.rows[0].id
        ]
      );
    }

    res.json({ working_days: result.rows[0], message: 'Working days updated successfully' });
  } catch (error) {
    next(error);
  }
};


