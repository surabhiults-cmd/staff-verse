import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configService } from "@/services/configService";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hraConfig } = useQuery({
    queryKey: ['hra-config'],
    queryFn: () => configService.getHRAConfig(),
  });

  const { data: daConfig } = useQuery({
    queryKey: ['da-config'],
    queryFn: () => configService.getDAConfig(),
  });

  const { data: categories } = useQuery({
    queryKey: ['employee-categories'],
    queryFn: () => configService.getEmployeeCategories(),
  });

  const [hraFormData, setHraFormData] = useState({
    category_id: '',
    percentage: '',
  });

  const [daFormData, setDaFormData] = useState({
    category_id: '',
    percentage: '',
  });

  const hraMutation = useMutation({
    mutationFn: (data: { employee_category_id: number; percentage: number }) =>
      configService.updateHRAConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hra-config'] });
      toast({
        title: "Success",
        description: "HRA configuration updated successfully",
      });
      setHraFormData({ category_id: '', percentage: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update HRA configuration",
        variant: "destructive",
      });
    },
  });

  const daMutation = useMutation({
    mutationFn: (data: { employee_category_id: number; percentage: number }) =>
      configService.updateDAConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['da-config'] });
      toast({
        title: "Success",
        description: "DA configuration updated successfully",
      });
      setDaFormData({ category_id: '', percentage: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update DA configuration",
        variant: "destructive",
      });
    },
  });

  const handleHRAUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hraFormData.category_id || !hraFormData.percentage) {
      toast({
        title: "Error",
        description: "Please select a category and enter percentage",
        variant: "destructive",
      });
      return;
    }
    hraMutation.mutate({
      employee_category_id: parseInt(hraFormData.category_id),
      percentage: parseFloat(hraFormData.percentage),
    });
  };

  const handleDAUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!daFormData.category_id || !daFormData.percentage) {
      toast({
        title: "Error",
        description: "Please select a category and enter percentage",
        variant: "destructive",
      });
      return;
    }
    daMutation.mutate({
      employee_category_id: parseInt(daFormData.category_id),
      percentage: parseFloat(daFormData.percentage),
    });
  };

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
            <CardDescription>Configure HRA and DA percentages by employee category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* HRA Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">HRA Configuration</h3>
              <form onSubmit={handleHRAUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hra-category">Employee Category</Label>
                    <Select
                      value={hraFormData.category_id}
                      onValueChange={(value) => setHraFormData({ ...hraFormData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.employee_categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hra-percentage">HRA Percentage</Label>
                    <Input
                      id="hra-percentage"
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      value={hraFormData.percentage}
                      onChange={(e) => setHraFormData({ ...hraFormData, percentage: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Update HRA Configuration
                </Button>
              </form>

              {/* Current HRA Configs */}
              <div className="mt-4 space-y-2">
                <Label>Current HRA Configurations</Label>
                <div className="space-y-2">
                  {hraConfig?.hra_configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{config.category_name || `Category ${config.employee_category_id}`}</span>
                      <span className="font-semibold">{config.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* DA Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">DA Configuration</h3>
              <form onSubmit={handleDAUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="da-category">Employee Category</Label>
                    <Select
                      value={daFormData.category_id}
                      onValueChange={(value) => setDaFormData({ ...daFormData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.employee_categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="da-percentage">DA Percentage</Label>
                    <Input
                      id="da-percentage"
                      type="number"
                      step="0.01"
                      placeholder="15.00"
                      value={daFormData.percentage}
                      onChange={(e) => setDaFormData({ ...daFormData, percentage: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Update DA Configuration
                </Button>
              </form>

              {/* Current DA Configs */}
              <div className="mt-4 space-y-2">
                <Label>Current DA Configurations</Label>
                <div className="space-y-2">
                  {daConfig?.da_configs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{config.category_name || `Category ${config.employee_category_id}`}</span>
                      <span className="font-semibold">{config.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}