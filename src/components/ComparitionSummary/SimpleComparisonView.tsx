import { TrendingUp, TrendingDown, Remove } from "@mui/icons-material";
import { Box, Chip, Grid, Typography } from "@mui/material";
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

interface SimpleComparisonViewProps {
    comparisonData: ComparisonData;
    periodLabels: PeriodLabels;
}

const SimpleComparisonView = ({ comparisonData, periodLabels }: SimpleComparisonViewProps) => {
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

    // シンプル表示の比較項目コンポーネント
    const SimpleComparisonItem = ({ 
        label, 
        current, 
        previous, 
        changeRate, 
        type, 
        currentColor = "text.primary",
        previousColor = "text.secondary" 
    }: {
        label: string;
        current: number;
        previous: number;
        changeRate: number;
        type: TransactionType;
        currentColor?: string;
        previousColor?: string;
    }) => (
        <Grid item xs={12} md={4}>
            <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {label}
                </Typography>
                
                {/* 現在の金額 */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6" color={currentColor} fontWeight="bold">
                        ¥{current.toLocaleString()}
                    </Typography>
                    {getTrendIcon(changeRate)}
                    <Chip
                        label={`${changeRate > 0 ? '+' : ''}${changeRate}%`}
                        color={getTrendColor(changeRate, type)}
                        size="small"
                    />
                </Box>
                
                {/* 前期の金額 */}
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color={previousColor}>
                        {periodLabels.previous}:
                    </Typography>
                    <Typography variant="body2" color={previousColor}>
                        ¥{previous.toLocaleString()}
                    </Typography>
                </Box>
                
                {/* 差額表示 */}
                <Typography 
                    variant="caption" 
                    color={changeRate >= 0 ? "success.main" : "error.main"}
                    sx={{ fontWeight: 'medium' }}
                >
                    {changeRate >= 0 ? '+' : ''}¥{(current - previous).toLocaleString()}
                </Typography>
            </Box>
        </Grid>
    );

    return (
        <>
            <Grid container spacing={3}>
                <SimpleComparisonItem
                    label="収入"
                    current={comparisonData.current.income}
                    previous={comparisonData.previous.income}
                    changeRate={comparisonData.changeRates.income}
                    type="income"
                    currentColor="primary.main"
                />
                
                <SimpleComparisonItem
                    label="支出"
                    current={comparisonData.current.expense}
                    previous={comparisonData.previous.expense}  
                    changeRate={comparisonData.changeRates.expense}
                    type="expense"
                    currentColor="error.main"
                />
                
                <SimpleComparisonItem
                    label="残高"
                    current={comparisonData.current.balance}
                    previous={comparisonData.previous.balance}
                    changeRate={comparisonData.changeRates.balance}
                    type={comparisonData.current.balance >= 0 ? "income" : "expense"}
                    currentColor={comparisonData.current.balance >= 0 ? "success.main" : "error.main"}
                />
            </Grid>
            
            {/* サマリー情報 */}
            <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="body2" color="text.secondary">
                    <strong>概要:</strong> 
                    {comparisonData.changeRates.expense > 0 
                        ? ` 支出が${comparisonData.changeRates.expense}%増加しています。`
                        : comparisonData.changeRates.expense < 0
                        ? ` 支出が${Math.abs(comparisonData.changeRates.expense)}%削減されました。`
                        : ` 支出に変化はありません。`
                    }
                    {comparisonData.changeRates.income !== 0 && (
                        comparisonData.changeRates.income > 0 
                            ? ` 収入は${comparisonData.changeRates.income}%増加しています。`
                            : ` 収入は${Math.abs(comparisonData.changeRates.income)}%減少しています。`
                    )}
                </Typography>
            </Box>
        </>
    );
};

export default SimpleComparisonView;