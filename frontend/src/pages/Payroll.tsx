import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, DollarSign, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/services/payrollService";
import { payslipService } from "@/services/payslipService";
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

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

export default function Payroll() {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll', selectedMonth, selectedYear],
    queryFn: () => payrollService.getRecords({ month: selectedMonth, year: selectedYear }),
  });

  const processMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      payrollService.processMonthly({ month, year }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({
        title: "Success",
        description: `Payroll processed for ${data.processed} employees`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payroll",
        variant: "destructive",
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      payrollService.finalize({ month, year }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast({
        title: "Success",
        description: "Payroll finalized successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to finalize payroll",
        variant: "destructive",
      });
    },
  });

  const payrollRecords = payrollData?.payroll_records || [];
  const totalPayable = payrollRecords.reduce(
    (sum, record) => {
      const netPayable = record.net_payable ?? 0;
      return sum + (typeof netPayable === 'number' ? netPayable : parseFloat(String(netPayable)) || 0);
    },
    0
  );
  const processedCount = payrollRecords.filter(r => r.status === 'processed' || r.status === 'finalized').length;
  const draftCount = payrollRecords.filter(r => r.status === 'draft').length;

  const handleProcessPayroll = () => {
    if (confirm(`Process payroll for ${getMonthName(selectedMonth)} ${selectedYear}?`)) {
      processMutation.mutate({ month: selectedMonth, year: selectedYear });
    }
  };

  const handleFinalize = () => {
    if (confirm(`Finalize payroll for ${getMonthName(selectedMonth)} ${selectedYear}?`)) {
      finalizeMutation.mutate({ month: selectedMonth, year: selectedYear });
    }
  };

  const handleDownload = async (recordId: number, recordStatus: string) => {
    // Only allow download if payroll is processed or finalized
    if (recordStatus !== 'processed' && recordStatus !== 'finalized') {
      toast({
        title: "Cannot Download",
        description: "Payroll must be processed before downloading payslip",
        variant: "destructive",
      });
      return;
    }

    setDownloadingId(recordId);
    try {
      await payslipService.downloadPayslip(recordId, 'pdf');
      toast({
        title: "Success",
        description: "Payslip downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download payslip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  function getMonthName(month: number) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payroll Processing</h1>
          <p className="text-muted-foreground">Manage monthly salary disbursements</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Select Month
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Month & Year</DialogTitle>
                <DialogDescription>
                  Choose the month and year for payroll processing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleProcessPayroll}
            disabled={processMutation.isPending}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {processMutation.isPending ? 'Processing...' : 'Process Payroll'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {getMonthName(selectedMonth)} {selectedYear}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{payrollRecords.length} records</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payable</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ₹{totalPayable.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net payable amount</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {processedCount}/{payrollRecords.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {draftCount > 0 ? `${draftCount} pending` : 'All processed'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Records</CardTitle>
            {processedCount > 0 && (
              <Button
                variant="outline"
                onClick={handleFinalize}
                disabled={finalizeMutation.isPending}
              >
                {finalizeMutation.isPending ? 'Finalizing...' : 'Finalize Payroll'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payroll data...</div>
          ) : payrollRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <p className="text-lg mb-2">No payroll records found for {getMonthName(selectedMonth)} {selectedYear}</p>
                <p className="text-sm">Click "Process Payroll" to calculate payroll for all active employees</p>
              </div>
              <Button
                onClick={handleProcessPayroll}
                disabled={processMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {processMutation.isPending ? 'Processing...' : 'Process Payroll Now'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payrollRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {record.full_name || `Employee ${record.employee_id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.department_name || 'N/A'} · {record.days_worked ?? 0} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        ₹{(record.net_payable ?? 0).toLocaleString('en-IN')}
                      </p>
                      <Badge variant={
                        record.status === 'finalized' ? 'default' :
                        record.status === 'processed' ? 'secondary' : 'outline'
                      } className="mt-1">
                        {record.status}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDownload(record.id, record.status)}
                      disabled={downloadingId === record.id || (record.status !== 'processed' && record.status !== 'finalized')}
                      title={record.status === 'processed' || record.status === 'finalized' ? 'Download Payslip' : 'Payroll must be processed first'}
                    >
                      {downloadingId === record.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}