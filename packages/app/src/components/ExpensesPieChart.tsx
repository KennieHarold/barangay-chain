import { Box, Paper, Typography } from "@mui/material";
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
        fontSize="11px"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
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
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderCustomLabel}
                outerRadius={70}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)} PYUSD`}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", marginTop: "20px" }}
                iconSize={10}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
