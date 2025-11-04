import pool from '../config/database.js';
import { auditLog } from '../middleware/auth.js';

// HRA Configuration
export const getHRAConfig = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT hc.*, ec.name as category_name
       FROM hra_configurations hc
       JOIN employee_categories ec ON hc.employee_category_id = ec.id
       ORDER BY ec.name`
    );
    res.json({ hra_configs: result.rows });
  } catch (error) {
    next(error);
  }
};

export const updateHRAConfig = async (req, res, next) => {
  try {
    const { employee_category_id, percentage } = req.body;

    const result = await pool.query(
      `INSERT INTO hra_configurations (employee_category_id, percentage)
       VALUES ($1, $2)
       ON CONFLICT (employee_category_id)
       DO UPDATE SET percentage = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [employee_category_id, percentage]
    );

    await auditLog(req, 'update', 'hra_configurations', result.rows[0].id, null, result.rows[0]);

    res.json({ hra_config: result.rows[0], message: 'HRA configuration updated successfully' });
  } catch (error) {
    next(error);
  }
};

// DA Configuration
export const getDAConfig = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT dc.*, ec.name as category_name
       FROM da_configurations dc
       JOIN employee_categories ec ON dc.employee_category_id = ec.id
       ORDER BY ec.name`
    );
    res.json({ da_configs: result.rows });
  } catch (error) {
    next(error);
  }
};

export const updateDAConfig = async (req, res, next) => {
  try {
    const { employee_category_id, percentage } = req.body;

    const result = await pool.query(
      `INSERT INTO da_configurations (employee_category_id, percentage)
       VALUES ($1, $2)
       ON CONFLICT (employee_category_id)
       DO UPDATE SET percentage = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [employee_category_id, percentage]
    );

    await auditLog(req, 'update', 'da_configurations', result.rows[0].id, null, result.rows[0]);

    res.json({ da_config: result.rows[0], message: 'DA configuration updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Lookup Data (Departments, Job Roles, Employment Types, Categories)
export const getDepartments = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    res.json({ departments: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getJobRoles = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM job_roles ORDER BY name');
    res.json({ job_roles: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getEmploymentTypes = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM employment_types ORDER BY name');
    res.json({ employment_types: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeCategories = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM employee_categories ORDER BY name');
    res.json({ employee_categories: result.rows });
  } catch (error) {
    next(error);
  }
};

// Allowance-Deduction Mappings
export const getAllowanceDeductionMappings = async (req, res, next) => {
  try {
    const { job_role_id, employment_type_id } = req.query;

    let query = `SELECT adm.*, 
                 a.name as allowance_name,
                 d.name as deduction_name,
                 jr.name as job_role_name,
                 et.name as employment_type_name
                 FROM allowance_deduction_mappings adm
                 LEFT JOIN allowances a ON adm.allowance_id = a.id
                 LEFT JOIN deductions d ON adm.deduction_id = d.id
                 LEFT JOIN job_roles jr ON adm.job_role_id = jr.id
                 LEFT JOIN employment_types et ON adm.employment_type_id = et.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

    if (job_role_id) {
      query += ` AND adm.job_role_id = $${paramCount}`;
      params.push(job_role_id);
      paramCount++;
    }

    if (employment_type_id) {
      query += ` AND adm.employment_type_id = $${paramCount}`;
      params.push(employment_type_id);
      paramCount++;
    }

    const result = await pool.query(query, params);
    res.json({ mappings: result.rows });
  } catch (error) {
    next(error);
  }
};

export const createAllowanceDeductionMapping = async (req, res, next) => {
  try {
    const { job_role_id, employment_type_id, allowance_id, deduction_id, default_amount, is_mandatory } = req.body;

    const result = await pool.query(
      `INSERT INTO allowance_deduction_mappings 
       (job_role_id, employment_type_id, allowance_id, deduction_id, default_amount, is_mandatory)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [job_role_id, employment_type_id, allowance_id, deduction_id, default_amount || 0, is_mandatory || false]
    );

    await auditLog(req, 'create', 'allowance_deduction_mappings', result.rows[0].id, null, result.rows[0]);

    res.json({ mapping: result.rows[0], message: 'Mapping created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllowances = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM allowances ORDER BY name');
    res.json({ allowances: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getDeductions = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM deductions ORDER BY name');
    res.json({ deductions: result.rows });
  } catch (error) {
    next(error);
  }
};



