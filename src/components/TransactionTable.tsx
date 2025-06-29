import * as React from "react";
import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { 
    calculateComparison, 
    calculateCategoryComparison, 
    type CategoryComparison 
} from "../utils/financeCalculations";
import { Badge, Grid, Chip, Collapse, List, ListItem, ListItemText, Divider, useMediaQuery } from "@mui/material";
import {
    formatCurrency,
    formatJPMonth,
    formatJPYear,
} from "../utils/formatting";
import { compareDesc, format, parseISO } from "date-fns";
import { useTransactionContext } from "../context/TransactionContext";
import DynamicIcon from "./common/DynamicIcon";
import TableSortLabel from "@mui/material/TableSortLabel";
import HeightIcon from "@mui/icons-material/Height";
import { useAppContext } from "../context/AppContext";
import FilterListIcon from "@mui/icons-material/FilterList";
import { CheckBoxItem, Transaction, TransactionType } from "../types";
import { PopoverContent } from "./PopoverContent";

// 既存のインターフェースと関数（TransactionTableHead, TransactionTableToolbar）は変更なし
interface TransactionTableHeadProps {
    numSelected?: number;
    order: "asc" | "desc" | undefined;
    orderBy: string;
    rowCount: number;
    viewType: "monthly" | "yearly";
    checkedItems: any[];
    onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    setAnchorEl: React.Dispatch<React.SetStateAction<null>>;
}

// テーブルヘッド
function TransactionTableHead(props: TransactionTableHeadProps) {
    const {
        numSelected,
        rowCount,
        order,
        orderBy,
        viewType,
        checkedItems,
        onSelectAllClick,
        onRequestSort,
        setAnchorEl,
    } = props;

    const popoverRef = React.useRef(null);
    const {isMobile} = useAppContext();

    const createSortHandler =
        (property: string) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {viewType === "monthly" && (
                    <TableCell
                        padding="checkbox"
                        sx={{ width: "50px", minWidth: "50px", display: isMobile ? "none" : "table-cell"}}
                    >
                        <Checkbox
                            color="primary"
                            indeterminate={
                                (numSelected as number) > 0 &&
                                (numSelected as number) < rowCount
                            }
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                "aria-label": "select all desserts",
                            }}
                        />
                    </TableCell>
                )}

                <TableCell
                    align="left"
                    sx={{
                        whiteSpace: "nowrap",
                        width: "auto",
                        minWidth: "0",
                    }}
                >
                    {viewType === "monthly" ? "日付" : "月"}
                </TableCell>
                <TableCell
                    align="left"
                    sx={{
                        whiteSpace: "nowrap",
                        width: "auto",
                        minWidth: "0",
                    }}
                    ref={popoverRef}
                >
                    カテゴリ
                    <Badge
                        badgeContent={checkedItems.length}
                        color="primary"
                        onClick={() => {}}
                    >
                        <FilterListIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                                setAnchorEl(popoverRef.current);
                            }}
                        />
                    </Badge>
                </TableCell>

                <TableCell
                    align={"left"}
                    sortDirection={orderBy === "amount" ? order : false}
                    sx={{
                        width: { xs: "100px", sm: "150px", md: "200px" },
                        minWidth: "100px",
                    }}
                >
                    <TableSortLabel
                        active={orderBy === "amount"}
                        direction={orderBy === "amount" ? order : "asc"}
                        onClick={createSortHandler("amount")}
                        IconComponent={
                            orderBy === "amount"
                                ? undefined
                                : () => (
                                      <span>
                                          <HeightIcon
                                              sx={{ verticalAlign: "bottom" }}
                                          ></HeightIcon>
                                      </span>
                                  )
                        }
                    >
                        金額
                    </TableSortLabel>
                </TableCell>

                <TableCell
                    align={"left"}
                    sx={{
                        width:
                            viewType === "monthly"
                                ? { xs: "200px", sm: "250px", md: "300px" }
                                : "0px",
                        minWidth: viewType === "monthly" ? "200px" : "0px",
                    }}
                >
                    {viewType === "monthly" && "内容"}
                </TableCell>
                {viewType === "monthly" && (
                    <TableCell
                        padding="checkbox"
                        sx={{ width: "50px", minWidth: "50px", display: isMobile ? "table-cell" : "none"}}
                    >
                        <Checkbox
                            color="primary"
                            indeterminate={
                                (numSelected as number) > 0 &&
                                (numSelected as number) < rowCount
                            }
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                "aria-label": "select all desserts",
                            }}
                        />
                    </TableCell>
                )}
            </TableRow>
        </TableHead>
    );
}

