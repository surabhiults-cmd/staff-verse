import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, User, Mail, Phone, MapPin, Calendar, Building2, Briefcase, CreditCard, Banknote, FileText, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService, type Employee } from "@/services/employeeService";
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
import { configService } from "@/services/configService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ is_active: true }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const employees = data?.employees || [];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground">Failed to load employees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's workforce</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the employee details below. Required fields are marked with *.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or department..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>{employee.full_name}</TableCell>
                      <TableCell>{employee.department_name || 'N/A'}</TableCell>
                      <TableCell>{employee.job_role_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={employee.employment_type_name === "Permanent" ? "default" : "secondary"}>
                          {employee.employment_type_name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{employee.basic_pay.toLocaleString('en-IN')}</TableCell>
                      <TableCell>{new Date(employee.date_of_joining).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(employee)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(employee.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedEmployee?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeViewDetails employee={selectedEmployee} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information for {selectedEmployee?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeEditDetails 
              employee={selectedEmployee} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedEmployee(null);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmployeeViewDetails({ employee }: { employee: Employee }) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Avatar */}
      <div className="flex items-start space-x-4 pb-6 border-b">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/60 flex items-center justify-center border-2 border-primary/30">
            <span className="text-3xl font-bold text-primary">
              {getInitials(employee.full_name)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {employee.full_name}
          </h3>
          <p className="text-muted-foreground mt-1">
            {employee.job_role_name || 'Employee'}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant={employee.is_active ? "default" : "secondary"}>
              {employee.is_active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">
              {employee.employee_id}
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="employment">
            <Building2 className="mr-2 h-4 w-4" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Banknote className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Employee ID</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.employee_id}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                    <p className="text-base font-semibold mt-1">
                      {new Date(employee.date_of_birth).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Contact Phone</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.contact_phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.contact_email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Residential Address</Label>
                  <p className="text-base font-semibold mt-1 break-words">{employee.residential_address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Details Tab */}
        <TabsContent value="employment" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Department</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.department_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Job Role</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.job_role_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Employment Type</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.employment_type_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Employee Category</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.employee_category_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Date of Joining</Label>
                    <p className="text-base font-semibold mt-1">
                      {new Date(employee.date_of_joining).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Information Tab */}
        <TabsContent value="financial" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Basic Pay</Label>
                    <p className="text-2xl font-bold mt-1 text-foreground">
                      ₹{employee.basic_pay?.toLocaleString('en-IN') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  Bank Details
                </h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bank Name</Label>
                    <p className="text-base font-semibold mt-1 break-words">{employee.bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account Number</Label>
                    <p className="text-base font-semibold mt-1 break-words font-mono">{employee.bank_account_number || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">IFSC Code</Label>
                    <p className="text-base font-semibold mt-1 break-words font-mono">{employee.bank_ifsc_code || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmployeeEditDetails({ employee, onSuccess, onCancel }: { employee: Employee; onSuccess: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fetch lookup data
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => configService.getDepartments(),
  });

  const { data: jobRolesData } = useQuery({
    queryKey: ['jobRoles'],
    queryFn: () => configService.getJobRoles(),
  });

  const { data: employmentTypesData } = useQuery({
    queryKey: ['employmentTypes'],
    queryFn: () => configService.getEmploymentTypes(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['employeeCategories'],
    queryFn: () => configService.getEmployeeCategories(),
  });

  const [formData, setFormData] = useState({
    full_name: employee.full_name || '',
    date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
    contact_phone: employee.contact_phone || '',
    contact_email: employee.contact_email || '',
    residential_address: employee.residential_address || '',
    date_of_joining: employee.date_of_joining ? employee.date_of_joining.split('T')[0] : '',
    department_id: employee.department_id?.toString() || '',
    job_role_id: employee.job_role_id?.toString() || '',
    employment_type_id: employee.employment_type_id?.toString() || '',
    employee_category_id: employee.employee_category_id?.toString() || '',
    bank_account_number: employee.bank_account_number || '',
    bank_ifsc_code: employee.bank_ifsc_code || '',
    bank_name: employee.bank_name || '',
    basic_pay: employee.basic_pay?.toString() || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => employeeService.update(employee.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
      job_role_id: formData.job_role_id ? parseInt(formData.job_role_id) : undefined,
      employment_type_id: formData.employment_type_id ? parseInt(formData.employment_type_id) : undefined,
      employee_category_id: formData.employee_category_id ? parseInt(formData.employee_category_id) : undefined,
      basic_pay: formData.basic_pay ? parseFloat(formData.basic_pay) : undefined,
    };
    updateMutation.mutate(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section with Avatar */}
      <div className="flex items-start space-x-4 pb-6 border-b">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/60 flex items-center justify-center border-2 border-primary/30">
            <span className="text-3xl font-bold text-primary">
              {getInitials(employee.full_name)}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {employee.full_name}
          </h3>
          <p className="text-muted-foreground mt-1">
            {employee.job_role_name || 'Employee'}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant={employee.is_active ? "default" : "secondary"}>
              {employee.is_active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground font-mono">
              {employee.employee_id}
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="mr-2 h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="employment">
            <Building2 className="mr-2 h-4 w-4" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Banknote className="mr-2 h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Employee ID</span>
                  </Label>
                  <Input value={employee.employee_id} disabled className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Date of Birth *</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Contact Phone</span>
                  </Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>Contact Email</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Residential Address</span>
                </Label>
                <Input
                  value={formData.residential_address}
                  onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Details Tab */}
        <TabsContent value="employment" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Department</span>
                  </Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsData?.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>Job Role</span>
                  </Label>
                  <Select
                    value={formData.job_role_id}
                    onValueChange={(value) => setFormData({ ...formData, job_role_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobRolesData?.job_roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Employment Type</span>
                  </Label>
                  <Select
                    value={formData.employment_type_id}
                    onValueChange={(value) => setFormData({ ...formData, employment_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypesData?.employment_types.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Employee Category</span>
                  </Label>
                  <Select
                    value={formData.employee_category_id}
                    onValueChange={(value) => setFormData({ ...formData, employee_category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.employee_categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Date of Joining *</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Information Tab */}
        <TabsContent value="financial" className="mt-6 space-y-4">
          <Card className="border-border">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Banknote className="h-4 w-4 text-primary" />
                    <span>Basic Pay</span>
                  </Label>
                  <Input
                    type="number"
                    value={formData.basic_pay}
                    onChange={(e) => setFormData({ ...formData, basic_pay: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-primary" />
                  Bank Details
                </h4>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={formData.bank_account_number}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      value={formData.bank_ifsc_code}
                      onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Updating...' : 'Update Employee'}
        </Button>
      </div>
    </form>
  );
}

function EmployeeForm({ employee, onSuccess }: { employee?: Employee; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!employee;

  // Fetch lookup data
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => configService.getDepartments(),
  });

  const { data: jobRolesData } = useQuery({
    queryKey: ['jobRoles'],
    queryFn: () => configService.getJobRoles(),
  });

  const { data: employmentTypesData } = useQuery({
    queryKey: ['employmentTypes'],
    queryFn: () => configService.getEmploymentTypes(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['employeeCategories'],
    queryFn: () => configService.getEmployeeCategories(),
  });

  const [formData, setFormData] = useState({
    employee_id: employee?.employee_id || '',
    full_name: employee?.full_name || '',
    date_of_birth: employee?.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
    contact_phone: employee?.contact_phone || '',
    contact_email: employee?.contact_email || '',
    residential_address: employee?.residential_address || '',
    date_of_joining: employee?.date_of_joining ? employee.date_of_joining.split('T')[0] : '',
    department_id: employee?.department_id?.toString() || '',
    job_role_id: employee?.job_role_id?.toString() || '',
    employment_type_id: employee?.employment_type_id?.toString() || '',
    employee_category_id: employee?.employee_category_id?.toString() || '',
    bank_account_number: employee?.bank_account_number || '',
    bank_ifsc_code: employee?.bank_ifsc_code || '',
    bank_name: employee?.bank_name || '',
    basic_pay: employee?.basic_pay?.toString() || '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => employeeService.update(employee!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
      job_role_id: formData.job_role_id ? parseInt(formData.job_role_id) : undefined,
      employment_type_id: formData.employment_type_id ? parseInt(formData.employment_type_id) : undefined,
      employee_category_id: formData.employee_category_id ? parseInt(formData.employee_category_id) : undefined,
      basic_pay: formData.basic_pay ? parseFloat(formData.basic_pay) : undefined,
    };
    
    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employee ID *</Label>
          <Input
            required
            disabled={isEditMode}
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <Input
            type="date"
            required
            value={formData.date_of_birth}
            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Date of Joining *</Label>
          <Input
            type="date"
            required
            value={formData.date_of_joining}
            onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Residential Address</Label>
        <Input
          value={formData.residential_address}
          onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={formData.department_id}
            onValueChange={(value) => setFormData({ ...formData, department_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentsData?.departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Job Role</Label>
          <Select
            value={formData.job_role_id}
            onValueChange={(value) => setFormData({ ...formData, job_role_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job role" />
            </SelectTrigger>
            <SelectContent>
              {jobRolesData?.job_roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Select
            value={formData.employment_type_id}
            onValueChange={(value) => setFormData({ ...formData, employment_type_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypesData?.employment_types.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Employee Category</Label>
          <Select
            value={formData.employee_category_id}
            onValueChange={(value) => setFormData({ ...formData, employee_category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoriesData?.employee_categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Basic Pay</Label>
          <Input
            type="number"
            value={formData.basic_pay}
            onChange={(e) => setFormData({ ...formData, basic_pay: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            value={formData.bank_account_number}
            onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input
            value={formData.bank_ifsc_code}
            onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value })}
          />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-primary text-primary-foreground"
        disabled={createMutation.isPending || updateMutation.isPending}
      >
        {isEditMode 
          ? (updateMutation.isPending ? 'Updating...' : 'Update Employee')
          : (createMutation.isPending ? 'Creating...' : 'Create Employee')
        }
      </Button>
    </form>
  );
}