import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, DollarSign, TrendingUp } from "lucide-react";

const payrollData = [
  { month: "October 2024", employees: 248, amount: "₹1,24,00,000", status: "Completed", date: "2024-10-31" },
  { month: "September 2024", employees: 245, amount: "₹1,22,50,000", status: "Completed", date: "2024-09-30" },
  { month: "August 2024", employees: 243, amount: "₹1,21,50,000", status: "Completed", date: "2024-08-31" },
];

export default function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Processing</h1>
          <p className="text-muted-foreground">Manage monthly salary disbursements</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Calendar className="mr-2 h-4 w-4" />
          Process Payroll
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Month</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">November 2024</div>
            <p className="text-xs text-muted-foreground mt-1">248 employees</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹1,24,00,000</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated amount</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+2.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Month over month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payrollData.map((payroll, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{payroll.month}</p>
                    <p className="text-sm text-muted-foreground">
                      {payroll.employees} employees · Processed on {payroll.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{payroll.amount}</p>
                    <Badge variant="secondary" className="mt-1">
                      {payroll.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
