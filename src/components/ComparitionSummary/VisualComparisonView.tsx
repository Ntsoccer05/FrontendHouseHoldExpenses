import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import { 
    Box, 
    Card, 
    Chip, 
    Grid, 
    Typography, 
    Divider,
    LinearProgress,
    Stack,
    Alert
} from "@mui/material";
import { TransactionType } from "../../types";

interface ComparisonData {
    current: {
        income: number;
        expense: number;
        balance: number;
    };
    previous: {
        income: number;
        expense: number;
        balance: number;
    };
    changeRates: {
        income: number;
        expense: number;
        balance: number;
    };
}

interface PeriodLabels {
    current: string;
    previous: string;
}

interface VisualComparisonViewProps {
    comparisonData: ComparisonData;
    periodLabels: PeriodLabels;
}

const VisualComparisonView = ({ comparisonData, periodLabels }: VisualComparisonViewProps) => {
    // 増減アイコンを表示
    const getTrendIcon = (changeRate: number) => {
        if (changeRate > 0) return <TrendingUp color="error" fontSize="small" />;
        if (changeRate < 0) return <TrendingDown color="success" fontSize="small" />;
        return <Remove color="disabled" fontSize="small" />;
    };

    // 増減のカラーを取得
    const getTrendColor = (changeRate: number, type: TransactionType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
        if (changeRate === 0) return "default";
        if (type === "expense") {
            return changeRate > 0 ? "error" : "success";
        } else {
            return changeRate > 0 ? "success" : "error";
        }
    };

    // プログレスバーの値を計算（比較用）
    const getProgressValue = (current: number, previous: number) => {
        if (previous === 0) return 100;
        const maxValue = Math.max(current, previous);
        return (current / maxValue) * 100;
    };

    // 視覚的比較項目のコンポーネント
    const VisualComparisonItem = ({ 
        label, 
        current, 
        previous, 
        changeRate, 
        type, 
        color = "primary"
    }: {
        label: string;
        current: number;
        previous: number;
        changeRate: number;
        type: TransactionType;
        color?: "primary" | "error" | "success";
    }) => {
        const progressCurrent = getProgressValue(current, previous);
        const progressPrevious = getProgressValue(previous, current);
        const difference = current - previous;

        return (
            <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%', p: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        {label}
                    </Typography>
                    
                    {/* 現在の期間 */}
                    <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                                {periodLabels.current}
                            </Typography>
                            <Typography variant="h6" color={`${color}.main`} fontWeight="bold">
                                ¥{current.toLocaleString()}
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={progressCurrent} 
                            color={color}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>

                    {/* 前の期間 */}
                    <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                                {periodLabels.previous}
                            </Typography>
                            <Typography variant="body2" color={`${color}.main`} sx={{ opacity: 0.6 }}>
                                ¥{previous.toLocaleString()}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPrevious}
                            color={color}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                opacity: 0.4,
                            }}
                        />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* 変化の表示 */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                            {getTrendIcon(changeRate)}
                            <Chip
                                label={`${changeRate > 0 ? '+' : ''}${changeRate}%`}
                                color={getTrendColor(changeRate, type)}
                                size="small"
                            />
                        </Box>
                        <Typography 
                            variant="body2" 
                            color={difference >= 0 ? "success.main" : "error.main"}
                            fontWeight="medium"
                        >
                            {difference >= 0 ? '+' : ''}¥{difference.toLocaleString()}
                        </Typography>
                    </Box>
                </Card>
            </Grid>
        );
    };

    return (
        <>
            <Grid container spacing={2}>
                <VisualComparisonItem
                    label="収入"
                    current={comparisonData.current.income}
                    previous={comparisonData.previous.income}
                    changeRate={comparisonData.changeRates.income}
                    type="income"
                    color="primary"
                />
                
                <VisualComparisonItem
                    label="支出"
                    current={comparisonData.current.expense}
                    previous={comparisonData.previous.expense}  
                    changeRate={comparisonData.changeRates.expense}
                    type="expense"
                    color="error"
                />
                
                <VisualComparisonItem
                    label="残高"
                    current={comparisonData.current.balance}
                    previous={comparisonData.previous.balance}
                    changeRate={comparisonData.changeRates.balance}
                    type={comparisonData.current.balance >= 0 ? "income" : "expense"}
                    color={comparisonData.current.balance >= 0 ? "success" : "error"}
                />
            </Grid>
            
            {/* インサイト */}
            <Box mt={3} p={2} bgcolor="info.50" borderRadius={1} border="1px solid" borderColor="info.200">
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                    💡 詳細分析
                </Typography>
                <Stack spacing={1}>
                    {comparisonData.changeRates.expense !== 0 && (
                        <Typography variant="body2" color="text.secondary">
                            • 支出が前期比で
                            <strong style={{ color: comparisonData.changeRates.expense > 0 ? '#d32f2f' : '#2e7d32' }}>
                                {comparisonData.changeRates.expense > 0 ? '増加' : '削減'}
                                ({Math.abs(comparisonData.changeRates.expense)}%)
                            </strong>
                            しています
                        </Typography>
                    )}
                    {comparisonData.changeRates.income !== 0 && (
                        <Typography variant="body2" color="text.secondary">
                            • 収入が前期比で
                            <strong style={{ color: comparisonData.changeRates.income > 0 ? '#2e7d32' : '#d32f2f' }}>
                                {comparisonData.changeRates.income > 0 ? '増加' : '減少'}
                                ({Math.abs(comparisonData.changeRates.income)}%)
                            </strong>
                            しています
                        </Typography>
                    )}
                    {comparisonData.current.balance < comparisonData.previous.balance && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            残高が前期より減少しています。支出の見直しを検討してみてください。
                        </Alert>
                    )}
                    {comparisonData.current.balance > comparisonData.previous.balance && comparisonData.changeRates.balance > 10 && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                            残高が大幅に改善されました！この調子で継続しましょう。
                        </Alert>
                    )}
                </Stack>
            </Box>
        </>
    );
};

export default VisualComparisonView;