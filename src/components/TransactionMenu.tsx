import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Checkbox,
    Chip,
    Drawer,
    Grid,
    List,
    ListItem,
    Stack,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    TextField,
    CircularProgress,
    Backdrop,
    Tooltip,
    ClickAwayListener,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { memo, useState, useRef, useCallback, useEffect } from "react";
import DailySummary from "./DailySummary";
import NotesIcon from "@mui/icons-material/Notes";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { Transaction } from "../types";
import { formatCurrency, formatJPDay } from "../utils/formatting";
import { format } from "date-fns";
import { useAppContext } from "../context/AppContext";
import { useTransactionContext } from "../context/TransactionContext";
import DynamicIcon from "./common/DynamicIcon";

interface TransactionMenuProps {
    dailyTransactions: Transaction[];
    currentDay: string;
    onAddTransactionForm: () => void;
    onSelectTransaction: (transaction: Transaction) => void;
    open: boolean;
    onClose: () => void;
}

interface ContextMenuState {
    mouseX: number;
    mouseY: number;
    transaction: Transaction | null;
}

interface OperationState {
    isOperating: boolean;
    operationType: 'copy' | 'copyToToday' | 'delete' | null;
    message: string;
}

const TransactionMenu = memo(
    ({
        dailyTransactions,
        currentDay,
        onAddTransactionForm,
        onSelectTransaction,
        open,
        onClose,
    }: TransactionMenuProps) => {
        const { isMobile, showSnackBar } = useAppContext();
        const { onSaveTransaction, onDeleteTransaction, refreshMonthCache, onCopyMultipleTransactions } = useTransactionContext();
        const menuDrawerWidth = 320;

        // コンテキストメニュー関連のstate
        const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
        const [datePickerDialog, setDatePickerDialog] = useState<{
            open: boolean;
            transaction: Transaction | null;
        }>({ open: false, transaction: null });
        const [selectedDate, setSelectedDate] = useState<string>("");
        const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
            open: boolean;
            transaction: Transaction | null;
        }>({ open: false, transaction: null });

        // 操作状態管理
        const [operationState, setOperationState] = useState<OperationState>({
            isOperating: false,
            operationType: null,
            message: "",
        });

        // 今日の日付を取得
        const today = new Date().toISOString().split('T')[0];

        // 操作ヒントの表示状態
        const [hintOpen, setHintOpen] = useState(false);

        // 複数選択複製用 state
        const [selectedIds, setSelectedIds] = useState<string[]>([]);
        const [bulkCopyDialog, setBulkCopyDialog] = useState<{
            open: boolean;
            destinationDate: string;
        }>({ open: false, destinationDate: currentDay });
        const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

        // 長押し関連
        const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
        const [isDragging, setIsDragging] = useState(false);

        // 日付が変わったら選択状態をリセット、複製先日付も対象日に戻す
        useEffect(() => {
            setSelectedIds([]);
            setBulkCopyDialog((prev) => ({
                ...prev,
                destinationDate: prev.open ? prev.destinationDate : currentDay,
            }));
        }, [currentDay]);

        // コンテキストメニューを表示
        const handleContextMenu = useCallback((event: React.MouseEvent, transaction: Transaction) => {
            event.preventDefault();
            event.stopPropagation();
            setContextMenu({
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
                transaction,
            });
        }, []);

        // 長押し開始
        const handleTouchStart = useCallback((event: React.TouchEvent, transaction: Transaction) => {
            setIsDragging(false);
            longPressTimerRef.current = setTimeout(() => {
                if (!isDragging) {
                    const touch = event.touches[0];
                    setContextMenu({
                        mouseX: touch.clientX - 2,
                        mouseY: touch.clientY - 4,
                        transaction,
                    });
                    // バイブレーション
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            }, 500);
        }, [isDragging]);

        // 長押し終了
        const handleTouchEnd = useCallback(() => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            setIsDragging(false);
        }, []);

        // タッチ移動
        const handleTouchMove = useCallback(() => {
            setIsDragging(true);
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        }, []);

        // コンテキストメニューを閉じる
        const handleCloseContextMenu = useCallback(() => {
            setContextMenu(null);
        }, []);

        // 今日に複製
        const handleCopyToToday = useCallback(async (transaction: Transaction) => {
            if (transaction.date === today) {
                showSnackBar({
                    title: "エラー",
                    bodyText: "同じ日付には複製できません",
                    backgroundColor: "#d32f2f"
                });
                return;
            }

            setOperationState({
                isOperating: true,
                operationType: 'copyToToday',
                message: "今日に複製中..."
            });

            try {
                const copyData = {
                    type: transaction.type,
                    date: today,
                    amount: transaction.amount,
                    category: transaction.category,
                    content: transaction.content,
                    icon: transaction.icon,
                };

                await onSaveTransaction(copyData);

                // キャッシュを無効化（複製元と今日の月）
                const sourceMonth = format(new Date(transaction.date), "yyyyMM");
                const todayMonth = format(new Date(today), "yyyyMM");
                refreshMonthCache(sourceMonth);
                if (sourceMonth !== todayMonth) {
                    refreshMonthCache(todayMonth);
                }

                showSnackBar({
                    title: "複製完了",
                    bodyText: "今日に複製されました",
                    backgroundColor: "#455a64"
                });
            } catch (error) {
                console.error("複製失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "複製に失敗しました",
                    backgroundColor: "#d32f2f"
                });
            } finally {
                setOperationState({
                    isOperating: false,
                    operationType: null,
                    message: ""
                });
            }
        }, [today, onSaveTransaction, showSnackBar, refreshMonthCache]);

        // 別日に複製（日付選択ダイアログを表示）
        const handleCopyToOtherDay = useCallback((transaction: Transaction) => {
            setDatePickerDialog({ open: true, transaction });
            setSelectedDate(currentDay);
        }, [currentDay]);

        // 日付選択ダイアログでの複製実行
        const handleExecuteCopyToDate = useCallback(async () => {
            if (!datePickerDialog.transaction || !selectedDate) return;

            if (datePickerDialog.transaction.date === selectedDate) {
                showSnackBar({
                    title: "エラー",
                    bodyText: "同じ日付には複製できません",
                    backgroundColor: "#d32f2f"
                });
                return;
            }

            setOperationState({
                isOperating: true,
                operationType: 'copy',
                message: "複製中..."
            });

            try {
                const copyData = {
                    type: datePickerDialog.transaction.type,
                    date: selectedDate,
                    amount: datePickerDialog.transaction.amount,
                    category: datePickerDialog.transaction.category,
                    content: datePickerDialog.transaction.content,
                    icon: datePickerDialog.transaction.icon,
                };

                await onSaveTransaction(copyData);

                // キャッシュを無効化（複製元と複製先の月）
                const sourceMonth = format(new Date(datePickerDialog.transaction.date), "yyyyMM");
                const destinationMonth = format(new Date(selectedDate), "yyyyMM");
                refreshMonthCache(sourceMonth);
                if (sourceMonth !== destinationMonth) {
                    refreshMonthCache(destinationMonth);
                }

                showSnackBar({
                    title: "複製完了",
                    bodyText: `${formatJPDay(selectedDate)}に複製されました`,
                    backgroundColor: "#455a64"
                });
                setDatePickerDialog({ open: false, transaction: null });
            } catch (error) {
                console.error("複製失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "複製に失敗しました",
                    backgroundColor: "#d32f2f"
                });
            } finally {
                setOperationState({
                    isOperating: false,
                    operationType: null,
                    message: ""
                });
            }
        }, [datePickerDialog.transaction, selectedDate, onSaveTransaction, showSnackBar, refreshMonthCache]);

        // 削除確認ダイアログを表示
        const handleShowDeleteConfirm = useCallback((transaction: Transaction) => {
            setDeleteConfirmDialog({ open: true, transaction });
        }, []);

        // 削除実行
        const handleExecuteDelete = useCallback(async () => {
            if (!deleteConfirmDialog.transaction) return;

            setOperationState({
                isOperating: true,
                operationType: 'delete',
                message: "削除中..."
            });

            try {
                await onDeleteTransaction(deleteConfirmDialog.transaction.id);
                showSnackBar({
                    title: "削除完了",
                    bodyText: "家計簿が削除されました",
                    backgroundColor: "#8d4e85"
                });
                setDeleteConfirmDialog({ open: false, transaction: null });
            } catch (error) {
                console.error("削除失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "削除に失敗しました",
                    backgroundColor: "#d32f2f"
                });
            } finally {
                setOperationState({
                    isOperating: false,
                    operationType: null,
                    message: ""
                });
            }
        }, [deleteConfirmDialog.transaction, onDeleteTransaction, showSnackBar]);

        // 通常のクリック処理（編集）
        const handleTransactionClick = useCallback((transaction: Transaction) => {
            if (contextMenu) return; // コンテキストメニューが開いている場合は無視
            onSelectTransaction(transaction);
        }, [contextMenu, onSelectTransaction]);

        // 個別チェックボックスのトグル
        const handleToggleSelect = useCallback((id: string) => {
            setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
            );
        }, []);

        // 全選択/全解除
        const handleSelectAll = useCallback(() => {
            setSelectedIds((prev) =>
                prev.length === dailyTransactions.length
                    ? []
                    : dailyTransactions.map((t) => t.id)
            );
        }, [dailyTransactions]);

        // 一括複製ダイアログを開く
        const handleBulkCopyClick = useCallback(() => {
            setBulkCopyDialog((prev) => ({ ...prev, open: true }));
        }, []);

        // 一括複製実行
        const handleExecuteBulkCopy = useCallback(async () => {
            if (!bulkCopyDialog.destinationDate || selectedIds.length === 0) return;

            setOperationState({
                isOperating: true,
                operationType: 'copy',
                message: `${selectedIds.length}件を複製中...`,
            });

            try {
                await onCopyMultipleTransactions(
                    selectedIds,
                    currentDay,
                    bulkCopyDialog.destinationDate
                );

                showSnackBar({
                    title: "複製完了",
                    bodyText: `${selectedIds.length}件を${formatJPDay(bulkCopyDialog.destinationDate)}に複製しました`,
                    backgroundColor: "#455a64",
                });

                setSelectedIds([]);
                setBulkCopyDialog((prev) => ({ ...prev, open: false }));
            } catch (error) {
                console.error("一括複製失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "複製に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            } finally {
                setOperationState({ isOperating: false, operationType: null, message: '' });
            }
        }, [
            selectedIds,
            currentDay,
            bulkCopyDialog.destinationDate,
            onCopyMultipleTransactions,
            showSnackBar,
        ]);

        // 一括削除ダイアログを開く
        const handleBulkDeleteClick = useCallback(() => {
            setBulkDeleteDialogOpen(true);
        }, []);

        // 一括削除実行
        const handleExecuteBulkDelete = useCallback(async () => {
            if (selectedIds.length === 0) return;

            setOperationState({
                isOperating: true,
                operationType: 'delete',
                message: `${selectedIds.length}件を削除中...`,
            });

            try {
                await onDeleteTransaction(selectedIds);
                showSnackBar({
                    title: "削除完了",
                    bodyText: `${selectedIds.length}件を削除しました`,
                    backgroundColor: "#455a64",
                });
                setSelectedIds([]);
                setBulkDeleteDialogOpen(false);
            } catch (error) {
                console.error("一括削除失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "削除に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            } finally {
                setOperationState({ isOperating: false, operationType: null, message: '' });
            }
        }, [selectedIds, onDeleteTransaction, showSnackBar]);

        // コンテキストメニューアイテムの処理
        const handleContextMenuAction = useCallback((action: string, transaction: Transaction) => {
            handleCloseContextMenu();
            
            switch (action) {
                case 'copyToToday':
                    handleCopyToToday(transaction);
                    break;
                case 'copyToOtherDay':
                    handleCopyToOtherDay(transaction);
                    break;
                case 'edit':
                    onSelectTransaction(transaction);
                    break;
                case 'delete':
                    handleShowDeleteConfirm(transaction);
                    break;
            }
        }, [handleCloseContextMenu, handleCopyToToday, handleCopyToOtherDay, onSelectTransaction, handleShowDeleteConfirm]);

        return (
            <>
                <Drawer
                    sx={{
                        width: isMobile ? "auto" : menuDrawerWidth,
                        "& .MuiDrawer-paper": {
                            width: isMobile ? "auto" : menuDrawerWidth,
                            boxSizing: "border-box",
                            p: 2,
                            ...(isMobile && {
                                height: "67vh",
                                borderTopRightRadius: 8,
                                borderTopLeftRadius: 8,
                            }),
                            ...(!isMobile && {
                                top: 64,
                                height: `calc(100% - 64px)`,
                            }),
                        },
                    }}
                    variant={isMobile ? "temporary" : "permanent"}
                    anchor={isMobile ? "bottom" : "right"}
                    open={open}
                    onClose={onClose}
                >
                    <Stack sx={{ height: "100%" }} spacing={2}>
                        {/* 日付 */}
                        <Typography fontWeight={"bold"}>
                            日時： {currentDay}
                        </Typography>
                        
                        <DailySummary
                            dailyTransactions={dailyTransactions}
                            columns={isMobile ? 3 : 2}
                        />

                        {/* 内訳ヘッダー（選択中は選択操作バーに切り替え、行は増やさない） */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                minHeight: 48,
                                px: 1,
                                py: 1,
                                gap: 1,
                                bgcolor: selectedIds.length > 0 ? 'action.selected' : undefined,
                                borderRadius: selectedIds.length > 0 ? 1 : 0,
                                mx: selectedIds.length > 0 ? 1 : 0,
                            }}
                        >
                            {dailyTransactions.length > 0 && (
                                <Checkbox
                                    size="small"
                                    checked={
                                        selectedIds.length === dailyTransactions.length &&
                                        dailyTransactions.length > 0
                                    }
                                    indeterminate={
                                        selectedIds.length > 0 &&
                                        selectedIds.length < dailyTransactions.length
                                    }
                                    onChange={handleSelectAll}
                                    sx={{ p: 0.5 }}
                                />
                            )}
                            {selectedIds.length > 0 ? (
                                <>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ flex: 1 }}
                                    >
                                        {selectedIds.length}件選択中
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="primary"
                                        onClick={handleBulkCopyClick}
                                        startIcon={<ContentCopyIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        複製
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="error"
                                        onClick={handleBulkDeleteClick}
                                        startIcon={<DeleteIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        削除
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Box display="flex" alignItems="center" sx={{ flex: 1 }}>
                                        <NotesIcon sx={{ mr: 0.5 }} fontSize="small" />
                                        <Typography variant="body1" fontWeight="medium">内訳</Typography>
                                        <ClickAwayListener onClickAway={() => setHintOpen(false)}>
                                            <Tooltip
                                                open={hintOpen}
                                                onClose={() => setHintOpen(false)}
                                                disableFocusListener
                                                disableHoverListener
                                                disableTouchListener
                                                title={`記録済みの内容を長押し${!isMobile ? "または右クリック" : ""}でメニューを表示`}
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setHintOpen((prev) => !prev)}
                                                    sx={{ ml: 0.5, p: 0.5 }}
                                                >
                                                    <InfoOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ClickAwayListener>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="primary"
                                        onClick={onAddTransactionForm}
                                        startIcon={<AddCircleIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        追加
                                    </Button>
                                </>
                            )}
                        </Box>

                        {/* 取引一覧 */}
                        <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
                            <List aria-label="取引履歴">
                                <Stack spacing={2}>
                                    {dailyTransactions.map((transaction) => (
                                        <ListItem
                                            disablePadding
                                            key={transaction.id}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 0.5 }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedIds.includes(transaction.id)}
                                                    onChange={() => handleToggleSelect(transaction.id)}
                                                    sx={{ p: 0.5, flexShrink: 0 }}
                                                />
                                                <Card
                                                    sx={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                        backgroundColor:
                                                            transaction.type === "income"
                                                                ? (theme) =>
                                                                      theme.palette.incomeColor.light
                                                                : (theme) =>
                                                                      theme.palette.expenseColor.light,
                                                        '&:hover': {
                                                            boxShadow: 2,
                                                        },
                                                        position: 'relative',
                                                        boxShadow: selectedIds.includes(transaction.id)
                                                            ? (theme) => `0 0 0 2px ${theme.palette.primary.main}`
                                                            : undefined,
                                                    }}
                                                    onContextMenu={(e) => handleContextMenu(e, transaction)}
                                                    onTouchStart={(e) => handleTouchStart(e, transaction)}
                                                    onTouchEnd={handleTouchEnd}
                                                    onTouchMove={handleTouchMove}
                                                >
                                                    <CardActionArea
                                                        onClick={() => handleTransactionClick(transaction)}
                                                    >
                                                        <CardContent sx={{
                                                            padding: { xs: 1, md: 2 },
                                                        }}>
                                                            <Grid
                                                                container
                                                                spacing={{ xs: 0.5, sm: 1 }}
                                                                alignItems="center"
                                                                wrap="wrap"
                                                            >
                                                                <Grid
                                                                    item
                                                                    xs={1}
                                                                    sm={0.5}
                                                                    md={1}
                                                                    style={{
                                                                        paddingLeft: 0,
                                                                    }}
                                                                >
                                                                    {transaction.icon && (
                                                                        <DynamicIcon
                                                                            iconName={transaction.icon}
                                                                            fontSize={"medium"}
                                                                        />
                                                                    )}
                                                                </Grid>
                                                                <Grid item xs={2.5}>
                                                                    <Typography
                                                                        variant="caption"
                                                                        display="block"
                                                                        gutterBottom
                                                                    >
                                                                        {transaction.category}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        gutterBottom
                                                                    >
                                                                        {transaction.content}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={4.5}>
                                                                    <Typography
                                                                        gutterBottom
                                                                        textAlign={"right"}
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            wordBreak: "break-all",
                                                                        }}
                                                                    >
                                                                        ¥{formatCurrency(transaction.amount)}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                            {transaction.isFixedExpense && (
                                                                <Chip
                                                                    label="固定費"
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    sx={{ ml: 1, fontSize: "0.65rem", height: 18 }}
                                                                />
                                                            )}
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </Stack>
                            </List>
                        </Box>
                    </Stack>
                </Drawer>

                {/* コンテキストメニュー */}
                <Menu
                    open={contextMenu !== null}
                    onClose={handleCloseContextMenu}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                >
                    <MenuItem onClick={() => contextMenu?.transaction && handleContextMenuAction('copyToOtherDay', contextMenu!.transaction)}>
                        <ListItemIcon>
                            <ContentCopyIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>別日に複製</ListItemText>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => contextMenu?.transaction && handleContextMenuAction('copyToToday', contextMenu!.transaction)}
                        disabled={contextMenu?.transaction?.date === today}
                    >
                        <ListItemIcon>
                            <RestoreIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>今日に複製</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => contextMenu?.transaction && handleContextMenuAction('edit', contextMenu!.transaction)}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>編集</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => contextMenu?.transaction && handleContextMenuAction('delete', contextMenu!.transaction)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>削除</ListItemText>
                    </MenuItem>
                </Menu>

                {/* 日付選択ダイアログ */}
                <Dialog
                    open={datePickerDialog.open}
                    onClose={() => setDatePickerDialog({ open: false, transaction: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ pr: 6 }}>
                        複製先の日付を選択
                        <IconButton
                            onClick={() => setDatePickerDialog({ open: false, transaction: null })}
                            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="複製先の日付"
                            type="date"
                            fullWidth
                            variant="outlined"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {datePickerDialog.transaction && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    複製対象の取引
                                </Typography>
                                <Typography variant="body2">
                                    {datePickerDialog.transaction.category} - {datePickerDialog.transaction.content}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ¥{formatCurrency(datePickerDialog.transaction.amount)}
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDatePickerDialog({ open: false, transaction: null })}>
                            キャンセル
                        </Button>
                        <Button 
                            onClick={handleExecuteCopyToDate}
                            variant="contained"
                            disabled={!selectedDate || selectedDate === datePickerDialog.transaction?.date}
                        >
                            複製
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 削除確認ダイアログ */}
                <Dialog
                    open={deleteConfirmDialog.open}
                    onClose={() => setDeleteConfirmDialog({ open: false, transaction: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ pr: 6 }}>
                        削除確認
                        <IconButton
                            onClick={() => setDeleteConfirmDialog({ open: false, transaction: null })}
                            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>
                            以下の入力内容を削除しますか？
                        </Typography>
                        {deleteConfirmDialog.transaction && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    {deleteConfirmDialog.transaction.category}
                                    {deleteConfirmDialog.transaction.content && ` - ${deleteConfirmDialog.transaction.content}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ¥{formatCurrency(deleteConfirmDialog.transaction.amount)}
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmDialog({ open: false, transaction: null })}>
                            キャンセル
                        </Button>
                        <Button 
                            onClick={handleExecuteDelete}
                            variant="contained"
                            color="error"
                        >
                            削除
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 一括複製用日付選択ダイアログ */}
                <Dialog
                    open={bulkCopyDialog.open}
                    onClose={() => setBulkCopyDialog((prev) => ({ ...prev, open: false }))}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ pr: 6 }}>
                        複製先の日付を選択
                        <IconButton
                            onClick={() => setBulkCopyDialog((prev) => ({ ...prev, open: false }))}
                            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="複製先の日付"
                            type="date"
                            fullWidth
                            variant="outlined"
                            value={bulkCopyDialog.destinationDate}
                            onChange={(e) =>
                                setBulkCopyDialog((prev) => ({
                                    ...prev,
                                    destinationDate: e.target.value,
                                }))
                            }
                            onClick={(e) => {
                                const input = (e.currentTarget as HTMLElement).querySelector('input');
                                if (input && 'showPicker' in input) {
                                    (input as HTMLInputElement).showPicker();
                                }
                            }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                複製対象（{selectedIds.length}件）
                            </Typography>
                            {dailyTransactions
                                .filter((t) => selectedIds.includes(t.id))
                                .map((t) => (
                                    <Typography key={t.id} variant="body2">
                                        {t.category}
                                        {t.content && ` - ${t.content}`}
                                        　¥{formatCurrency(t.amount)}
                                    </Typography>
                                ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setBulkCopyDialog((prev) => ({ ...prev, open: false }))}
                        >
                            キャンセル
                        </Button>
                        <Button
                            onClick={handleExecuteBulkCopy}
                            variant="contained"
                            disabled={
                                !bulkCopyDialog.destinationDate ||
                                bulkCopyDialog.destinationDate === currentDay
                            }
                        >
                            複製
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 一括削除確認ダイアログ */}
                <Dialog
                    open={bulkDeleteDialogOpen}
                    onClose={() => setBulkDeleteDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ pr: 6 }}>
                        削除確認
                        <IconButton
                            onClick={() => setBulkDeleteDialogOpen(false)}
                            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>
                            選択した{selectedIds.length}件を削除しますか？
                        </Typography>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            {dailyTransactions
                                .filter((t) => selectedIds.includes(t.id))
                                .map((t) => (
                                    <Typography key={t.id} variant="body2">
                                        {t.category}
                                        {t.content && ` - ${t.content}`}
                                        　¥{formatCurrency(t.amount)}
                                    </Typography>
                                ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setBulkDeleteDialogOpen(false)}>
                            キャンセル
                        </Button>
                        <Button
                            onClick={handleExecuteBulkDelete}
                            variant="contained"
                            color="error"
                        >
                            削除
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* 操作中のローディング */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
                    open={operationState.isOperating}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CircularProgress color="inherit" />
                        <Typography variant="body1">{operationState.message}</Typography>
                    </Box>
                </Backdrop>
            </>
        );
    }
);

export default TransactionMenu;