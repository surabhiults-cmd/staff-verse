import { apiClient } from '@/lib/api';

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  date_of_birth: string;
  contact_phone?: string;
  contact_email?: string;
  residential_address?: string;
  date_of_joining: string;
  department_id?: number;
  job_role_id?: number;
  employment_type_id?: number;
  employee_category_id?: number;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  basic_pay: number;
  is_active: boolean;
  department_name?: string;
  job_role_name?: string;
  employment_type_name?: string;
  employee_category_name?: string;
}

export interface CreateEmployeeData {
  employee_id: string;
  full_name: string;
  date_of_birth: string;
  contact_phone?: string;
  contact_email?: string;
  residential_address?: string;
  date_of_joining: string;
  department_id?: number;
  job_role_id?: number;
  employment_type_id?: number;
  employee_category_id?: number;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  bank_name?: string;
  basic_pay?: number;
}

export interface EmployeesResponse {
  employees: Employee[];
}

export const employeeService = {
  async getAll(filters?: {
    department_id?: number;
    job_role_id?: number;
    employment_type_id?: number;
    is_active?: boolean;
  }): Promise<EmployeesResponse> {
    const params = new URLSearchParams();
    if (filters?.department_id) params.append('department_id', filters.department_id.toString());
    if (filters?.job_role_id) params.append('job_role_id', filters.job_role_id.toString());
    if (filters?.employment_type_id) params.append('employment_type_id', filters.employment_type_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    
    const query = params.toString();
    return apiClient.get<EmployeesResponse>(`/employees${query ? `?${query}` : ''}`);
  },

  async getById(id: number): Promise<{ employee: Employee }> {
    return apiClient.get<{ employee: Employee }>(`/employees/${id}`);
  },

  async create(data: CreateEmployeeData): Promise<{ employee: Employee; message: string }> {
    return apiClient.post<{ employee: Employee; message: string }>('/employees', data);
  },

  async update(id: number, data: Partial<CreateEmployeeData>): Promise<{ employee: Employee; message: string }> {
    return apiClient.put<{ employee: Employee; message: string }>(`/employees/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/employees/${id}`);
  }
};


