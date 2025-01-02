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
import { financeCalculations } from "../utils/financeCalculations";
import { Badge, Grid } from "@mui/material";
import {
    formatCurrency,
    formatJPMonth,
    formatJPYear,
} from "../utils/formatting";
import { compareDesc, format, parseISO } from "date-fns";
import { useTransactionContext } from "../context/TransactionContext";
import DynamicIcon from "./common/DynamicIcon";
import TableSortLabel from "@mui/material/TableSortLabel"; // 並び替えラベルのインポート
import HeightIcon from "@mui/icons-material/Height";
import { useAppContext } from "../context/AppContext";
import FilterListIcon from "@mui/icons-material/FilterList";
import { CheckBoxItem, Transaction } from "../types";
import { PopoverContent } from "./PopoverContent";

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

interface YearlyTransactionTableHeadProps {
    order: "asc" | "desc" | undefined;
    orderBy: string;
    onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
    rowCount: number;
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
                        sx={{ width: "50px", minWidth: "50px" }}
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
                        width: { xs: "100px", sm: "150px", md: "200px" },
                        minWidth: "100px",
                    }} // 固定幅
                >
                    {viewType === "monthly" ? "日付" : "月"}
                </TableCell>
                <TableCell
                    align="left"
                    sx={{
                        width: { xs: "150px", sm: "200px", md: "250px" },
                        minWidth: "150px",
                    }} // 固定幅
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

                {/* 金額の並び替えを可能にする */}
                <TableCell
                    align={"left"}
                    sortDirection={orderBy === "amount" ? order : false}
                    sx={{
                        width: { xs: "100px", sm: "150px", md: "200px" },
                        minWidth: "100px",
                    }} // 固定幅
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
    const { currentYear, currentMonth } = useAppContext();

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
            {numSelected > 0 && (
                <Tooltip title="Delete">
                    <IconButton onClick={onDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}

interface FinancialItemProps {
    title: string;
    value: number;
    color: string;
}
// 収支表示コンポーネント
function FinancialItem({ title, value, color }: FinancialItemProps) {
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
                    fontSize: { xs: ".8rem", sm: "1rem", md: "1.2rem" },
                    wordBreak: "break-word",
                }}
            >
                ￥{formatCurrency(value)}
            </Typography>
        </Grid>
    );
}

interface TransactionTableProps {
    viewType: "monthly" | "yearly";
}

interface Summary {
    id: string;
    category: string;
    icon?: string;
    amount: number;
    date: string;
    content: string;
}

