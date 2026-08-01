import {
  ArrowForward,
  ViewList,
  BarChart,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTransactionContext } from "../../context/TransactionContext";
import { calculateComparison, formatPeriodLabel } from "../../utils/financeCalculations";
import { useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import SimpleComparisonView from "./SimpleComparisonView";
import VisualComparisonView from "./VisualComparisonView";

interface ComparisonSummaryProps {
  viewType: "monthly" | "yearly";
  isMobile: boolean;
}

type ViewMode = "simple" | "visual";

export const ComparisonSummary = ({ viewType, isMobile }: ComparisonSummaryProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("visual");

  const {
    monthlyTransactions,
    yearlyTransactions,
    preMonthlyTransactions,
    preYearlyTransactions,
    isMonthlyLoading,
    isYearlyLoading,
  } = useTransactionContext();
  const isDataLoading = viewType === "monthly" ? isMonthlyLoading : isYearlyLoading;

  const { currentMonth, currentYear } = useAppContext();

  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const titleVariant = isSmUp ? "h6" : "body1";

  const comparisonData = useMemo(() => {
    const currentTransactions = viewType === "monthly" ? monthlyTransactions : yearlyTransactions;
    const previousTransactions = viewType === "monthly" ? preMonthlyTransactions : preYearlyTransactions;
    return calculateComparison(currentTransactions, previousTransactions);
  }, [viewType, monthlyTransactions, yearlyTransactions, preMonthlyTransactions, preYearlyTransactions]);

  const periodLabels = useMemo(() => {
    return formatPeriodLabel(currentYear, currentMonth, viewType);
  }, [currentYear, currentMonth, viewType]);

  const getOverallScore = () => {
    const { changeRates } = comparisonData;
    let score = 50;
    if (changeRates.income > 0) score += Math.min(changeRates.income * 0.5, 20);
    else if (changeRates.income < 0) score -= Math.min(Math.abs(changeRates.income) * 0.3, 15);
    if (changeRates.expense > 0) score -= Math.min(changeRates.expense * 0.4, 20);
    else if (changeRates.expense < 0) score += Math.min(Math.abs(changeRates.expense) * 0.6, 25);
    if (changeRates.balance > 0) score += Math.min(changeRates.balance * 0.3, 15);
    else if (changeRates.balance < 0) score -= Math.min(Math.abs(changeRates.balance) * 0.4, 20);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return { message: "優秀な家計管理です！", color: "success.main", icon: "🎉" };
    if (score >= 65) return { message: "良好な状態を維持しています", color: "primary.main", icon: "👍" };
    if (score >= 50) return { message: "標準的な状態です", color: "warning.main", icon: "📊" };
    if (score >= 35) return { message: "改善の余地があります", color: "warning.main", icon: "⚠️" };
    return { message: "要注意：見直しが必要です", color: "error.main", icon: "🚨" };
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const overallScore = getOverallScore();
  const scoreData = getScoreMessage(overallScore);

  if (isDataLoading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap">
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant={titleVariant} fontWeight="bold">
              期間比較
            </Typography>
            <Box display="flex" alignItems="center" gap={1} color="text.secondary">
              <Typography variant="body2">{periodLabels.previous}</Typography>
              <ArrowForward fontSize="small" />
              <Typography variant="body2">{periodLabels.current}</Typography>
            </Box>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{ mt: { xs: 1, sm: 0 } }}
          >
            <ToggleButton value="simple"
            sx={{
                flex: 1,
                minWidth: 0, // 折り返し防止
                px: { xs: 1, sm: 2 }, // スマホでは左右paddingを狭く
                py: { xs: 0.5, sm: 1 }, // スマホでは上下も小さく
                fontSize: { xs: '0.75rem', sm: '0.875rem' }, // テキストサイズ小さめ
                whiteSpace: 'nowrap', // 折り返しさせない
            }}
            >
                <ViewList fontSize="inherit" sx={{ mr: 0.5 }} />
                シンプル
            </ToggleButton>

            <ToggleButton value="visual"
            sx={{
                flex: 1,
                minWidth: 0,
                px: { xs: 1, sm: 2 },
                py: { xs: 0.5, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                whiteSpace: 'nowrap',
            }}
            >
                <BarChart fontSize="inherit" sx={{ mr: 0.5 }} />
                ビジュアル
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === "visual" && (
          <Box mb={3}>
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={overallScore}
                    size={60}
                    thickness={4}
                    color={overallScore >= 65 ? "success" : overallScore >= 50 ? "warning" : "error"}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                      {overallScore}
                    </Typography>
                  </Box>
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="subtitle1" fontWeight="bold" color={scoreData.color}>
                    {scoreData.icon} {scoreData.message}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    家計管理スコア: {overallScore}/100点
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {viewMode === "simple" ? (
          <SimpleComparisonView
            comparisonData={comparisonData}
            periodLabels={periodLabels}
          />
        ) : (
          <VisualComparisonView
            comparisonData={comparisonData}
            periodLabels={periodLabels}
          />
        )}
      </CardContent>
    </Card>
  );
};
