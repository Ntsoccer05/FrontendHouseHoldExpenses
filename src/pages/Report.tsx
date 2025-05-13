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
import { Helmet } from "react-helmet-async";
import { ogIMG } from "../config/ogImg";

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
        <>
            <Helmet>
                <title>支出・収入をグラフで見える化｜カケポンの家計簿分析</title>
                <meta
                    name="description"
                    content="月ごと・年ごとの収支をグラフで分析して、ムダ遣いを発見。視覚的に管理できる家計簿アプリ「カケポン」で、お金の流れを見える化。"
                />
                <meta property="og:title" content="支出・収入をグラフで見える化｜カケポンの家計簿分析" />
                <meta
                    property="og:description"
                    content="円グラフや棒グラフで収支を視覚的に管理。カレンダーと連携した使いやすい家計簿アプリ「カケポン」。無料で始めて、お金の流れを見える化しよう！"
                />
                <meta property="og:url" content="https://kake-pon.com/report" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={ogIMG} />
            </Helmet>
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
        </>
    );
};

export default Report;