interface TransactionTableToolbarProps {
    numSelected: number;
    viewType: "monthly" | "yearly";
    onDelete: () => void;
}

// ツールバー
function TransactionTableToolbar(props: TransactionTableToolbarProps) {
    const { numSelected, viewType, onDelete } = props;
    const { currentYear, currentMonth, isMobile } = useAppContext();

    const jpCurrentMonth = formatJPMonth(currentMonth);
    const jpCurrentYear = formatJPYear(currentYear);

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action.activatedOpacity
                        ),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    {viewType === "monthly"
                        ? jpCurrentMonth + "の取引一覧"
                        : jpCurrentYear + "の取引一覧"}
                </Typography>
            )}
            {isMobile ? 
                (
                    numSelected > 0 && (
                        <Tooltip title="Delete">
                            <IconButton onClick={onDelete} sx={{flexDirection: "column"}}>
                                <DeleteIcon />
                                <Typography variant="caption">削除</Typography>
                            </IconButton>
                        </Tooltip>
                    )
                ) 
                : 
                (
                    numSelected > 0 && (
                        <Tooltip title="Delete">
                            <IconButton onClick={onDelete}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )
                )
            }
        </Toolbar>
    );
}

interface FinancialItemProps {
    title: string;
    value: number;
    color: string;
    previousValue?: number;
    changeRate?: number;
    showComparison?: boolean;
}

// 収支表示コンポーネント
function FinancialItem({ title, value, color, previousValue, changeRate, showComparison = false }: FinancialItemProps) {
    const getTrendIcon = (rate: number) => {
        if (rate > 0) return <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />;
        if (rate < 0) return <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />;
        return <TrendingFlatIcon fontSize="small" sx={{ color: 'grey.500' }} />;
    };

    const getTrendColor = (rate: number) => {
        if (rate > 0) return 'success.main';
        if (rate < 0) return 'error.main';
        return 'grey.500';
    };

    return (
        <Grid item xs={4} textAlign={"center"}>
            <Typography variant="subtitle1" component={"div"}>
                {title}
            </Typography>
            <Typography
                component={"span"}
                fontWeight={"fontWeightBold"}
                sx={{
                    color: color,
                    fontSize: { xs: ".9rem", sm: "1rem", md: "1.2rem" },
                    wordBreak: "break-word",
                }}
            >
                ￥{formatCurrency(value)}
            </Typography>
            {showComparison && changeRate !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                    {getTrendIcon(changeRate)}
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: getTrendColor(changeRate),
                            ml: 0.25,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" }
                        }}
                    >
                        {changeRate > 0 ? '+' : ''}{changeRate}%
                    </Typography>
                </Box>
            )}
            {showComparison && previousValue !== undefined && (
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'text.secondary',
                        fontSize: { xs: "0.6rem", sm: "0.7rem" },
                        display: 'block'
                    }}
                >
                    前期: ￥{formatCurrency(previousValue)}
                </Typography>
            )}
        </Grid>
    );
}

// カテゴリ別比較表示コンポーネント
interface CategoryComparisonProps {
    comparisons: CategoryComparison[];
    type: TransactionType;
    isExpanded: boolean;
    onToggle: () => void;
}

