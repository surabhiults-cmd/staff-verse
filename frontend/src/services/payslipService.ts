import { apiClient } from '@/lib/api';

export interface PayslipResponse {
  payslip: {
    id: number;
    payroll_record_id: number;
    employee_id: number;
    month: number;
    year: number;
    pdf_path: string;
    excel_path: string;
  };
  pdf_url: string;
  excel_url: string;
  message: string;
}

export const payslipService = {
  async generatePayslip(payrollRecordId: number): Promise<PayslipResponse> {
    return apiClient.post<PayslipResponse>('/payslips/generate', {
      payroll_record_id: payrollRecordId
    });
  },

  async downloadPayslip(payrollRecordId: number, type: 'pdf' | 'excel' = 'pdf'): Promise<void> {
    // First generate the payslip if it doesn't exist
    const response = await this.generatePayslip(payrollRecordId);
    
    // Then download the file
    const url = type === 'pdf' ? response.pdf_url : response.excel_url;
    const filename = type === 'pdf' 
      ? `payslip_${payrollRecordId}.pdf`
      : `payslip_${payrollRecordId}.xlsx`;
    
    await apiClient.downloadFile(url, filename);
  },

  async sendEmail(payslipId: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/payslips/send-email', {
      payslip_id: payslipId
    });
  }
};

