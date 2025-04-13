import { useState } from "react";
import { Pie } from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
} from "chart.js";
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
} from "@mui/material";
import { TransactionType } from "../types";
import { useAppContext } from "../context/AppContext";
import {
    pink,
    lightBlue,
    purple,
    deepOrange,
    teal,
    cyan,
    lightGreen,
    amber,
} from "@mui/material/colors";
import { useTransactionContext } from "../context/TransactionContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
    viewType: "monthly" | "yearly";
}

const CategoryChart = ({ viewType }: CategoryChartProps) => {
    const { isLoading } = useAppContext();
    // const monthlyTransactions = useMonthlyTransactions();
    // const yearlyTransactions = useYearlyTransactions();
    const { monthlyTransactions, yearlyTransactions } = useTransactionContext();

    const [selectedType, setSelectedType] =
        useState<TransactionType>("expense");

    const handleChange = (e: SelectChangeEvent<TransactionType>) => {
        setSelectedType(e.target.value as TransactionType);
    };

    // カテゴリごとの合計金額計算
    const categorySums = (
        viewType === "monthly" ? monthlyTransactions : yearlyTransactions
    )
        .filter((transaction) => transaction.type === selectedType)
        .reduce<Record<string, number>>((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += transaction.amount;
            return acc;
        }, {} as Record<string, number>);

    const categoryLabels = Object.keys(categorySums) as string[];
    const categoryValues = Object.values(categorySums);

    const options = {
        maintainAspectRatio: false,
        responsive: true,
    };

    const fixedIncomeColors = [
        pink[500],
        lightBlue[600],
        purple[400],
        deepOrange[500],
        teal[400],
        cyan[600],
        lightGreen[500],
        amber[600],
        pink[300],
        purple[600],
    ];

    const fixedExpenseColors = [
        deepOrange[400],
        lightBlue[500],
        teal[300],
        amber[500],
        pink[700],
        lightGreen[600],
        cyan[500],
        purple[700],
        amber[400],
        teal[600],
    ];

    const incomeCategoryColor: Record<string, string> = categoryLabels.reduce(
        (acc, category, index) => {
            acc[category] = fixedIncomeColors[index];
            return acc;
        },
        {} as Record<string, string>
    );
    const expenseCategoryColor: Record<string, string> = categoryLabels.reduce(
        (acc, category, index) => {
            acc[category] = fixedExpenseColors[index];
            return acc;
        },
        {} as Record<string, string>
    );

    const getCategoryColor = (category: string): string => {
        if (selectedType === "income") {
            return incomeCategoryColor[category as string];
        } else {
            return expenseCategoryColor[category as string];
        }
    };

    const data: ChartData<"pie"> = {
        labels: categoryLabels,
        datasets: [
            {
                data: categoryValues,
                backgroundColor: categoryLabels.map((category) =>
                    getCategoryColor(category)
                ),

                borderColor: categoryLabels.map((category) =>
                    getCategoryColor(category)
                ),

                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="type-select-label">収支の種類</InputLabel>
                <Select
                    labelId="type-select-label"
                    id="type-select"
                    value={selectedType}
                    label="収支の種類"
                    onChange={handleChange}
                >
                    <MenuItem value="income">収入</MenuItem>
                    <MenuItem value="expense">支出</MenuItem>
                </Select>
            </FormControl>
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
                ) : monthlyTransactions.length > 0 ? (
                    <Pie data={data} options={options} />
                ) : (
                    <Typography>データがありません</Typography>
                )}
            </Box>
        </>
    );
};

export default CategoryChart;
