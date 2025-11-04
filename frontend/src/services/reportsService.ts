import { apiClient } from '@/lib/api';

export interface SalaryDisbursementReport {
  total_earnings: number;
  total_deductions: number;
  total_net_payable: number;
  employee_count: number;
  month: number;
  year: number;
}

export interface ProvidentFundSummary {
  employee_id: string;
  full_name: string;
  month: number;
  year: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
}

export interface DailyWageRecord {
  employee_id: string;
  full_name: string;
  month: number;
  year: number;
  days_worked: number;
  net_payable: number;
  status: string;
}

export interface SalaryDistribution {
  group_name: string;
  employee_count: number;
  total_earnings: number;
  total_deductions: number;
  total_net_payable: number;
}

export const reportsService = {
  async getSalaryDisbursement(filters?: {
    month?: number;
    year?: number;
    department_id?: number;
    category_id?: number;
  }): Promise<{ report: SalaryDisbursementReport[] }> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    
    const query = params.toString();
    return apiClient.get<{ report: SalaryDisbursementReport[] }>(`/reports/salary-disbursement${query ? `?${query}` : ''}`);
  },

  async getProvidentFund(filters?: {
    month?: number;
    year?: number;
  }): Promise<{ report: ProvidentFundSummary[] }> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const query = params.toString();
    return apiClient.get<{ report: ProvidentFundSummary[] }>(`/reports/provident-fund${query ? `?${query}` : ''}`);
  },

  async getDailyWage(filters?: {
    month?: number;
    year?: number;
  }): Promise<{ report: DailyWageRecord[] }> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const query = params.toString();
    return apiClient.get<{ report: DailyWageRecord[] }>(`/reports/daily-wage${query ? `?${query}` : ''}`);
  },

  async getSalaryDistribution(filters?: {
    month?: number;
    year?: number;
    group_by?: 'department' | 'category';
  }): Promise<{ report: SalaryDistribution[] }> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.group_by) params.append('group_by', filters.group_by);
    
    const query = params.toString();
    return apiClient.get<{ report: SalaryDistribution[] }>(`/reports/salary-distribution${query ? `?${query}` : ''}`);
  },

  async getAnnualStatement(employee_id: number, year: number): Promise<{
    employee_id: number;
    year: number;
    monthly_records: Array<any>;
    totals: {
      total_earnings: number;
      total_deductions: number;
      total_net_payable: number;
    };
  }> {
    return apiClient.get(`/reports/annual-statement?employee_id=${employee_id}&year=${year}`);
  },

  async downloadSalaryDisbursement(filters?: {
    month?: number;
    year?: number;
    department_id?: number;
    category_id?: number;
  }): Promise<void> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    
    const query = params.toString();
    const filename = `salary_disbursement_${filters?.year || 'all'}_${filters?.month || 'all'}.xlsx`;
    await apiClient.downloadFile(`/reports/salary-disbursement/download${query ? `?${query}` : ''}`, filename);
  },

  async downloadProvidentFund(filters?: {
    month?: number;
    year?: number;
  }): Promise<void> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const query = params.toString();
    const filename = `provident_fund_${filters?.year || 'all'}_${filters?.month || 'all'}.xlsx`;
    await apiClient.downloadFile(`/reports/provident-fund/download${query ? `?${query}` : ''}`, filename);
  },

  async downloadDailyWage(filters?: {
    month?: number;
    year?: number;
  }): Promise<void> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const query = params.toString();
    const filename = `daily_wage_${filters?.year || 'all'}_${filters?.month || 'all'}.xlsx`;
    await apiClient.downloadFile(`/reports/daily-wage/download${query ? `?${query}` : ''}`, filename);
  },

  async downloadSalaryDistribution(filters?: {
    month?: number;
    year?: number;
    group_by?: 'department' | 'category';
  }): Promise<void> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.group_by) params.append('group_by', filters.group_by);
    
    const query = params.toString();
    const filename = `salary_distribution_${filters?.group_by || 'department'}_${filters?.year || 'all'}_${filters?.month || 'all'}.xlsx`;
    await apiClient.downloadFile(`/reports/salary-distribution/download${query ? `?${query}` : ''}`, filename);
  },

  async downloadAnnualStatement(employee_id: number, year: number): Promise<void> {
    const filename = `annual_statement_${employee_id}_${year}.xlsx`;
    await apiClient.downloadFile(`/reports/annual-statement/download?employee_id=${employee_id}&year=${year}`, filename);
  }
};


