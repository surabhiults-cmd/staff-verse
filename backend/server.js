import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

// Import routes
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import payslipRoutes from './routes/payslipRoutes.js';
import configRoutes from './routes/configRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { swaggerSpec } from './config/swagger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'https://staff-verse.onrender.com', // Render backend (if frontend is deployed here)
  'https://*.netlify.app', // Netlify deployments (wildcard for all Netlify subdomains)
  // Add specific Netlify URL if you have one:
  // 'https://your-site-name.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowedOrigin => {
      // Support wildcard patterns (e.g., *.netlify.app)
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return origin === allowedOrigin;
    })) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HRMS Backend API is running' });
});

// API list endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'HRMS & Payroll Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      documentation: '/api-docs',
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      employees: {
        list: 'GET /api/employees',
        get: 'GET /api/employees/:id',
        create: 'POST /api/employees',
        update: 'PUT /api/employees/:id',
        delete: 'DELETE /api/employees/:id'
      },
      payroll: {
        records: 'GET /api/payroll',
        calculate: 'POST /api/payroll/calculate',
        process: 'POST /api/payroll/process',
        finalize: 'POST /api/payroll/finalize',
        workingDays: 'POST /api/payroll/working-days'
      },
      payslips: {
        generate: 'POST /api/payslips/generate',
        sendEmail: 'POST /api/payslips/send-email'
      },
      configuration: {
        hra: 'GET/POST /api/config/hra',
        da: 'GET/POST /api/config/da',
        departments: 'GET /api/config/departments',
        jobRoles: 'GET /api/config/job-roles',
        employmentTypes: 'GET /api/config/employment-types',
        categories: 'GET /api/config/employee-categories'
      },
      reports: {
        salaryDisbursement: 'GET /api/reports/salary-disbursement',
        providentFund: 'GET /api/reports/provident-fund',
        dailyWage: 'GET /api/reports/daily-wage',
        salaryDistribution: 'GET /api/reports/salary-distribution',
        annualStatement: 'GET /api/reports/annual-statement'
      }
    },
    documentation: 'Visit http://localhost:5000/api-docs for Swagger documentation'
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HRMS API Documentation'
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/config', configRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API List: http://localhost:${PORT}/api`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
