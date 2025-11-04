import pool from '../config/database.js';
import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create payslips directory if it doesn't exist
const payslipsDir = path.join(__dirname, '../payslips');
if (!fs.existsSync(payslipsDir)) {
  fs.mkdirSync(payslipsDir, { recursive: true });
}

// Helper function to convert PostgreSQL numeric types to JavaScript numbers
function parseNumeric(value) {
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export const generatePayslip = async (req, res, next) => {
  try {
    const { payroll_record_id } = req.body;

    // Get payroll record with employee details
    const result = await pool.query(
      `SELECT pr.*, 
       e.full_name, e.employee_id as employee_id_string, e.contact_email,
       d.name as department_name,
       jr.name as job_role_name
       FROM payroll_records pr
       JOIN employees e ON pr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN job_roles jr ON e.job_role_id = jr.id
       WHERE pr.id = $1`,
      [payroll_record_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const payrollRaw = result.rows[0];
    
    // Parse numeric fields to numbers
    const payroll = {
      ...payrollRaw,
      basic_pay: parseNumeric(payrollRaw.basic_pay),
      dearness_allowance: parseNumeric(payrollRaw.dearness_allowance),
      house_rent_allowance: parseNumeric(payrollRaw.house_rent_allowance),
      special_allowance: parseNumeric(payrollRaw.special_allowance),
      employer_nps_contribution: parseNumeric(payrollRaw.employer_nps_contribution),
      total_earnings: parseNumeric(payrollRaw.total_earnings),
      gpf_recovery: parseNumeric(payrollRaw.gpf_recovery),
      sli: parseNumeric(payrollRaw.sli),
      gis: parseNumeric(payrollRaw.gis),
      festival_bonus: parseNumeric(payrollRaw.festival_bonus),
      home_building_advance: parseNumeric(payrollRaw.home_building_advance),
      income_tax: parseNumeric(payrollRaw.income_tax),
      rent_deduction: parseNumeric(payrollRaw.rent_deduction),
      lic_contribution: parseNumeric(payrollRaw.lic_contribution),
      medisep: parseNumeric(payrollRaw.medisep),
      additional_deductions: parseNumeric(payrollRaw.additional_deductions),
      total_deductions: parseNumeric(payrollRaw.total_deductions),
      net_payable: parseNumeric(payrollRaw.net_payable),
      days_worked: parseNumeric(payrollRaw.days_worked)
    };

    // Generate PDF
    const pdfPath = await generatePDFPayslip(payroll);
    
    // Generate Excel
    const excelPath = await generateExcelPayslip(payroll);

    // Save payslip record
    const payslipResult = await pool.query(
      `INSERT INTO payslips (payroll_record_id, employee_id, month, year, pdf_path, excel_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (payroll_record_id) 
       DO UPDATE SET pdf_path = $5, excel_path = $6
       RETURNING *`,
      [
        payroll_record_id,
        payroll.employee_id,
        payroll.month,
        payroll.year,
        pdfPath,
        excelPath
      ]
    );

    res.json({
      payslip: payslipResult.rows[0],
      pdf_url: `/payslips/${path.basename(pdfPath)}`,
      excel_url: `/payslips/${path.basename(excelPath)}`,
      message: 'Payslip generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const generatePDFPayslip = async (payroll) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `payslip_${payroll.employee_id_string}_${payroll.year}_${String(payroll.month).padStart(2, '0')}.pdf`;
      const filePath = path.join(payslipsDir, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('PAYSLIP', { align: 'center' });
      doc.moveDown();

      // Company Info
      doc.fontSize(12).text('HRMS & Payroll Management System', { align: 'center' });
      doc.moveDown(2);

      // Employee Info
      doc.fontSize(14).text('Employee Information', { underline: true });
      doc.fontSize(10);
      doc.text(`Employee ID: ${payroll.employee_id_string}`);
      doc.text(`Name: ${payroll.full_name}`);
      doc.text(`Department: ${payroll.department_name || 'N/A'}`);
      doc.text(`Designation: ${payroll.job_role_name || 'N/A'}`);
      doc.text(`Period: ${getMonthName(payroll.month)} ${payroll.year}`);
      doc.text(`Days Worked: ${payroll.days_worked}`);
      doc.moveDown();

      // Earnings Section
      doc.fontSize(14).text('EARNINGS', { underline: true });
      doc.fontSize(10);
      doc.text(`Basic Pay: ₹${payroll.basic_pay.toFixed(2)}`);
      doc.text(`Dearness Allowance: ₹${payroll.dearness_allowance.toFixed(2)}`);
      doc.text(`House Rent Allowance: ₹${payroll.house_rent_allowance.toFixed(2)}`);
      doc.text(`Special Allowance: ₹${payroll.special_allowance.toFixed(2)}`);
      doc.text(`Employer NPS Contribution: ₹${payroll.employer_nps_contribution.toFixed(2)}`);
      doc.moveDown();
      doc.fontSize(12).text(`Total Earnings: ₹${payroll.total_earnings.toFixed(2)}`, { align: 'right' });
      doc.moveDown();

      // Deductions Section
      doc.fontSize(14).text('DEDUCTIONS', { underline: true });
      doc.fontSize(10);
      doc.text(`GPF & Recovery: ₹${payroll.gpf_recovery.toFixed(2)}`);
      doc.text(`SLI: ₹${payroll.sli.toFixed(2)}`);
      doc.text(`GIS: ₹${payroll.gis.toFixed(2)}`);
      doc.text(`Festival Bonus: ₹${payroll.festival_bonus.toFixed(2)}`);
      doc.text(`Home Building Advance: ₹${payroll.home_building_advance.toFixed(2)}`);
      doc.text(`Income Tax: ₹${payroll.income_tax.toFixed(2)}`);
      doc.text(`Rent Deduction: ₹${payroll.rent_deduction.toFixed(2)}`);
      doc.text(`LIC Contribution: ₹${payroll.lic_contribution.toFixed(2)}`);
      doc.text(`Medisep: ₹${payroll.medisep.toFixed(2)}`);
      doc.text(`Additional Deductions: ₹${payroll.additional_deductions.toFixed(2)}`);
      doc.moveDown();
      doc.fontSize(12).text(`Total Deductions: ₹${payroll.total_deductions.toFixed(2)}`, { align: 'right' });
      doc.moveDown();

      // Net Payable
      doc.fontSize(16).text(`Net Payable: ₹${payroll.net_payable.toFixed(2)}`, { align: 'right', bold: true });
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).text('This is a system generated payslip.', { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const generateExcelPayslip = async (payroll) => {
  try {
    const fileName = `payslip_${payroll.employee_id_string}_${payroll.year}_${String(payroll.month).padStart(2, '0')}.xlsx`;
    const filePath = path.join(payslipsDir, fileName);

    const workbook = XLSX.utils.book_new();

    // Employee Info Sheet
    const employeeData = [
      ['PAYSLIP'],
      ['HRMS & Payroll Management System'],
      [],
      ['Employee Information'],
      ['Employee ID', payroll.employee_id_string],
      ['Name', payroll.full_name],
      ['Department', payroll.department_name || 'N/A'],
      ['Designation', payroll.job_role_name || 'N/A'],
      ['Period', `${getMonthName(payroll.month)} ${payroll.year}`],
      ['Days Worked', payroll.days_worked],
      [],
      ['EARNINGS'],
      ['Basic Pay', payroll.basic_pay],
      ['Dearness Allowance', payroll.dearness_allowance],
      ['House Rent Allowance', payroll.house_rent_allowance],
      ['Special Allowance', payroll.special_allowance],
      ['Employer NPS Contribution', payroll.employer_nps_contribution],
      ['Total Earnings', payroll.total_earnings],
      [],
      ['DEDUCTIONS'],
      ['GPF & Recovery', payroll.gpf_recovery],
      ['SLI', payroll.sli],
      ['GIS', payroll.gis],
      ['Festival Bonus', payroll.festival_bonus],
      ['Home Building Advance', payroll.home_building_advance],
      ['Income Tax', payroll.income_tax],
      ['Rent Deduction', payroll.rent_deduction],
      ['LIC Contribution', payroll.lic_contribution],
      ['Medisep', payroll.medisep],
      ['Additional Deductions', payroll.additional_deductions],
      ['Total Deductions', payroll.total_deductions],
      [],
      ['Net Payable', payroll.net_payable],
      [],
      ['Generated on', new Date().toLocaleDateString()]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payslip');

    XLSX.writeFile(workbook, filePath);
    return filePath;
  } catch (error) {
    throw new Error(`Excel generation error: ${error.message}`);
  }
};

export const sendPayslipEmail = async (req, res, next) => {
  try {
    const { payslip_id } = req.body;

    // Get payslip with employee email
    const result = await pool.query(
      `SELECT p.*, e.contact_email, e.full_name
       FROM payslips p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.id = $1`,
      [payslip_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    const payslip = result.rows[0];

    if (!payslip.contact_email) {
      return res.status(400).json({ error: 'Employee email not found' });
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Send email with attachments
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: payslip.contact_email,
      subject: `Payslip - ${getMonthName(payslip.month)} ${payslip.year}`,
      text: `Dear ${payslip.full_name},\n\nPlease find your payslip for ${getMonthName(payslip.month)} ${payslip.year} attached.\n\nBest regards,\nHRMS Team`,
      attachments: [
        {
          filename: path.basename(payslip.pdf_path),
          path: payslip.pdf_path
        },
        {
          filename: path.basename(payslip.excel_path),
          path: payslip.excel_path
        }
      ]
    });

    // Update payslip record
    await pool.query(
      `UPDATE payslips SET email_sent = true, email_sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [payslip_id]
    );

    res.json({ message: 'Payslip sent successfully' });
  } catch (error) {
    next(error);
  }
};

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || 'Unknown';
};
