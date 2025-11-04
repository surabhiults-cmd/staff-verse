import express from 'express';
import {
  generatePayslip,
  sendPayslipEmail
} from '../controllers/payslipController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate payslip (PDF and Excel)
router.post('/generate', authorize('administrator', 'payroll_officer'), generatePayslip);

// Send payslip via email
router.post('/send-email', authorize('administrator', 'payroll_officer'), sendPayslipEmail);

// Serve payslip files
router.use('/files', express.static(path.join(__dirname, '../payslips')));

export default router;



