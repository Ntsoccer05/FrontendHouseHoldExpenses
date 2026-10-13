import { Box, Card, CardContent, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { MAINTENANCE_SCHEDULE, MaintenanceWindow } from "../../config/maintenance";

function formatWindows(windows: readonly MaintenanceWindow[]): string {
  return windows
    .map(
      ({ startHour, startMinute, endHour, endMinute }) =>
        `${startHour}:${String(startMinute).padStart(2, "0")} 〜 ${endHour}:${String(endMinute).padStart(2, "0")}`
    )
    .join(" / ");
}

export default function MaintenanceScreen() {
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
            メンテナンス中
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            現在、メンテナンスを実施しています。
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
            <Typography variant="body1" color="primary.main" fontWeight="bold">
              平日 {formatWindows(MAINTENANCE_SCHEDULE.weekday)}
            </Typography>
            <Typography variant="body1" color="primary.main" fontWeight="bold">
              土日祝 {formatWindows(MAINTENANCE_SCHEDULE.holiday)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (JST)
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
