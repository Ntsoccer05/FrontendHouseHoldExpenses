import { Box, Card, CardContent, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { MAINTENANCE_SCHEDULE } from "../../config/maintenance";

export default function MaintenanceScreen() {
  const { startHour, endHour } = MAINTENANCE_SCHEDULE;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: "100%", textAlign: "center", p: 2 }}>
        <CardContent>
          <BuildIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            サーバーメンテナンス中
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            現在、サーバーのメンテナンスを実施しています。
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 1,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              メンテナンス時間
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              毎日 {startHour}:00 〜 {endHour}:00 (JST)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            ご不便をおかけして申し訳ありません。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
