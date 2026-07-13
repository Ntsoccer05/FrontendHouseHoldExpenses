import React, { useState } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import type { FixedExpense } from "../types";
import { useAppContext } from "../context/AppContext";
import DynamicIcon from "./common/DynamicIcon";

type SortField = "category" | "content" | "amount" | "fixed_expense_day" | "is_active" | "updated_at";

interface FixedExpenseListProps {
    fixedExpenses: FixedExpense[];
    onEdit: (fixedExpense: FixedExpense) => void;
    onDelete: (id: number) => Promise<void>;
    onToggleActive: (id: number, isActive: boolean) => Promise<void>;
    onBulkDelete: (ids: number[]) => Promise<void>;
    activeTab: "expense" | "income";
    onTabChange: (tab: "expense" | "income") => void;
}

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
};

const SORT_LABELS: Record<SortField, string> = {
    category: "カテゴリ",
    content: "内容",
    amount: "金額",
    fixed_expense_day: "実行日",
    is_active: "有効",
    updated_at: "更新日",
};

export const FixedExpenseList = ({
    fixedExpenses,
    onEdit,
    onDelete,
    onToggleActive,
    onBulkDelete,
    activeTab,
    onTabChange,
}: FixedExpenseListProps) => {
    const { ExpenseCategories, IncomeCategories } = useAppContext();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const isOperating = isDeleting || isBulkDeleting;

    const getCategory = (item: FixedExpense) => {
        const cats = item.type_id === 1 ? IncomeCategories : ExpenseCategories;
        return cats?.find((c) => c.id === item.category_id);
    };

    const displayed = fixedExpenses.filter((item) =>
        activeTab === "income" ? item.type_id === 1 : item.type_id !== 1
    );

    const sorted = [...displayed].sort((a, b) => {
        if (!sortField) return 0;
        let cmp = 0;
        switch (sortField) {
            case "amount":
                cmp = a.amount - b.amount; break;
            case "fixed_expense_day":
                cmp = a.fixed_expense_day - b.fixed_expense_day; break;
            case "is_active":
                cmp = (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0); break;
            case "updated_at":
                cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(); break;
            case "category": {
                const aLabel = getCategory(a)?.label ?? "";
                const bLabel = getCategory(b)?.label ?? "";
                cmp = aLabel.localeCompare(bLabel, "ja"); break;
            }
            case "content":
                cmp = (a.content ?? "").localeCompare(b.content ?? "", "ja"); break;
        }
        return sortOrder === "asc" ? cmp : -cmp;
    });

    const displayedIds = sorted.map((item) => item.id);
    const selectedInView = selectedIds.filter((id) => displayedIds.includes(id));
    const allSelected = sorted.length > 0 && selectedInView.length === sorted.length;
    const someSelected = selectedInView.length > 0 && !allSelected;

    const handleTabChange = (newTab: "expense" | "income") => {
        onTabChange(newTab);
        setSelectedIds([]);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !displayedIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...displayedIds])]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget !== null) {
            setIsDeleting(true);
            try {
                await onDelete(deleteTarget);
                setDeleteTarget(null);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setIsBulkDeleting(true);
        try {
            await onBulkDelete(selectedInView);
            setSelectedIds([]);
            setBulkDeleteOpen(false);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleToggle = async (item: FixedExpense) => {
        setTogglingId(item.id);
        try {
            await onToggleActive(item.id, !item.is_active);
        } finally {
            setTogglingId(null);
        }
    };

    const CategoryLabel = ({ item, size = "normal" }: { item: FixedExpense; size?: "small" | "normal" }) => {
        const cat = getCategory(item);
        if (!cat) return null;
        return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <DynamicIcon iconName={cat.icon} fontSize={size === "small" ? "small" : "medium"} />
                <Typography variant={size === "small" ? "body2" : "body1"} component="span">
                    {cat.label}
                </Typography>
            </Box>
        );
    };

    const cellSx = { whiteSpace: "nowrap" as const };

    const sortHeader = (field: SortField, label: string, align?: "right") => (
        <TableCell align={align} sx={cellSx}>
            <TableSortLabel
                active={sortField === field}
                direction={sortField === field ? sortOrder : "asc"}
                onClick={() => handleSort(field)}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );

    return (
        <>
            {/* タブ切り替え（選択中は一括削除バーに切り替え、行は増やさない） */}
            <Stack sx={{ mb: 2, minHeight: 40, justifyContent: "center" }}>
                {selectedInView.length > 0 ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            {selectedInView.length}件選択中
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setBulkDeleteOpen(true)}
                        >
                            一括削除
                        </Button>
                    </Box>
                ) : (
                    <ButtonGroup fullWidth disabled={isOperating} size="small">
                        <Button
                            variant={activeTab === "expense" ? "contained" : "outlined"}
                            color="error"
                            onClick={() => handleTabChange("expense")}
                        >
                            支出
                        </Button>
                        <Button
                            variant={activeTab === "income" ? "contained" : "outlined"}
                            color="primary"
                            onClick={() => handleTabChange("income")}
                        >
                            収入
                        </Button>
                    </ButtonGroup>
                )}
            </Stack>

            {displayed.length === 0 ? (
                <Typography color="text.secondary">
                    {activeTab === "expense"
                        ? "固定支出が登録されていません"
                        : "固定収入が登録されていません"}
                </Typography>
            ) : isMobile ? (
                <>
                    {/* モバイルソートチップ */}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                        {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
                            <Chip
                                key={field}
                                label={`${SORT_LABELS[field]}${sortField === field ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}`}
                                onClick={() => handleSort(field)}
                                color={sortField === field ? "primary" : "default"}
                                size="small"
                            />
                        ))}
                    </Box>

                    {/* モバイル：カード形式 */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                        <Checkbox
                            indeterminate={someSelected}
                            checked={allSelected}
                            onChange={handleSelectAll}
                            size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                            全て選択
                        </Typography>
                    </Box>
                    {sorted.map((item) => (
                        <Paper key={item.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                            {/* 上段: チェックボックス + カテゴリ + 金額 */}
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                                    <Checkbox
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleSelectOne(item.id)}
                                        size="small"
                                        sx={{ flexShrink: 0 }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                        <CategoryLabel item={item} />
                                        {item.content ? (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                            >
                                                {item.content}
                                            </Typography>
                                        ) : null}
                                    </Box>
                                </Box>
                                <Typography variant="body1" fontWeight="bold" sx={{ ml: 1, flexShrink: 0 }}>
                                    ¥{item.amount.toLocaleString()}
                                </Typography>
                            </Box>
                            {/* 下段: 実行日 + 有効 + 操作 */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 0.5,
                                    pl: "40px",
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        毎月{item.fixed_expense_day}日
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color={item.is_active ? "success.main" : "text.disabled"}
                                        sx={{ userSelect: "none" }}
                                    >
                                        {item.is_active ? "有効" : "無効"}
                                    </Typography>
                                    <Switch
                                        checked={item.is_active}
                                        onChange={() => handleToggle(item)}
                                        disabled={togglingId === item.id}
                                        size="small"
                                        color="success"
                                    />
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <IconButton onClick={() => onEdit(item)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => setDeleteTarget(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </>
            ) : (
                /* デスクトップ：テーブル形式 */
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 600 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={someSelected}
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        size="small"
                                    />
                                </TableCell>
                                {sortHeader("category", "カテゴリ")}
                                {sortHeader("content", "内容")}
                                {sortHeader("amount", "金額", "right")}
                                {sortHeader("fixed_expense_day", "毎月実行日")}
                                {sortHeader("is_active", "有効")}
                                {sortHeader("updated_at", "更新日")}
                                <TableCell align="center" sx={cellSx}>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sorted.map((item) => (
                                <TableRow key={item.id} selected={selectedIds.includes(item.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            onChange={() => handleSelectOne(item.id)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={cellSx}>
                                        <CategoryLabel item={item} size="small" />
                                    </TableCell>
                                    <TableCell sx={cellSx}>{item.content}</TableCell>
                                    <TableCell align="right" sx={cellSx}>
                                        ¥{item.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell sx={cellSx}>{item.fixed_expense_day}日</TableCell>
                                    <TableCell sx={cellSx}>
                                        <Switch
                                            checked={item.is_active}
                                            onChange={() => handleToggle(item)}
                                            disabled={togglingId === item.id}
                                            size="small"
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell sx={cellSx}>{formatDate(item.updated_at)}</TableCell>
                                    <TableCell align="center" sx={cellSx}>
                                        <IconButton size="small" onClick={() => onEdit(item)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => setDeleteTarget(item.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* 単体削除ダイアログ */}
            <Dialog open={deleteTarget !== null} onClose={() => !isDeleting && setDeleteTarget(null)}>
                <DialogTitle sx={{ pr: 6 }}>
                    削除しますか？
                    <IconButton
                        onClick={() => setDeleteTarget(null)}
                        disabled={isDeleting}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        この固定収支を削除します。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                        キャンセル
                    </Button>
                    <LoadingButton
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        loading={isDeleting}
                    >
                        削除
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* 一括削除ダイアログ */}
            <Dialog open={bulkDeleteOpen} onClose={() => !isBulkDeleting && setBulkDeleteOpen(false)}>
                <DialogTitle sx={{ pr: 6 }}>
                    {selectedInView.length}件を削除しますか？
                    <IconButton
                        onClick={() => setBulkDeleteOpen(false)}
                        disabled={isBulkDeleting}
                        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        選択した固定収支を削除します。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting}>
                        キャンセル
                    </Button>
                    <LoadingButton
                        onClick={handleBulkDeleteConfirm}
                        color="error"
                        variant="contained"
                        loading={isBulkDeleting}
                    >
                        削除
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
