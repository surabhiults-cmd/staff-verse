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
    try {
      // First generate the payslip if it doesn't exist
      const response = await this.generatePayslip(payrollRecordId);
      
      // Extract filename from URL
      const url = type === 'pdf' ? response.pdf_url : response.excel_url;
      const filename = url.split('/').pop() || (type === 'pdf' ? `payslip_${payrollRecordId}.pdf` : `payslip_${payrollRecordId}.xlsx`);
      
      // Backend now returns /api/payslips/files/filename, so we can use it directly
      // Extract the endpoint part (remove /api prefix since apiClient adds it)
      const endpoint = url.replace(/^\/api/, '');
      
      await apiClient.downloadFile(endpoint, filename);
    } catch (error: any) {
      // Re-throw with better error message
      throw new Error(error.message || `Failed to download payslip: ${error}`);
    }
  },

  async sendEmail(payslipId: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/payslips/send-email', {
      payslip_id: payslipId
    });
  }
};

