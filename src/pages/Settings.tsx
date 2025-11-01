import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage system configurations and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Payroll Configuration</CardTitle>
            <CardDescription>Configure allowances and deductions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hra">HRA Percentage</Label>
                <Input id="hra" type="number" placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="da">DA Percentage</Label>
                <Input id="da" type="number" placeholder="15" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nps">NPS Contribution %</Label>
                <Input id="nps" type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax">Default Tax Rate</Label>
                <Input id="tax" type="number" placeholder="20" />
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your organization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" placeholder="Enter organization name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address">Address</Label>
              <Input id="org-address" placeholder="Enter address" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-email">Email</Label>
                <Input id="org-email" type="email" placeholder="contact@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Phone</Label>
                <Input id="org-phone" type="tel" placeholder="+91 1234567890" />
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Update Details
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
