import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface ChartDataItem {
  name: string;
  value: number;
}

interface HorizontalBarChartProps {
  title: string;
  data: ChartDataItem[];
  dataKey?: string;
  nameKey?: string;
  barColor?: string;
}

export function HorizontalBarChart({ 
  title, 
  data, 
  dataKey = "value", 
  nameKey = "name",
  barColor = "hsl(var(--primary))"
}: HorizontalBarChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: "Value",
      color: barColor,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                type="category" 
                dataKey={nameKey} 
                stroke="hsl(var(--muted-foreground))"
                width={90}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey={dataKey} 
                fill={barColor}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
