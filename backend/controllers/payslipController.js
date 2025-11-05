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

// Helper function to format currency
function formatCurrency(amount) {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to format currency with symbol
function formatCurrencyWithSymbol(amount) {
  return `Rs. ${formatCurrency(amount)}`;
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

    const pdfFileName = path.basename(pdfPath);
    const excelFileName = path.basename(excelPath);

    res.json({
      payslip: payslipResult.rows[0],
      pdf_url: `/api/payslips/files/${pdfFileName}`,
      excel_url: `/api/payslips/files/${excelFileName}`,
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

      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const margin = 50;
      const contentWidth = pageWidth - (margin * 2);

      // Helper function to draw a table row
      const drawTableRow = (x, y, label, amount, boxWidth, isBold = false) => {
        const labelWidth = boxWidth * 0.6;
        const amountWidth = boxWidth * 0.35;
        const amountX = x + labelWidth + 10;
        
        doc.fontSize(10);
        if (isBold) {
          doc.font('Helvetica-Bold');
        } else {
          doc.font('Helvetica');
        }
        
        doc.fillColor('#000000')
           .text(label, x + 10, y, { width: labelWidth, continued: false })
           .text(amount, amountX, y, { width: amountWidth, align: 'right' });
      };

      // Header
      doc.fillColor('#1e40af')
         .rect(margin, margin, contentWidth, 70)
         .fill();
      
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('PAYSLIP', margin, margin + 20, { 
           align: 'center',
           width: contentWidth
         });
      
      doc.fontSize(11)
         .font('Helvetica')
         .text('HRMS & Payroll Management System', margin, margin + 50, {
           align: 'center',
           width: contentWidth
         });

      let yPos = margin + 90;

      // Employee Information Section
      doc.fillColor('#f3f4f6')
         .rect(margin, yPos, contentWidth, 100)
         .fill();
      
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Employee Information', margin + 15, yPos + 10);
      
      yPos += 30;
      doc.fontSize(10)
         .font('Helvetica');
      
      doc.text(`Employee ID: ${payroll.employee_id_string}`, margin + 15, yPos, { width: contentWidth / 2 - 20 });
      doc.text(`Name: ${payroll.full_name}`, margin + 15, yPos + 18, { width: contentWidth / 2 - 20 });
      doc.text(`Department: ${payroll.department_name || 'N/A'}`, margin + 15, yPos + 36, { width: contentWidth / 2 - 20 });
      
      const rightColX = margin + contentWidth / 2 + 15;
      doc.text(`Designation: ${payroll.job_role_name || 'N/A'}`, rightColX, yPos, { width: contentWidth / 2 - 20 });
      doc.text(`Period: ${getMonthName(payroll.month)} ${payroll.year}`, rightColX, yPos + 18, { width: contentWidth / 2 - 20 });
      doc.text(`Days Worked: ${payroll.days_worked}`, rightColX, yPos + 36, { width: contentWidth / 2 - 20 });

      yPos = margin + 210;

      // Earnings and Deductions side by side
      const boxWidth = (contentWidth - 20) / 2;
      
      // Earnings Box
      doc.strokeColor('#000000')
         .lineWidth(1)
         .rect(margin, yPos, boxWidth, 300)
         .stroke();
      
      doc.fillColor('#000000')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('EARNINGS', margin + 10, yPos + 10, { width: boxWidth - 20, align: 'center' });
      
      let currentY = yPos + 40;
      
      const earnings = [
        ['Basic Pay', payroll.basic_pay],
        ['Dearness Allowance', payroll.dearness_allowance],
        ['House Rent Allowance', payroll.house_rent_allowance],
        ['Special Allowance', payroll.special_allowance],
        ['Employer NPS Contribution', payroll.employer_nps_contribution]
      ];

      earnings.forEach(([label, amount]) => {
        const formattedAmount = formatCurrency(amount);
        drawTableRow(margin, currentY, label + ':', `Rs. ${formattedAmount}`, boxWidth, false);
        currentY += 20;
      });

      // Total Earnings
      currentY += 10;
      doc.fillColor('#e5e7eb')
         .rect(margin + 10, currentY - 5, boxWidth - 20, 25)
         .fill();
      
      const totalEarningsFormatted = formatCurrency(payroll.total_earnings);
      drawTableRow(margin, currentY, 'Total Earnings:', `Rs. ${totalEarningsFormatted}`, boxWidth, true);

      // Deductions Box
      const deductionsX = margin + boxWidth + 20;
      currentY = yPos + 40;
      
      doc.strokeColor('#000000')
         .lineWidth(1)
         .rect(deductionsX, yPos, boxWidth, 300)
         .stroke();
      
      doc.fillColor('#000000')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('DEDUCTIONS', deductionsX + 10, yPos + 10, { width: boxWidth - 20, align: 'center' });

      const deductions = [
        ['GPF & Recovery', payroll.gpf_recovery],
        ['SLI', payroll.sli],
        ['GIS', payroll.gis],
        ['Festival Bonus', payroll.festival_bonus],
        ['Home Building Advance', payroll.home_building_advance],
        ['Income Tax', payroll.income_tax],
        ['Rent Deduction', payroll.rent_deduction],
        ['LIC Contribution', payroll.lic_contribution],
        ['Medisep', payroll.medisep],
        ['Additional Deductions', payroll.additional_deductions]
      ];

      deductions.forEach(([label, amount]) => {
        if (amount > 0) {
          const formattedAmount = formatCurrency(amount);
          drawTableRow(deductionsX, currentY, label + ':', `Rs. ${formattedAmount}`, boxWidth, false);
          currentY += 20;
        }
      });

      // Total Deductions
      currentY += 10;
      doc.fillColor('#e5e7eb')
         .rect(deductionsX + 10, currentY - 5, boxWidth - 20, 25)
         .fill();
      
      const totalDeductionsFormatted = formatCurrency(payroll.total_deductions);
      drawTableRow(deductionsX, currentY, 'Total Deductions:', `Rs. ${totalDeductionsFormatted}`, boxWidth, true);

      // Net Payable Section
      yPos = margin + 530;
      doc.fillColor('#e5e7eb')
         .rect(margin, yPos, contentWidth, 50)
         .fill();
      
      doc.strokeColor('#000000')
         .lineWidth(1)
         .rect(margin, yPos, contentWidth, 50)
         .stroke();

      const netPayableFormatted = formatCurrency(payroll.net_payable);
      doc.fillColor('#000000')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Net Payable:', margin + 20, yPos + 15, { width: 150 })
         .text(`Rs. ${netPayableFormatted}`, margin + 170, yPos + 15, {
           width: contentWidth - 190,
           align: 'right'
         });

      // Footer
      yPos = doc.page.height - margin - 30;
      doc.fillColor('#6b7280')
         .fontSize(8)
         .font('Helvetica')
         .text('This is a computer-generated payslip and does not require a signature.', 
               margin, yPos, {
                 align: 'center',
                 width: contentWidth
               });

      yPos += 12;
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin, yPos, {
        align: 'center',
        width: contentWidth
      });

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
