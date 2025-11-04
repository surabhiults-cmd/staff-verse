import { apiClient } from '@/lib/api';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface JobRole {
  id: number;
  name: string;
  description?: string;
}

export interface EmploymentType {
  id: number;
  name: string;
  description?: string;
}

export interface EmployeeCategory {
  id: number;
  name: string;
  description?: string;
}

export interface HRAConfig {
  id: number;
  employee_category_id: number;
  percentage: number;
  category_name?: string;
}

export interface DAConfig {
  id: number;
  employee_category_id: number;
  percentage: number;
  category_name?: string;
}

export const configService = {
  // Departments
  async getDepartments(): Promise<{ departments: Department[] }> {
    return apiClient.get<{ departments: Department[] }>('/config/departments');
  },

  // Job Roles
  async getJobRoles(): Promise<{ job_roles: JobRole[] }> {
    return apiClient.get<{ job_roles: JobRole[] }>('/config/job-roles');
  },

  // Employment Types
  async getEmploymentTypes(): Promise<{ employment_types: EmploymentType[] }> {
    return apiClient.get<{ employment_types: EmploymentType[] }>('/config/employment-types');
  },

  // Employee Categories
  async getEmployeeCategories(): Promise<{ employee_categories: EmployeeCategory[] }> {
    return apiClient.get<{ employee_categories: EmployeeCategory[] }>('/config/employee-categories');
  },

  // HRA Configuration
  async getHRAConfig(): Promise<{ hra_configs: HRAConfig[] }> {
    return apiClient.get<{ hra_configs: HRAConfig[] }>('/config/hra');
  },

  async updateHRAConfig(data: {
    employee_category_id: number;
    percentage: number;
  }): Promise<{ hra_config: HRAConfig; message: string }> {
    return apiClient.post('/config/hra', data);
  },

  // DA Configuration
  async getDAConfig(): Promise<{ da_configs: DAConfig[] }> {
    return apiClient.get<{ da_configs: DAConfig[] }>('/config/da');
  },

  async updateDAConfig(data: {
    employee_category_id: number;
    percentage: number;
  }): Promise<{ da_config: DAConfig; message: string }> {
    return apiClient.post('/config/da', data);
  }
};


