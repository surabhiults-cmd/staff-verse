import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all employees (all authenticated users can view)
router.get('/', getAllEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create employee (admin and payroll officer only)
router.post('/', authorize('administrator', 'payroll_officer'), createEmployee);

// Update employee (admin and payroll officer only)
router.put('/:id', authorize('administrator', 'payroll_officer'), updateEmployee);

// Delete employee (admin only)
router.delete('/:id', authorize('administrator'), deleteEmployee);

export default router;


