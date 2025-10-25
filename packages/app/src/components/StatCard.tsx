import { Box, Card, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  valueVariant?: "h4" | "h5";
}

export function StatCard({
  title,
  value,
  icon,
  color,
  valueVariant = "h4",
}: StatCardProps) {
  return (
    <Card
      sx={{
        p: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
      }}
    >
      <Box
        sx={{
          backgroundColor: color,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #000",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          fontSize="small"
        >
          {title}
        </Typography>
        <Typography variant={valueVariant} fontWeight="bold">
          {value}
        </Typography>
      </Box>
    </Card>
  );
}
