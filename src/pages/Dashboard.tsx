import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    title: "Total Employees",
    value: "248",
    change: "+12 this month",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Payroll Processed",
    value: "₹12.4L",
    change: "Current month",
    icon: DollarSign,
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "Pending Approvals",
    value: "8",
    change: "3 urgent",
    icon: Clock,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Avg. Salary",
    value: "₹50,000",
    change: "+5% from last month",
    icon: TrendingUp,
    gradient: "from-purple-500 to-purple-600",
  },
];

const recentActivity = [
  { employee: "Raj Kumar", action: "Salary processed", time: "2 hours ago", department: "Engineering" },
  { employee: "Priya Sharma", action: "New joining", time: "5 hours ago", department: "HR" },
  { employee: "Amit Patel", action: "Leave approved", time: "1 day ago", department: "Sales" },
  { employee: "Sneha Reddy", action: "Payslip generated", time: "1 day ago", department: "Finance" },
];

export default function Dashboard() {
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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{activity.employee}</p>
                    <p className="text-xs text-muted-foreground">{activity.action} · {activity.department}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Engineering", count: 85, percentage: 34 },
                { name: "Sales", count: 52, percentage: 21 },
                { name: "HR", count: 38, percentage: 15 },
                { name: "Finance", count: 45, percentage: 18 },
                { name: "Operations", count: 28, percentage: 12 },
              ].map((dept) => (
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
