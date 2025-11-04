import { apiClient } from '@/lib/api';

export interface PayrollRecord {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_pay: number;
  dearness_allowance: number;
  house_rent_allowance: number;
  special_allowance: number;
  employer_nps_contribution: number;
  total_earnings: number;
  gpf_recovery: number;
  sli: number;
  gis: number;
  festival_bonus: number;
  home_building_advance: number;
  income_tax: number;
  rent_deduction: number;
  lic_contribution: number;
  medisep: number;
  additional_deductions: number;
  total_deductions: number;
  net_payable: number;
  days_worked: number;
  status: 'draft' | 'processed' | 'finalized';
  full_name?: string;
  employee_id_string?: string;
  department_name?: string;
  job_role_name?: string;
}

export interface PayrollResponse {
  payroll_records: PayrollRecord[];
}

export interface ProcessPayrollData {
  month: number;
  year: number;
}

export interface WorkingDaysData {
  employee_id: number;
  month: number;
  year: number;
  days_worked: number;
  total_days?: number;
}

export const payrollService = {
  async getRecords(filters?: {
    employee_id?: number;
    month?: number;
    year?: number;
  }): Promise<PayrollResponse> {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append('employee_id', filters.employee_id.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const query = params.toString();
    return apiClient.get<PayrollResponse>(`/payroll${query ? `?${query}` : ''}`);
  },

  async calculate(data: {
    employee_id: number;
    month: number;
    year: number;
  }): Promise<{ payroll: PayrollRecord }> {
    return apiClient.post<{ payroll: PayrollRecord }>('/payroll/calculate', data);
  },

  async processMonthly(data: ProcessPayrollData): Promise<{
    message: string;
    success: boolean;
    processed: number;
    errors: number;
    details: {
      processedRecords: Array<{ employee_id: number; status: string }>;
      errors: Array<{ employee_id: number; error: string }>;
    };
  }> {
    return apiClient.post('/payroll/process', data);
  },

  async finalize(data: ProcessPayrollData): Promise<{
    message: string;
    records_finalized: number;
  }> {
    return apiClient.post('/payroll/finalize', data);
  },

  async updateWorkingDays(data: WorkingDaysData): Promise<{
    working_days: {
      id: number;
      employee_id: number;
      month: number;
      year: number;
      days_worked: number;
      total_days: number;
    };
    message: string;
  }> {
    return apiClient.post('/payroll/working-days', data);
  }
};


