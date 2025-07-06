import {
    Box,
    Collapse,
    Fade,
    FormControlLabel,
    Grid,
    Paper,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import React from "react";
import MonthSelector from "../components/MonthSelector";
import CategoryChart from "../components/CategoryChart";

import TransactionTable from "../components/TransactionTable";
import BarChart from "../components/BarChart";
import YearSelector from "../components/YearSelector";
import { Helmet } from "react-helmet-async";
import { ogIMG } from "../config/ogImg";
import { ComparisonSummary } from "../components/ComparitionSummary/ComparitionSummary";
import { Analytics } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";

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

    const { isMobile } = useAppContext();

    // 比較分析の表示・非表示を切り替える状態
    const [showComparison, setShowComparison] = React.useState<boolean>(isMobile ? false : true);

    const handleViewTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newViewType: "monthly" | "yearly" | null,
    ) => {
        if (newViewType !== null) {
            setViewType(newViewType);
        }
    };

    const handleComparisonToggle = () => {
        setShowComparison((prevShowComparison) => !prevShowComparison);
    };

    return (
        <>
            <Helmet>
                <title>支出・収入をグラフで見える化｜らくらく・シンプル家計簿カケポンの家計簿分析</title>
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

                {/* 比較分析表示切り替えスイッチ */}
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showComparison}
                                onChange={handleComparisonToggle}
                                color="primary"
                                size="medium"
                            />
                        }
                        label={
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <Analytics fontSize="medium" color={showComparison ? "primary" : "disabled"} />
                                <Typography variant="body1" color={showComparison ? "primary" : "text.secondary"}>
                                    {viewType === "monthly" ? "前月比較" : "前年比較"}
                                </Typography>
                            </Box>
                        }
                        sx={{
                            m: 0,
                            '& .MuiFormControlLabel-label': {
                                ml: 1,
                            },
                        }}
                    />
                </Grid>

                {/* 比較サマリーカード（条件付き表示） */}
                <Grid item xs={12}>
                    <Collapse 
                        in={showComparison} 
                        timeout={400}
                        easing={{
                            enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            exit: 'cubic-bezier(0.4, 0, 0.6, 1)'
                        }}
                    >
                        <Fade 
                            in={showComparison} 
                            timeout={{ enter: 600, exit: 300 }}
                            style={{
                                transitionDelay: showComparison ? '200ms' : '0ms'
                            }}
                        >
                            <div>
                                <ComparisonSummary viewType={viewType} isMobile={isMobile} />
                            </div>
                        </Fade>
                    </Collapse>
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