// 本体
export default function TransactionTable({ viewType }: TransactionTableProps) {
    // const monthlyTransactions = useMonthlyTransactions();
    // const yearlyTransactions = useYearlyTransactions();

    const { onDeleteTransaction, monthlyTransactions, yearlyTransactions } =
        useTransactionContext();

    const { currentYear, ExpenseCategories, IncomeCategories, isMobile } =
        useAppContext();

    const theme = useTheme();
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // 並び替えのための状態
    const [order, setOrder] = React.useState<"asc" | "desc" | undefined>();
    const [orderBy, setOrderBy] = React.useState<string>("date"); // 初期状態は日付でのソート

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

    // const yearlyCategorySums = yearlyTransactions.reduce<
    //     Record<string, number>
    // >((acc, transaction) => {
    //     if (!acc[transaction.category]) {
    //         acc[transaction.category] = 0;
    //     }
    //     acc[transaction.category] += transaction.amount;
    //     return acc;
    // }, {} as Record<string, number>);

    const summarizeTransactions = (transactions: Transaction[]): Summary[] => {
        const summary: { [key: string]: Summary } = {};

        transactions.forEach((transaction, index) => {
            const date = new Date(transaction.date);
            const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
            const key = `${yearMonth}-${transaction.category}`;

            if (!summary[key]) {
                summary[key] = {
                    id: (index + 1).toString(), // トランザクションのIDを保持
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
            category: item.category,
            icon: item.icon,
            amount: item.amount,
            date: item.date,
            content: "",
        }));

        return dataWithUniqueIds;
    };

    const yearlyCategoryTransactions: Summary[] =
        summarizeTransactions(yearlyTransactions);

    // const categories =
    //     IncomeCategories || ExpenseCategories
    //         ? [
    //               ...(IncomeCategories as CategoryItem[]),
    //               ...(ExpenseCategories as CategoryItem[]),
    //           ]
    //         : [];

    // const yearlyCategoryIcons = Object.entries(yearlyCategorySums).map(
    //     ([key, value]) => {
    //         const yearlyTransactionIcon = categories.filter((category) => {
    //             return category.label === key;
    //         });
    //         return {
    //             category: key,
    //             icon: yearlyTransactionIcon[0]?.icon || "",
    //         };
    //     }
    // );

    // Object.entriesは[key, value]に分割される
    // const yearlyCategoryTransactions = Object.entries(yearlyCategorySums).map(
    //     ([key, value], index) => {
    //         // Use find to get the specific icon for the category
    //         const iconEntry = yearlyCategoryIcons.find(
    //             (yearlyIcon) => yearlyIcon.category === key
    //         );
    //         const icon = iconEntry ? iconEntry.icon : "";
    //         return {
    //             id: (index + 1).toString(),
    //             category: key,
    //             icon: icon,
    //             amount: value,
    //             date: format(new Date(currentYear), "yyyy"),
    //             content: "",
    //         };
    //     }
    // );

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

    // 表示する行
    const visibleRows = React.useMemo(() => {
        if (viewType === "monthly") {
            return monthlySortedTransactions.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            );
        } else if (viewType === "yearly") {
            return yearlySortedTransactions.slice(
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
    ]);

    const items = React.useMemo(() => {
        return (
            viewType === "yearly"
                ? yearlyCategoryTransactions
                : monthlyTransactions
        ).map((transaction) => ({
            key: transaction.category,
            label: transaction.category,
        }));
    }, [viewType, yearlyCategoryTransactions, monthlyTransactions]);
    const uniqueItems = Array.from(
        new Map(items.map((item) => [item.key, item])).values()
    );

    const hasInitialized = React.useRef(false);

    const [checkBoxItems, setCheckBoxItems] = React.useState<CheckBoxItem[]>(
        []
    );
    const [initialCheckBoxItems, setInitialCheckBoxItems] = React.useState<
        CheckBoxItem[]
    >([]);

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
    }, [uniqueItems, viewType]); // viewTypeを追加
    React.useEffect(() => {
        hasInitialized.current = false; // viewTypeが変わったらフラグをリセット
    }, [viewType]);

    const checkedItems = checkBoxItems
        .filter((item) => item.checked)
        .map((item) => item.label);
    const [anchorEl, setAnchorEl] = React.useState(null);

    React.useEffect(() => {
        setSelected([]);
    }, [viewType]);

    const { income, expense, balance } = financeCalculations(
        viewType === "monthly" ? monthlyTransactions : yearlyTransactions
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
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
                    />

                    <FinancialItem
                        title={"支出"}
                        value={expense}
                        color={theme.palette.expenseColor.main}
                    />

                    <FinancialItem
                        title={"残高"}
                        value={balance}
                        color={theme.palette.balanceColor.main}
                    />
                </Grid>

                <PopoverContent
                    initialItems={initialCheckBoxItems}
                    items={checkBoxItems}
                    setItems={setCheckBoxItems}
                    searchPlaceholder={"Search"}
                    checkBoxListLabel={"All items"}
                    onPopoverClose={() => {
                        setAnchorEl(null);
                    }}
                    anchorEl={anchorEl}
                />

                {/* ツールバー */}
                <TransactionTableToolbar
                    numSelected={selected.length}
                    viewType={viewType}
                    onDelete={handleDelete}
                />

                {/* 取引一覧*/}
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        {/* テーブルヘッド */}
                        {viewType === "monthly" ? (
                            <TransactionTableHead
                                numSelected={selected.length}
                                onSelectAllClick={handleSelectAllClick}
                                rowCount={monthlyTransactions.length}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                viewType={viewType}
                                checkedItems={checkedItems}
                                setAnchorEl={setAnchorEl}
                            />
                        ) : (
                            <TransactionTableHead
                                rowCount={monthlyTransactions.length}
                                order={order}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                                viewType={viewType}
                                checkedItems={checkedItems}
                                setAnchorEl={setAnchorEl}
                            />
                        )}
                        {/* 取引内容 */}
                        <TableBody>
                            {visibleRows.map((transaction, index) => {
                                const isItemSelected = isSelected(
                                    transaction.id
                                );

                                return (
                                    checkedItems.includes(
                                        transaction.category
                                    ) && (
                                        <TableRow
                                            hover={
                                                viewType === "monthly" || false
                                            }
                                            onClick={(event) =>
                                                viewType === "monthly" &&
                                                handleClick(
                                                    event,
                                                    transaction.id
                                                )
                                            }
                                            role="checkbox"
                                            aria-checked={
                                                viewType === "monthly" &&
                                                isItemSelected
                                            }
                                            tabIndex={-1}
                                            key={transaction.id}
                                            selected={
                                                viewType === "monthly" &&
                                                isItemSelected
                                            }
                                            sx={{
                                                cursor:
                                                    viewType === "monthly"
                                                        ? "pointer"
                                                        : "normal",
                                            }}
                                        >
                                            {viewType === "monthly" && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell
                                                component="th"
                                                scope="row"
                                                padding="none"
                                                sx={{
                                                    paddingLeft:
                                                        viewType === "yearly"
                                                            ? "12px"
                                                            : "",
                                                }}
                                            >
                                                {transaction.date}
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {transaction.icon && (
                                                    <DynamicIcon
                                                        iconName={
                                                            transaction.icon
                                                        }
                                                        fontSize="medium"
                                                    />
                                                )}
                                                {transaction.category}
                                            </TableCell>
                                            <TableCell align="left">
                                                {transaction.amount}
                                            </TableCell>
                                            <TableCell align="left">
                                                {transaction.content}
                                            </TableCell>
                                        </TableRow>
                                    )
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* テーブル下部 */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={
                        viewType === "monthly"
                            ? monthlyTransactions.length
                            : yearlyCategoryTransactions.length
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
