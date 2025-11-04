import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS & Payroll Management System API',
      version: '1.0.0',
      description: 'RESTful API documentation for HRMS & Payroll Management System',
      contact: {
        name: 'API Support',
        email: 'support@hrms.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.hrms.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        Employee: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            employee_id: { type: 'string' },
            full_name: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            contact_phone: { type: 'string' },
            contact_email: { type: 'string' },
            residential_address: { type: 'string' },
            date_of_joining: { type: 'string', format: 'date' },
            department_id: { type: 'integer' },
            job_role_id: { type: 'integer' },
            employment_type_id: { type: 'integer' },
            employee_category_id: { type: 'integer' },
            bank_account_number: { type: 'string' },
            bank_ifsc_code: { type: 'string' },
            bank_name: { type: 'string' },
            basic_pay: { type: 'number', format: 'float' },
            is_active: { type: 'boolean' }
          }
        },
        PayrollRecord: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            employee_id: { type: 'integer' },
            month: { type: 'integer' },
            year: { type: 'integer' },
            basic_pay: { type: 'number' },
            dearness_allowance: { type: 'number' },
            house_rent_allowance: { type: 'number' },
            special_allowance: { type: 'number' },
            employer_nps_contribution: { type: 'number' },
            total_earnings: { type: 'number' },
            total_deductions: { type: 'number' },
            net_payable: { type: 'number' },
            status: { type: 'string', enum: ['draft', 'processed', 'finalized'] }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            role_id: { type: 'integer' },
            role_name: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Employees', description: 'Employee management endpoints' },
      { name: 'Payroll', description: 'Payroll processing endpoints' },
      { name: 'Payslips', description: 'Payslip generation endpoints' },
      { name: 'Configuration', description: 'System configuration endpoints' },
      { name: 'Reports', description: 'Reporting and analytics endpoints' }
    ]
  },
  apis: ['./routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