function CategoryComparisonSection({ comparisons, type, isExpanded, onToggle }: CategoryComparisonProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    const getTrendIcon = (rate: number) => {
        if (rate > 0) return <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />;
        if (rate < 0) return <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />;
        return <TrendingFlatIcon fontSize="small" sx={{ color: 'grey.500' }} />;
    };

    const getTrendColor = (rate: number) => {
        if (rate > 0) return 'success.main';
        if (rate < 0) return 'error.main';
        return 'grey.500';
    };

    const typeColor = type === 'income' ? theme.palette.incomeColor.main : theme.palette.expenseColor.main;
    const typeLabel = type === 'income' ? '収入' : '支出';

    return (
        <Box sx={{ mb: 2 }}>
            <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                p: isMobile ? 0.5 : 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={onToggle}
            >
            <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ color: typeColor, flexGrow: 1, fontSize: isMobile ? '0.9rem' : undefined }}
            >
                {typeLabel}カテゴリ別比較
            </Typography>
            {isExpanded ? <ExpandLessIcon fontSize={isMobile ? "small" : "medium"} /> : <ExpandMoreIcon fontSize={isMobile ? "small" : "medium"} />}
            </Box>
            
            <Collapse in={isExpanded}>
            <List dense>
                {comparisons.map((comparison, index) => (
                <React.Fragment key={comparison.category}>
                    <ListItem sx={{ py: isMobile ? 0.5 : 1 }}>
                    <ListItemText
                        primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography 
                                variant="body2" 
                                sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.85rem' : '1rem' }}
                            >
                            {comparison.category}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTrendIcon(comparison.changeRate)}
                            <Typography 
                                variant="caption"
                                sx={{ color: getTrendColor(comparison.changeRate), fontSize: isMobile ? '0.75rem' : '1rem' }}
                            >
                                {comparison.changeRate > 0 ? '+' : ''}{comparison.changeRate}%
                            </Typography>
                            </Box>
                        </Box>
                        }
                        secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography 
                            variant="caption" 
                            sx={{ color: typeColor, fontSize: isMobile ? '0.75rem' : '1rem' }}
                            >
                            今期: ￥{formatCurrency(comparison.current)}
                            </Typography>
                            <Typography 
                            variant="caption" 
                            sx={{ color: 'text.secondary', fontSize: isMobile ? '0.75rem' : '1rem' }}
                            >
                            前期: ￥{formatCurrency(comparison.previous)}
                            </Typography>
                        </Box>
                        }
                    />
                    </ListItem>
                    {index < comparisons.length - 1 && <Divider />}
                </React.Fragment>
                ))}
            </List>
            </Collapse>
        </Box>
    );
}

interface TransactionTableProps {
    viewType: "monthly" | "yearly";
}

interface Summary {
    id: string;
    type: TransactionType;
    category: string;
    icon?: string;
    amount: number;
    date: string;
    content: string;
}

