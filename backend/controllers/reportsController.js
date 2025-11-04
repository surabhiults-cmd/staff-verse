import pool from '../config/database.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Helper function to convert PostgreSQL numeric types to JavaScript numbers
function parseNumeric(value) {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export const getSalaryDisbursementReport = async (req, res, next) => {
  try {
    const { month, year, department_id, category_id } = req.query;

    let query = `SELECT 
                 SUM(pr.total_earnings) as total_earnings,
                 SUM(pr.total_deductions) as total_deductions,
                 SUM(pr.net_payable) as total_net_payable,
                 COUNT(DISTINCT pr.employee_id) as employee_count,
                 pr.month,
                 pr.year
                 FROM payroll_records pr
                 JOIN employees e ON pr.employee_id = e.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

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

    if (department_id) {
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    if (category_id) {
      query += ` AND e.employee_category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    query += ` GROUP BY pr.month, pr.year
               ORDER BY pr.year DESC, pr.month DESC`;

    const result = await pool.query(query, params);
    const parsedRows = result.rows.map(row => ({
      ...row,
      total_earnings: parseNumeric(row.total_earnings),
      total_deductions: parseNumeric(row.total_deductions),
      total_net_payable: parseNumeric(row.total_net_payable)
    }));
    res.json({ report: parsedRows });
  } catch (error) {
    next(error);
  }
};

export const getProvidentFundSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    let query = `SELECT 
                 e.employee_id,
                 e.full_name,
                 pr.month,
                 pr.year,
                 pr.gpf_recovery as employee_contribution,
                 pr.employer_nps_contribution as employer_contribution,
                 (pr.gpf_recovery + pr.employer_nps_contribution) as total_contribution
                 FROM payroll_records pr
                 JOIN employees e ON pr.employee_id = e.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

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

    query += ` ORDER BY e.full_name, pr.year DESC, pr.month DESC`;

    const result = await pool.query(query, params);
    const parsedRows = result.rows.map(row => ({
      ...row,
      employee_contribution: parseNumeric(row.employee_contribution),
      employer_contribution: parseNumeric(row.employer_contribution),
      total_contribution: parseNumeric(row.total_contribution)
    }));
    res.json({ report: parsedRows });
  } catch (error) {
    next(error);
  }
};

export const getDailyWageRecords = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const result = await pool.query(
      `SELECT 
       e.employee_id,
       e.full_name,
       pr.month,
       pr.year,
       pr.days_worked,
       pr.net_payable,
       pr.status
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       JOIN employment_types et ON e.employment_type_id = et.id
       WHERE et.name = 'Daily Wage'
       ${month ? 'AND pr.month = $1' : ''}
       ${year ? (month ? 'AND pr.year = $2' : 'AND pr.year = $1') : ''}
       ORDER BY e.full_name, pr.year DESC, pr.month DESC`,
      month && year ? [month, year] : month ? [month] : year ? [year] : []
    );

    const parsedRows = result.rows.map(row => ({
      ...row,
      days_worked: parseNumeric(row.days_worked),
      net_payable: parseNumeric(row.net_payable)
    }));
    res.json({ report: parsedRows });
  } catch (error) {
    next(error);
  }
};

export const getDeductionSummary = async (req, res, next) => {
  try {
    const { month, year, deduction_type } = req.query;

    let query = `SELECT 
                 SUM(CASE WHEN $1 = 'gpf_recovery' THEN pr.gpf_recovery
                      WHEN $1 = 'sli' THEN pr.sli
                      WHEN $1 = 'gis' THEN pr.gis
                      WHEN $1 = 'festival_bonus' THEN pr.festival_bonus
                      WHEN $1 = 'home_building_advance' THEN pr.home_building_advance
                      WHEN $1 = 'income_tax' THEN pr.income_tax
                      WHEN $1 = 'rent_deduction' THEN pr.rent_deduction
                      WHEN $1 = 'lic_contribution' THEN pr.lic_contribution
                      WHEN $1 = 'medisep' THEN pr.medisep
                      WHEN $1 = 'additional_deductions' THEN pr.additional_deductions
                      ELSE pr.total_deductions END) as total_amount,
                 pr.month,
                 pr.year
                 FROM payroll_records pr
                 WHERE 1=1`;
    
    const params = [deduction_type || 'total_deductions'];
    let paramCount = 2;

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

    query += ` GROUP BY pr.month, pr.year
               ORDER BY pr.year DESC, pr.month DESC`;

    const result = await pool.query(query, params);
    const parsedRows = result.rows.map(row => ({
      ...row,
      total_amount: parseNumeric(row.total_amount)
    }));
    res.json({ report: parsedRows });
  } catch (error) {
    next(error);
  }
};

export const getSalaryDistribution = async (req, res, next) => {
  try {
    const { month, year, group_by } = req.query; // group_by: 'department' or 'category'

    let query = '';
    const params = [];
    let paramCount = 1;

    if (group_by === 'department') {
      query = `SELECT 
               d.name as group_name,
               COUNT(DISTINCT pr.employee_id) as employee_count,
               SUM(pr.total_earnings) as total_earnings,
               SUM(pr.total_deductions) as total_deductions,
               SUM(pr.net_payable) as total_net_payable
               FROM payroll_records pr
               JOIN employees e ON pr.employee_id = e.id
               LEFT JOIN departments d ON e.department_id = d.id
               WHERE 1=1`;
    } else {
      query = `SELECT 
               ec.name as group_name,
               COUNT(DISTINCT pr.employee_id) as employee_count,
               SUM(pr.total_earnings) as total_earnings,
               SUM(pr.total_deductions) as total_deductions,
               SUM(pr.net_payable) as total_net_payable
               FROM payroll_records pr
               JOIN employees e ON pr.employee_id = e.id
               LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
               WHERE 1=1`;
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

    query += ` GROUP BY ${group_by === 'department' ? 'd.name' : 'ec.name'}
               ORDER BY total_net_payable DESC`;

    const result = await pool.query(query, params);
    const parsedRows = result.rows.map(row => ({
      ...row,
      total_earnings: parseNumeric(row.total_earnings),
      total_deductions: parseNumeric(row.total_deductions),
      total_net_payable: parseNumeric(row.total_net_payable)
    }));
    res.json({ report: parsedRows });
  } catch (error) {
    next(error);
  }
};

export const getAnnualSalaryStatement = async (req, res, next) => {
  try {
    const { employee_id, year } = req.query;

    if (!employee_id || !year) {
      return res.status(400).json({ error: 'Employee ID and year are required' });
    }

    const result = await pool.query(
      `SELECT 
       pr.*,
       e.full_name,
       e.employee_id as employee_id_string,
       d.name as department_name
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE pr.employee_id = $1 AND pr.year = $2
       ORDER BY pr.month`,
      [employee_id, year]
    );

    // Parse monthly records
    const parsedRecords = result.rows.map(row => ({
      ...row,
      basic_pay: parseNumeric(row.basic_pay),
      dearness_allowance: parseNumeric(row.dearness_allowance),
      house_rent_allowance: parseNumeric(row.house_rent_allowance),
      special_allowance: parseNumeric(row.special_allowance),
      employer_nps_contribution: parseNumeric(row.employer_nps_contribution),
      total_earnings: parseNumeric(row.total_earnings),
      gpf_recovery: parseNumeric(row.gpf_recovery),
      sli: parseNumeric(row.sli),
      gis: parseNumeric(row.gis),
      festival_bonus: parseNumeric(row.festival_bonus),
      home_building_advance: parseNumeric(row.home_building_advance),
      income_tax: parseNumeric(row.income_tax),
      rent_deduction: parseNumeric(row.rent_deduction),
      lic_contribution: parseNumeric(row.lic_contribution),
      medisep: parseNumeric(row.medisep),
      additional_deductions: parseNumeric(row.additional_deductions),
      total_deductions: parseNumeric(row.total_deductions),
      net_payable: parseNumeric(row.net_payable),
      days_worked: parseNumeric(row.days_worked)
    }));

    // Calculate totals
    const totals = parsedRecords.reduce((acc, row) => ({
      total_earnings: acc.total_earnings + row.total_earnings,
      total_deductions: acc.total_deductions + row.total_deductions,
      total_net_payable: acc.total_net_payable + row.net_payable
    }), { total_earnings: 0, total_deductions: 0, total_net_payable: 0 });

    res.json({
      employee_id,
      year,
      monthly_records: parsedRecords,
      totals
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get month name
function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || 'Unknown';
}

// Download functions for each report type
export const downloadSalaryDisbursementReport = async (req, res, next) => {
  try {
    const { month, year, department_id, category_id } = req.query;

    // Get the report data using the same query as getSalaryDisbursementReport
    let query = `SELECT 
                 SUM(pr.total_earnings) as total_earnings,
                 SUM(pr.total_deductions) as total_deductions,
                 SUM(pr.net_payable) as total_net_payable,
                 COUNT(DISTINCT pr.employee_id) as employee_count,
                 pr.month,
                 pr.year
                 FROM payroll_records pr
                 JOIN employees e ON pr.employee_id = e.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

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

    if (department_id) {
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    if (category_id) {
      query += ` AND e.employee_category_id = $${paramCount}`;
      params.push(category_id);
      paramCount++;
    }

    query += ` GROUP BY pr.month, pr.year
               ORDER BY pr.year DESC, pr.month DESC`;

    const result = await pool.query(query, params);
    const data = result.rows.map(row => ({
      Month: `${getMonthName(row.month)} ${row.year}`,
      'No. of Employees': row.employee_count,
      'Total Earnings': parseNumeric(row.total_earnings),
      'Total Deductions': parseNumeric(row.total_deductions),
      'Net Payable': parseNumeric(row.total_net_payable)
    }));

    // Generate Excel file
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Disbursement');

    const fileName = `salary_disbursement_${year || 'all'}_${month || 'all'}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadProvidentFundReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    let query = `SELECT 
                 e.employee_id,
                 e.full_name,
                 pr.month,
                 pr.year,
                 pr.gpf_recovery as employee_contribution,
                 pr.employer_nps_contribution as employer_contribution,
                 (pr.gpf_recovery + pr.employer_nps_contribution) as total_contribution
                 FROM payroll_records pr
                 JOIN employees e ON pr.employee_id = e.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

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

    query += ` ORDER BY e.full_name, pr.year DESC, pr.month DESC`;

    const result = await pool.query(query, params);
    const data = result.rows.map(row => ({
      'Employee ID': row.employee_id,
      'Employee Name': row.full_name,
      'Period': `${getMonthName(row.month)} ${row.year}`,
      'Employee Contribution': parseNumeric(row.employee_contribution),
      'Employer Contribution': parseNumeric(row.employer_contribution),
      'Total Contribution': parseNumeric(row.total_contribution)
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Provident Fund');

    const fileName = `provident_fund_${year || 'all'}_${month || 'all'}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDailyWageReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const result = await pool.query(
      `SELECT 
       e.employee_id,
       e.full_name,
       pr.month,
       pr.year,
       pr.days_worked,
       pr.net_payable,
       pr.status
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       JOIN employment_types et ON e.employment_type_id = et.id
       WHERE et.name = 'Daily Wage'
       ${month ? 'AND pr.month = $1' : ''}
       ${year ? (month ? 'AND pr.year = $2' : 'AND pr.year = $1') : ''}
       ORDER BY e.full_name, pr.year DESC, pr.month DESC`,
      month && year ? [month, year] : month ? [month] : year ? [year] : []
    );

    const data = result.rows.map(row => ({
      'Employee ID': row.employee_id,
      'Employee Name': row.full_name,
      'Period': `${getMonthName(row.month)} ${row.year}`,
      'Days Worked': parseNumeric(row.days_worked),
      'Net Payable': parseNumeric(row.net_payable),
      'Status': row.status
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Wage Records');

    const fileName = `daily_wage_${year || 'all'}_${month || 'all'}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadSalaryDistributionReport = async (req, res, next) => {
  try {
    const { month, year, group_by } = req.query;
    const groupByType = group_by || 'department';

    let query = '';
    const params = [];
    let paramCount = 1;

    if (groupByType === 'department') {
      query = `SELECT 
               d.name as group_name,
               COUNT(DISTINCT pr.employee_id) as employee_count,
               SUM(pr.total_earnings) as total_earnings,
               SUM(pr.total_deductions) as total_deductions,
               SUM(pr.net_payable) as total_net_payable
               FROM payroll_records pr
               JOIN employees e ON pr.employee_id = e.id
               LEFT JOIN departments d ON e.department_id = d.id
               WHERE 1=1`;
    } else {
      query = `SELECT 
               ec.name as group_name,
               COUNT(DISTINCT pr.employee_id) as employee_count,
               SUM(pr.total_earnings) as total_earnings,
               SUM(pr.total_deductions) as total_deductions,
               SUM(pr.net_payable) as total_net_payable
               FROM payroll_records pr
               JOIN employees e ON pr.employee_id = e.id
               LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
               WHERE 1=1`;
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

    query += ` GROUP BY ${groupByType === 'department' ? 'd.name' : 'ec.name'}
               ORDER BY total_net_payable DESC`;

    const result = await pool.query(query, params);
    const data = result.rows.map(row => ({
      [groupByType === 'department' ? 'Department' : 'Category']: row.group_name || 'N/A',
      'No. of Employees': row.employee_count,
      'Total Earnings': parseNumeric(row.total_earnings),
      'Total Deductions': parseNumeric(row.total_deductions),
      'Net Payable': parseNumeric(row.total_net_payable)
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary Distribution');

    const fileName = `salary_distribution_${groupByType}_${year || 'all'}_${month || 'all'}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadAnnualStatementReport = async (req, res, next) => {
  try {
    const { employee_id, year } = req.query;

    if (!employee_id || !year) {
      return res.status(400).json({ error: 'Employee ID and year are required' });
    }

    const result = await pool.query(
      `SELECT 
       pr.*,
       e.full_name,
       e.employee_id as employee_id_string,
       d.name as department_name
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE pr.employee_id = $1 AND pr.year = $2
       ORDER BY pr.month`,
      [employee_id, year]
    );

    const parsedRecords = result.rows.map(row => ({
      Month: getMonthName(row.month),
      Year: row.year,
      'Basic Pay': parseNumeric(row.basic_pay),
      'Dearness Allowance': parseNumeric(row.dearness_allowance),
      'House Rent Allowance': parseNumeric(row.house_rent_allowance),
      'Special Allowance': parseNumeric(row.special_allowance),
      'Total Earnings': parseNumeric(row.total_earnings),
      'GPF Recovery': parseNumeric(row.gpf_recovery),
      'SLI': parseNumeric(row.sli),
      'GIS': parseNumeric(row.gis),
      'Total Deductions': parseNumeric(row.total_deductions),
      'Net Payable': parseNumeric(row.net_payable)
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(parsedRecords);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Annual Statement');

    const fileName = `annual_statement_${result.rows[0]?.employee_id_string || employee_id}_${year}.xlsx`;
    const filePath = path.join(reportsDir, fileName);
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
    });
  } catch (error) {
    next(error);
  }
};
