import {
    Grid,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import React from "react";
import MonthSelector from "../components/MonthSelector";
import CategoryChart from "../components/CategoryChart";

import TransactionTable from "../components/TransactionTable";
import BarChart from "../components/BarChart";
import YearSelector from "../components/YearSelector";

const Report = () => {
    const commonPaperStyle = {
        height: "400px",
        display: "flex",
        flexDirection: "column",
        p: 2,
    };

    // 年別/月別の表示を切り替える状態
    const [viewType, setViewType] = React.useState<"monthly" | "yearly">(
        "monthly",
    );

    const handleViewTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newViewType: "monthly" | "yearly" | null,
    ) => {
        if (newViewType !== null) {
            setViewType(newViewType);
        }
    };

    return (
        <Grid container spacing={2}>
            {/* 表示切り替えボタン */}
            <Grid item xs={12}>
                <ToggleButtonGroup
                    value={viewType}
                    exclusive
                    onChange={handleViewTypeChange}
                    aria-label="View Type"
                >
                    <ToggleButton value="monthly" aria-label="monthly view">
                        月別
                    </ToggleButton>
                    <ToggleButton value="yearly" aria-label="yearly view">
                        年別
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid item xs={12}>
                {/* 日付選択エリア */}
                {viewType === "monthly" ? <MonthSelector /> : <YearSelector />}
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={commonPaperStyle}>
                    {/* 円グラフ */}
                    <CategoryChart viewType={viewType} />
                </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
                <Paper sx={commonPaperStyle}>
                    {/* 棒グラフ */}
                    <BarChart viewType={viewType} />
                </Paper>
            </Grid>

            <Grid item xs={12}>
                {/* テーブル */}
                <TransactionTable viewType={viewType} />
            </Grid>
        </Grid>
    );
};

export default Report;
