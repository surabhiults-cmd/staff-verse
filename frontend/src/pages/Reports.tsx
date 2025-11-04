import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

const reports = [
  { 
    id: 'salary-disbursement',
    name: "Monthly Salary Disbursement", 
    description: "Detailed salary payment records", 
    icon: "📊" 
  },
  { 
    id: 'provident-fund',
    name: "Provident Fund Report", 
    description: "PF contributions and summary", 
    icon: "💰" 
  },
  { 
    id: 'daily-wage',
    name: "Daily Wage Records", 
    description: "Daily wage worker payment records", 
    icon: "👷" 
  },
  { 
    id: 'salary-distribution',
    name: "Department Wise Summary", 
    description: "Employee and payroll by department", 
    icon: "🏢" 
  },
  { 
    id: 'annual-statement',
    name: "Annual Salary Statement", 
    description: "Year-end salary summary", 
    icon: "📈" 
  },
];

export default function Reports() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    month: getCurrentMonth(),
    year: getCurrentYear(),
    employee_id: '',
  });

  const { data: salaryDisbursement } = useQuery({
    queryKey: ['report', 'salary-disbursement', filters.month, filters.year],
    queryFn: () => reportsService.getSalaryDisbursement({
      month: filters.month,
      year: filters.year,
    }),
    enabled: selectedReport === 'salary-disbursement',
  });

  const { data: providentFund } = useQuery({
    queryKey: ['report', 'provident-fund', filters.month, filters.year],
    queryFn: () => reportsService.getProvidentFund({
      month: filters.month,
      year: filters.year,
    }),
    enabled: selectedReport === 'provident-fund',
  });

  const { data: dailyWage } = useQuery({
    queryKey: ['report', 'daily-wage', filters.month, filters.year],
    queryFn: () => reportsService.getDailyWage({
      month: filters.month,
      year: filters.year,
    }),
    enabled: selectedReport === 'daily-wage',
  });

  const { data: salaryDistribution } = useQuery({
    queryKey: ['report', 'salary-distribution', filters.month, filters.year],
    queryFn: () => reportsService.getSalaryDistribution({
      month: filters.month,
      year: filters.year,
      group_by: 'department',
    }),
    enabled: selectedReport === 'salary-distribution',
  });

  const handleDownload = async (reportId: string) => {
    try {
      switch (reportId) {
        case 'salary-disbursement':
          await reportsService.downloadSalaryDisbursement({
            month: filters.month,
            year: filters.year,
          });
          break;
        case 'provident-fund':
          await reportsService.downloadProvidentFund({
            month: filters.month,
            year: filters.year,
          });
          break;
        case 'daily-wage':
          await reportsService.downloadDailyWage({
            month: filters.month,
            year: filters.year,
          });
          break;
        case 'salary-distribution':
          await reportsService.downloadSalaryDistribution({
            month: filters.month,
            year: filters.year,
            group_by: 'department',
          });
          break;
        case 'annual-statement':
          if (!filters.employee_id) {
            toast({
              title: "Error",
              description: "Employee ID is required for annual statement",
              variant: "destructive",
            });
            return;
          }
          await reportsService.downloadAnnualStatement(
            parseInt(filters.employee_id),
            filters.year
          );
          break;
        default:
          toast({
            title: "Error",
            description: "Unknown report type",
            variant: "destructive",
          });
          return;
      }
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const renderReportContent = () => {
    if (!selectedReport) return null;

    switch (selectedReport) {
      case 'salary-disbursement':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monthly Salary Disbursement Report</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Total Deductions</TableHead>
                  <TableHead>Net Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryDisbursement?.report.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{record.month}/{record.year}</TableCell>
                    <TableCell>{record.employee_count}</TableCell>
                    <TableCell>₹{record.total_earnings.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.total_deductions.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.total_net_payable.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'provident-fund':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Provident Fund Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Employee Contribution</TableHead>
                  <TableHead>Employer Contribution</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providentFund?.report.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell>{record.month}/{record.year}</TableCell>
                    <TableCell>₹{record.employee_contribution.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.employer_contribution.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.total_contribution.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'daily-wage':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Daily Wage Records</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Days Worked</TableHead>
                  <TableHead>Net Payable</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyWage?.report.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{record.full_name}</TableCell>
                    <TableCell>{record.month}/{record.year}</TableCell>
                    <TableCell>{record.days_worked}</TableCell>
                    <TableCell>₹{record.net_payable.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{record.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case 'salary-distribution':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Salary Distribution by Department</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Total Deductions</TableHead>
                  <TableHead>Net Payable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryDistribution?.report.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{record.group_name}</TableCell>
                    <TableCell>{record.employee_count}</TableCell>
                    <TableCell>₹{record.total_earnings.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.total_deductions.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{record.total_net_payable.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and download payroll reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="border-border shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)] cursor-pointer"
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{report.icon}</span>
                <div>
                  <CardTitle className="text-base">{report.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report.id);
                  }}
                >
                  <FileText className="mr-2 h-3 w-3" />
                  View
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(report.id);
                  }}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{reports.find(r => r.id === selectedReport)?.name}</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Set Filters</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Filters</DialogTitle>
                    <DialogDescription>
                      Set the date range and other filters for the report
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Month</Label>
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={filters.month}
                          onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          type="number"
                          value={filters.year}
                          onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {renderReportContent()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}