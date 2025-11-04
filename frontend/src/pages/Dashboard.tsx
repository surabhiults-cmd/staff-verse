import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { payrollService } from "@/services/payrollService";
import { useQuery } from "@tanstack/react-query";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

export default function Dashboard() {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ is_active: true }),
  });

  // Fetch current month payroll
  const { data: payrollData } = useQuery({
    queryKey: ['payroll', currentMonth, currentYear],
    queryFn: () => payrollService.getRecords({ month: currentMonth, year: currentYear }),
  });

  // Fetch salary distribution
  const { data: distributionData } = useQuery({
    queryKey: ['distribution', currentMonth, currentYear],
    queryFn: () => payrollService.getRecords({ month: currentMonth, year: currentYear }),
  });

  const totalEmployees = employeesData?.employees.length || 0;
  const payrollRecords = payrollData?.payroll_records || [];
  const totalPayroll = payrollRecords.reduce((sum, record) => {
    const netPayable = record.net_payable ?? 0;
    return sum + (typeof netPayable === 'number' ? netPayable : parseFloat(String(netPayable)) || 0);
  }, 0);
  const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  // Calculate department distribution
  const departmentMap = new Map<string, number>();
  employeesData?.employees.forEach(emp => {
    const dept = emp.department_name || 'Unknown';
    departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
  });

  const departmentDistribution = Array.from(departmentMap.entries()).map(([name, count]) => ({
    name,
    count,
    percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees.toString(),
      change: "Active employees",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Payroll Processed",
      value: `₹${(totalPayroll / 100000).toFixed(1)}L`,
      change: "Current month",
      icon: DollarSign,
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Pending Approvals",
      value: payrollRecords.filter(r => r.status === 'draft').length.toString(),
      change: "Draft records",
      icon: Clock,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Avg. Salary",
      value: `₹${Math.round(avgSalary).toLocaleString('en-IN')}`,
      change: "Average monthly",
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your HRMS overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg bg-gradient-to-br ${stat.gradient} p-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Recent Payroll Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollRecords.slice(0, 5).map((record, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {record.full_name || `Employee ${record.employee_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payroll {record.status} · {record.department_name || 'N/A'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">₹{(record.net_payable ?? 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {payrollRecords.length === 0 && (
                <p className="text-sm text-muted-foreground">No payroll records for current month</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentDistribution.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.count} employees</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {departmentDistribution.length === 0 && (
                <p className="text-sm text-muted-foreground">No department data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}