export default function TransactionTable({ viewType }: TransactionTableProps) {
    const { 
        onDeleteTransaction, 
        monthlyTransactions, 
        yearlyTransactions,
        preMonthlyTransactions,
        preYearlyTransactions
    } = useTransactionContext();
    const { currentYear, currentMonth, isMobile } = useAppContext();

    const theme = useTheme();
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [showComparison, setShowComparison] = React.useState(false);
    
    // カテゴリ別比較の展開状態
    const [incomeExpanded, setIncomeExpanded] = React.useState(false);
    const [expenseExpanded, setExpenseExpanded] = React.useState(false);

    // 並び替えのための状態
    const [order, setOrder] = React.useState<"asc" | "desc" | undefined>();
    const [orderBy, setOrderBy] = React.useState<string>("date");

    const [checkBoxItems, setCheckBoxItems] = React.useState<CheckBoxItem[]>([]);
    const [initialCheckBoxItems, setInitialCheckBoxItems] = React.useState<CheckBoxItem[]>([]);
    const [anchorEl, setAnchorEl] = React.useState(null);

    const hasInitialized = React.useRef(false);

    // アニメーション用の設定
    const animationConfig = {
        timeout: 300, // アニメーション時間を300msに設定
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material-UIの標準イージング
    };

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: string
    ) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            const newSelected = monthlyTransactions.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // 削除処理
    const handleDelete = () => {
        onDeleteTransaction(selected);
        setSelected([]);
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0
            ? Math.max(
                  0,
                  (1 + page) * rowsPerPage -
                      (viewType === "monthly"
                          ? monthlyTransactions
                          : yearlyTransactions
                      ).length
              )
            : 0;

    const summarizeTransactions = (transactions: Transaction[]): Summary[] => {
        const summary: { [key: string]: Summary } = {};

        transactions.forEach((transaction, index) => {
            const date = new Date(transaction.date);
            const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const key = `${yearMonth}-${transaction.category}`;

            if (!summary[key]) {
                summary[key] = {
                    id: (index + 1).toString(), // トランザクションのIDを保持
                    type: transaction.type,
                    category: transaction.category,
                    icon: transaction.icon, // アイコンを初期化
                    amount: 0, // 初期金額
                    date: format(new Date(transaction.date), "MM月"), // 最初の日付
                    content: transaction.content, // 最初のコンテンツ
                };
            }

            summary[key].amount += transaction.amount; // 金額を合計
            // 最初の日付とコンテンツを更新
            if (transaction.date < summary[key].date) {
                summary[key].date = transaction.date;
            }
            if (transaction.content && !summary[key].content) {
                summary[key].content = transaction.content;
            }
        });

        const summarizedData = Object.values(summary);

        // 月ごとに並び替え
        summarizedData.sort((a, b) => {
            const monthA = Number(a.date.substring(0, 2));
            const monthB = Number(b.date.substring(0, 2));
            return monthA - monthB;
        });

        // idを設定
        const dataWithUniqueIds = summarizedData.map((item, index) => ({
            id: (index + 1).toString(), // 新しい ID を設定
            type: item.type,
            category: item.category,
            icon: item.icon,
            amount: item.amount,
            date: item.date,
            content: "",
        }));

        return dataWithUniqueIds;
    };

    const yearlyCategoryTransactions: Summary[] = summarizeTransactions(yearlyTransactions);

    // 並び替え処理: 月別トランザクション
    const monthlySortedTransactions = React.useMemo(() => {
        if (viewType === "monthly") {
            return [...monthlyTransactions].sort((a, b) => {
                if (orderBy === "amount") {
                    return order === "asc"
                        ? a.amount - b.amount
                        : b.amount - a.amount;
                } else {
                    return compareDesc(
                        parseISO(a.date as string),
                        parseISO(b.date as string)
                    );
                }
            });
        }
        return [];
    }, [monthlyTransactions, order, orderBy, viewType]);

    // 並び替え処理: 年別トランザクション
    const yearlySortedTransactions = React.useMemo(() => {
        if (viewType === "yearly") {
            return [...yearlyCategoryTransactions].sort((a, b) => {
                if (orderBy === "amount") {
                    return order === "asc"
                        ? a.amount - b.amount
                        : b.amount - a.amount;
                } else {
                    return compareDesc(
                        parseISO(a.date as string),
                        parseISO(b.date as string)
                    );
                }
            });
        }
        return [];
    }, [yearlyCategoryTransactions, order, orderBy]);

    React.useEffect(() => {
        setPage(0);
    }, [order, orderBy]);

    const checkedItems = checkBoxItems
        .filter((item) => item.checked)
        .map((item) => item.label);

    // 表示する行
    const visibleRows = React.useMemo(() => {
        if (viewType === "monthly") {
            return monthlySortedTransactions.filter((transaction) =>
                checkedItems.includes(transaction.category)
              ).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            );
        } else if (viewType === "yearly") {
            return yearlySortedTransactions.filter((transaction) =>
                checkedItems.includes(transaction.category)
              ).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            );
        }
        return [];
    }, [
        page,
        rowsPerPage,
        monthlySortedTransactions,
        yearlySortedTransactions,
        viewType,
        checkedItems,
    ]);

    const uniqueItems = React.useMemo(() => {
        const source = viewType === "yearly" ? yearlyCategoryTransactions : monthlyTransactions;
        return Array.from(new Map(
            source.map((transaction) => [
                transaction.category,
                { key: transaction.category, label: transaction.category }
            ])
        ).values());
    }, [viewType, monthlyTransactions, yearlyCategoryTransactions]);

    React.useEffect(() => {
        if (!hasInitialized.current && uniqueItems.length > 0) {
            const initialCheckBoxItems = uniqueItems.map((item) => ({
                key: item.key,
                label: item.label,
                checked: true,
                disabled: false,
                onStateChange: () => {},
            }));

            setInitialCheckBoxItems(initialCheckBoxItems);
            setCheckBoxItems(initialCheckBoxItems);
            hasInitialized.current = true; // 処理を一度だけ走らせるためのフラグ
        }
    }, [uniqueItems]);

    React.useEffect(() => {
        hasInitialized.current = false; // viewTypeが変わったらフラグをリセット
    }, [currentYear, currentMonth, viewType]);

    React.useEffect(() => {
        setSelected([]);
    }, [viewType]);

    // 比較データの計算
    const comparisonData = React.useMemo(() => {
        const currentTransactions = viewType === "monthly" ? monthlyTransactions : yearlyTransactions;
        const previousTransactions = viewType === "monthly" ? preMonthlyTransactions : preYearlyTransactions;
        
        return calculateComparison(currentTransactions, previousTransactions);
    }, [viewType, monthlyTransactions, yearlyTransactions, preMonthlyTransactions, preYearlyTransactions]);

    // カテゴリ別比較データの計算
    const categoryComparisons = React.useMemo(() => {
        const currentTransactions = viewType === "monthly" ? monthlyTransactions : yearlyTransactions;
        const previousTransactions = viewType === "monthly" ? preMonthlyTransactions : preYearlyTransactions;
        
        return {
            income: calculateCategoryComparison(currentTransactions, previousTransactions, 'income'),
            expense: calculateCategoryComparison(currentTransactions, previousTransactions, 'expense')
        };
    }, [viewType, monthlyTransactions, yearlyTransactions, preMonthlyTransactions, preYearlyTransactions]);

    const { income, expense, balance } = comparisonData.current;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                {/* 比較表示切り替えボタン */}
                <Box sx={{ 
                    p: 1, 
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    transition: 'all 0.2s ease-in-out' // 背景色の変化をアニメーション
                }}>
                    <Chip
                        label={showComparison ? "カテゴリ別比較表示中" : "カテゴリ別比較表示"}
                        onClick={() => setShowComparison(!showComparison)}
                        color={showComparison ? "primary" : "default"}
                        variant={showComparison ? "filled" : "outlined"}
                        size="small"
                    />
                </Box>

                {/* 収支表示エリア */}
                <Grid
                    container
                    sx={{
                        borderBottom: "1px solid rgba(224, 224, 224, 1)",
                        flexDirection: "row",
                    }}
                >
                    <FinancialItem
                        title={"収入"}
                        value={income}
                        color={theme.palette.incomeColor.main}
                        previousValue={comparisonData.previous.income}
                        changeRate={comparisonData.changeRates.income}
                        showComparison={showComparison}
                    />

                    <FinancialItem
                        title={"支出"}
                        value={expense}
                        color={theme.palette.expenseColor.main}
                        previousValue={comparisonData.previous.expense}
                        changeRate={comparisonData.changeRates.expense}
                        showComparison={showComparison}
                    />

                    <FinancialItem
                        title={"残高"}
                        value={balance}
                        color={theme.palette.balanceColor.main}
                        previousValue={comparisonData.previous.balance}
                        changeRate={comparisonData.changeRates.balance}
                        showComparison={showComparison}
                    />
                </Grid>

                {/* カテゴリ別比較表示エリア */}
                {showComparison && (
                    <Collapse 
                        in={showComparison} 
                        timeout={animationConfig.timeout}
                        easing={animationConfig.easing}
                        unmountOnExit
                    >
                        <Box sx={{ 
                            p: 2, 
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            background: `linear-gradient(135deg, 
                                ${alpha(theme.palette.primary.main, 0.01)} 0%, 
                                ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
                            backdropFilter: 'blur(1px)',
                            // エントリーアニメーション
                            animation: showComparison ? 'slideInFromTop 0.3s ease-out' : 'none',
                            '@keyframes slideInFromTop': {
                                '0%': {
                                    opacity: 0,
                                    transform: 'translateY(-10px)',
                                },
                                '100%': {
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                }
                            }
                        }}>
                            {categoryComparisons.income.length > 0 && (
                                <Box sx={{
                                    mb: categoryComparisons.expense.length > 0 ? 2 : 0,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateX(2px)',
                                    }
                                }}>
                                    <CategoryComparisonSection
                                        comparisons={categoryComparisons.income}
                                        type="income"
                                        isExpanded={incomeExpanded}
                                        onToggle={() => setIncomeExpanded(!incomeExpanded)}
                                    />
                                </Box>
                            )}
                            
                            {categoryComparisons.expense.length > 0 && (
                                <Box sx={{
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateX(2px)',
                                    }
                                }}>
                                    <CategoryComparisonSection
                                        comparisons={categoryComparisons.expense}
                                        type="expense"
                                        isExpanded={expenseExpanded}
                                        onToggle={() => setExpenseExpanded(!expenseExpanded)}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                )}

                <PopoverContent
                    initialItems={initialCheckBoxItems}
                    items={checkBoxItems}
                    setItems={setCheckBoxItems}
                    setPage={setPage}
                    searchPlaceholder={"検索"}
                    checkBoxListLabel={"全カテゴリ"}
                    onPopoverClose={() => {
                        setAnchorEl(null);
                    }}
                    anchorEl={anchorEl}
                />
                <TransactionTableToolbar
                    numSelected={selected.length}
                    viewType={viewType}
                    onDelete={handleDelete}
                />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        <TransactionTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={
                                viewType === "monthly"
                                    ? monthlySortedTransactions.filter((transaction) =>
                                          checkedItems.includes(transaction.category)
                                      ).length
                                    : yearlySortedTransactions.filter((transaction) =>
                                          checkedItems.includes(transaction.category)
                                      ).length
                            }
                            viewType={viewType}
                            checkedItems={checkedItems}
                            setAnchorEl={setAnchorEl}
                        />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={
                                            viewType === "monthly"
                                                ? (event) => handleClick(event, row.id)
                                                : undefined
                                        }
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.id}
                                        selected={isItemSelected}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        {viewType === "monthly" && (
                                            <TableCell
                                                padding="checkbox"
                                                sx={{ display: isMobile ? "none" : "table-cell" }}
                                            >
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        "aria-labelledby": labelId,
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                            sx={{ pl: 1 }}
                                        >
                                            {viewType === "monthly"
                                                ? format(
                                                      parseISO(row.date as string),
                                                      "M月d日"
                                                  )
                                                : row.date}
                                        </TableCell>
                                        <TableCell align="left" sx={{ minWidth: 120 }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <DynamicIcon iconName={row.icon} />
                                                {row.category}
                                            </Box>
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                color:
                                                    row.type === "income"
                                                        ? theme.palette.incomeColor.main
                                                        : theme.palette.expenseColor.main,
                                                fontWeight: "fontWeightBold",
                                            }}
                                        >
                                            {row.type === "expense" && "−"}￥
                                            {formatCurrency(row.amount)}
                                        </TableCell>
                                        <TableCell align="left">
                                            {viewType === "monthly" && row.content}
                                        </TableCell>
                                        {viewType === "monthly" && (
                                            <TableCell
                                                padding="checkbox"
                                                sx={{ display: isMobile ? "table-cell" : "none" }}
                                            >
                                                <Checkbox
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        "aria-labelledby": labelId,
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={viewType === "monthly" ? 6 : 4} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={
                        viewType === "monthly"
                            ? monthlySortedTransactions.filter((transaction) =>
                                  checkedItems.includes(transaction.category)
                              ).length
                            : yearlySortedTransactions.filter((transaction) =>
                                  checkedItems.includes(transaction.category)
                              ).length
                    }
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="表示件数："
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}〜${to} 件を表示 ／ 全 ${
                            count !== -1 ? count : `より多くの`
                        } 件`
                    }
                />
            </Paper>
        </Box>
    );
}