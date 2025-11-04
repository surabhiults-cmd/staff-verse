import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

const reports = [
  { name: "Monthly Salary Disbursement", description: "Detailed salary payment records", icon: "📊" },
  { name: "Department Wise Summary", description: "Employee and payroll by department", icon: "🏢" },
  { name: "Provident Fund Report", description: "PF contributions and summary", icon: "💰" },
  { name: "Tax Deduction Statement", description: "Income tax deductions (IT)", icon: "📋" },
  { name: "Annual Salary Statement", description: "Year-end salary summary", icon: "📈" },
  { name: "Attendance Report", description: "Working days and attendance", icon: "📅" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and download payroll reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, idx) => (
          <Card key={idx} className="border-border shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elevated)]">
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
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="mr-2 h-3 w-3" />
                  View
                </Button>
                <Button variant="default" size="sm" className="flex-1 bg-primary text-primary-foreground">
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
