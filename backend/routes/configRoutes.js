import express from 'express';
import {
  getHRAConfig,
  updateHRAConfig,
  getDAConfig,
  updateDAConfig,
  getDepartments,
  getJobRoles,
  getEmploymentTypes,
  getEmployeeCategories,
  getAllowanceDeductionMappings,
  createAllowanceDeductionMapping,
  getAllowances,
  getDeductions
} from '../controllers/configController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// HRA Configuration
router.get('/hra', getHRAConfig);
router.post('/hra', authorize('administrator'), updateHRAConfig);

// DA Configuration
router.get('/da', getDAConfig);
router.post('/da', authorize('administrator'), updateDAConfig);

// Lookup Data (all authenticated users can view)
router.get('/departments', getDepartments);
router.get('/job-roles', getJobRoles);
router.get('/employment-types', getEmploymentTypes);
router.get('/employee-categories', getEmployeeCategories);
router.get('/allowances', getAllowances);
router.get('/deductions', getDeductions);

// Allowance-Deduction Mappings
router.get('/mappings', getAllowanceDeductionMappings);
router.post('/mappings', authorize('administrator'), createAllowanceDeductionMapping);

export default router;


