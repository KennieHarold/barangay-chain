import { Box, Card, Typography } from "@mui/material";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Category } from "@/models";
import { categoryColors, categoryLabels } from "@/constants/project";

interface PieChartProps {
  data: { category: Category; amount: number }[];
}

export function ExpensesPieChart({ data }: PieChartProps) {
  const chartData = data.map((item) => ({
    name: categoryLabels[item.category],
    value: item.amount,
    fill: categoryColors[item.category],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="13px"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Expenses by Category
      </Typography>
      {data.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100% - 40px)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No expenses data available
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: "calc(100% - 40px)" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomLabel}
                outerRadius={63}
                dataKey="value"
                stroke="#000000"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} PYUSD`}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
                iconSize={12}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Card>
  );
}
