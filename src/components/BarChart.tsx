import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
    calculateDailyBalances,
    calculateMonthlyBalances,
} from "../utils/financeCalculations";
import { Box, Typography, useTheme } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppContext } from "../context/AppContext";
import { useTransactionContext } from "../context/TransactionContext";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
interface BarChartProps {
    viewType: "monthly" | "yearly";
}

const BarChart = ({ viewType }: BarChartProps) => {
    const { isLoading } = useAppContext();
    const { monthlyTransactions, yearlyTransactions } = useTransactionContext();

    const theme = useTheme();
    const options = {
        // maintainAspectRatioは画面サイズに応じてグラフの大きさを変更するかどうか
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: viewType === "monthly" ? "日別収支" : "月別収支",
            },
        },
    };

    const dailyBalances = calculateDailyBalances(monthlyTransactions);
    const monthlyBalances = calculateMonthlyBalances(yearlyTransactions);

    // sort()で昇順で並び替え
    const dailydateLabels = Object.keys(dailyBalances).sort();
    const dailyexpenseData = dailydateLabels.map(
        (day) => dailyBalances[day].expense
    );
    const dailyincomeData = dailydateLabels.map(
        (day) => dailyBalances[day].income
    );

    const monthlydateLabels = Object.keys(monthlyBalances).sort();
    const monthlyexpenseData = monthlydateLabels.map(
        (month) => monthlyBalances[month].expense
    );
    const monthlyincomeData = monthlydateLabels.map(
        (month) => monthlyBalances[month].income
    );

    const data: ChartData<"bar"> = {
        labels: viewType === "monthly" ? dailydateLabels : monthlydateLabels,
        datasets:
            viewType === "monthly"
                ? [
                      {
                          label: "支出",
                          data: dailyexpenseData,
                          backgroundColor: theme.palette.expenseColor.light,
                      },
                      {
                          label: "収入",
                          data: dailyincomeData,
                          backgroundColor: theme.palette.incomeColor.light,
                      },
                  ]
                : [
                      {
                          label: "支出",
                          data: monthlyexpenseData,
                          backgroundColor: theme.palette.expenseColor.light,
                      },
                      {
                          label: "収入",
                          data: monthlyincomeData,
                          backgroundColor: theme.palette.incomeColor.light,
                      },
                  ],
    };
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
            }}
        >
            {isLoading ? (
                <CircularProgress />
            ) : (
                  viewType === "monthly"
                      ? monthlyTransactions.length > 0
                      : yearlyTransactions.length > 0
              ) ? (
                <Bar options={options} data={data} />
            ) : (
                <Typography>データがありません</Typography>
            )}
        </Box>
    );
};

export default BarChart;
