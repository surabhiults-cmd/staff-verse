import pool from '../config/database.js';
import { auditLog } from '../middleware/auth.js';

export const getAllEmployees = async (req, res, next) => {
  try {
    const { department_id, job_role_id, employment_type_id, is_active } = req.query;

    let query = `SELECT e.*, 
                 d.name as department_name,
                 jr.name as job_role_name,
                 et.name as employment_type_name,
                 ec.name as employee_category_name
                 FROM employees e
                 LEFT JOIN departments d ON e.department_id = d.id
                 LEFT JOIN job_roles jr ON e.job_role_id = jr.id
                 LEFT JOIN employment_types et ON e.employment_type_id = et.id
                 LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
                 WHERE 1=1`;
    
    const params = [];
    let paramCount = 1;

    if (department_id) {
      query += ` AND e.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    if (job_role_id) {
      query += ` AND e.job_role_id = $${paramCount}`;
      params.push(job_role_id);
      paramCount++;
    }

    if (employment_type_id) {
      query += ` AND e.employment_type_id = $${paramCount}`;
      params.push(employment_type_id);
      paramCount++;
    }

    if (is_active !== undefined) {
      query += ` AND e.is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    query += ' ORDER BY e.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ employees: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, 
       d.name as department_name,
       jr.name as job_role_name,
       et.name as employment_type_name,
       ec.name as employee_category_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN job_roles jr ON e.job_role_id = jr.id
       LEFT JOIN employment_types et ON e.employment_type_id = et.id
       LEFT JOIN employee_categories ec ON e.employee_category_id = ec.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employee_id,
      full_name,
      date_of_birth,
      contact_phone,
      contact_email,
      residential_address,
      date_of_joining,
      department_id,
      job_role_id,
      employment_type_id,
      employee_category_id,
      bank_account_number,
      bank_ifsc_code,
      bank_name,
      basic_pay
    } = req.body;

    // Check if employee_id already exists
    const existing = await pool.query(
      'SELECT id FROM employees WHERE employee_id = $1',
      [employee_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    const result = await pool.query(
      `INSERT INTO employees (
        employee_id, full_name, date_of_birth, contact_phone, contact_email,
        residential_address, date_of_joining, department_id, job_role_id,
        employment_type_id, employee_category_id, bank_account_number,
        bank_ifsc_code, bank_name, basic_pay
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        employee_id, full_name, date_of_birth, contact_phone, contact_email,
        residential_address, date_of_joining, department_id, job_role_id,
        employment_type_id, employee_category_id, bank_account_number,
        bank_ifsc_code, bank_name, basic_pay || 0
      ]
    );

    await auditLog(req, 'create', 'employees', result.rows[0].id, null, result.rows[0]);

    res.status(201).json({ employee: result.rows[0], message: 'Employee created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get old values for audit log
    const oldResult = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const oldValues = oldResult.rows[0];

    const {
      full_name,
      date_of_birth,
      contact_phone,
      contact_email,
      residential_address,
      date_of_joining,
      department_id,
      job_role_id,
      employment_type_id,
      employee_category_id,
      bank_account_number,
      bank_ifsc_code,
      bank_name,
      basic_pay,
      is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE employees SET
       full_name = COALESCE($1, full_name),
       date_of_birth = COALESCE($2, date_of_birth),
       contact_phone = COALESCE($3, contact_phone),
       contact_email = COALESCE($4, contact_email),
       residential_address = COALESCE($5, residential_address),
       date_of_joining = COALESCE($6, date_of_joining),
       department_id = COALESCE($7, department_id),
       job_role_id = COALESCE($8, job_role_id),
       employment_type_id = COALESCE($9, employment_type_id),
       employee_category_id = COALESCE($10, employee_category_id),
       bank_account_number = COALESCE($11, bank_account_number),
       bank_ifsc_code = COALESCE($12, bank_ifsc_code),
       bank_name = COALESCE($13, bank_name),
       basic_pay = COALESCE($14, basic_pay),
       is_active = COALESCE($15, is_active),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING *`,
      [
        full_name, date_of_birth, contact_phone, contact_email,
        residential_address, date_of_joining, department_id, job_role_id,
        employment_type_id, employee_category_id, bank_account_number,
        bank_ifsc_code, bank_name, basic_pay, is_active, id
      ]
    );

    await auditLog(req, 'update', 'employees', id, oldValues, result.rows[0]);

    res.json({ employee: result.rows[0], message: 'Employee updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get old values for audit log
    const oldResult = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
    
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    
    await auditLog(req, 'delete', 'employees', id, oldResult.rows[0], null);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};


