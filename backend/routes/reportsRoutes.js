import express from 'express';
import {
  getSalaryDisbursementReport,
  getProvidentFundSummary,
  getDailyWageRecords,
  getDeductionSummary,
  getSalaryDistribution,
  getAnnualSalaryStatement,
  downloadSalaryDisbursementReport,
  downloadProvidentFundReport,
  downloadDailyWageReport,
  downloadSalaryDistributionReport,
  downloadAnnualStatementReport
} from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/salary-disbursement', getSalaryDisbursementReport);
router.get('/salary-disbursement/download', downloadSalaryDisbursementReport);
router.get('/provident-fund', getProvidentFundSummary);
router.get('/provident-fund/download', downloadProvidentFundReport);
router.get('/daily-wage', getDailyWageRecords);
router.get('/daily-wage/download', downloadDailyWageReport);
router.get('/deduction-summary', getDeductionSummary);
router.get('/salary-distribution', getSalaryDistribution);
router.get('/salary-distribution/download', downloadSalaryDistributionReport);
router.get('/annual-statement', getAnnualSalaryStatement);
router.get('/annual-statement/download', downloadAnnualStatementReport);

export default router;


