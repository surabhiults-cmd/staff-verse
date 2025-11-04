import express from 'express';
import {
  calculatePayroll,
  getPayrollRecord,
  processMonthlyPayroll,
  finalizePayroll,
  updateWorkingDays
} from '../controllers/payrollController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Calculate payroll for an employee
router.post('/calculate', authorize('administrator', 'payroll_officer'), calculatePayroll);

// Get payroll records
router.get('/', getPayrollRecord);

// Process monthly payroll for all employees
router.post('/process', authorize('administrator', 'payroll_officer'), processMonthlyPayroll);

// Finalize payroll
router.post('/finalize', authorize('administrator', 'payroll_officer'), finalizePayroll);

// Update working days
router.post('/working-days', authorize('administrator', 'payroll_officer'), updateWorkingDays);

export default router;


