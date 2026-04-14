import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
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
    TextField,
    CircularProgress,
    Backdrop,
} from "@mui/material";
import { memo, useState, useRef, useCallback } from "react";
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
        const { onSaveTransaction, onDeleteTransaction, invalidateMonthCache } = useTransactionContext();
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

        // 長押し関連
        const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
        const [isDragging, setIsDragging] = useState(false);

        // 今日の日付を取得
        const today = new Date().toISOString().split('T')[0];

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

        // 今日にコピー
        const handleCopyToToday = useCallback(async (transaction: Transaction) => {
            if (transaction.date === today) {
                showSnackBar({
                    title: "エラー",
                    bodyText: "同じ日付にはコピーできません",
                    backgroundColor: "#d32f2f"
                });
                return;
            }

            setOperationState({
                isOperating: true,
                operationType: 'copyToToday',
                message: "今日にコピー中..."
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

                // キャッシュを無効化（コピー元と今日の月）
                const sourceMonth = format(new Date(transaction.date), "yyyyMM");
                const todayMonth = format(new Date(today), "yyyyMM");
                invalidateMonthCache(sourceMonth);
                if (sourceMonth !== todayMonth) {
                    invalidateMonthCache(todayMonth);
                }

                showSnackBar({
                    title: "コピー完了",
                    bodyText: "今日にコピーされました",
                    backgroundColor: "#455a64"
                });
            } catch (error) {
                console.error("コピー失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "コピーに失敗しました",
                    backgroundColor: "#d32f2f"
                });
            } finally {
                setOperationState({
                    isOperating: false,
                    operationType: null,
                    message: ""
                });
            }
        }, [today, onSaveTransaction, showSnackBar, invalidateMonthCache]);

        // 別日にコピー（日付選択ダイアログを表示）
        const handleCopyToOtherDay = useCallback((transaction: Transaction) => {
            setDatePickerDialog({ open: true, transaction });
            setSelectedDate(currentDay);
        }, [currentDay]);

        // 日付選択ダイアログでのコピー実行
        const handleExecuteCopyToDate = useCallback(async () => {
            if (!datePickerDialog.transaction || !selectedDate) return;

            if (datePickerDialog.transaction.date === selectedDate) {
                showSnackBar({
                    title: "エラー",
                    bodyText: "同じ日付にはコピーできません",
                    backgroundColor: "#d32f2f"
                });
                return;
            }

            setOperationState({
                isOperating: true,
                operationType: 'copy',
                message: "コピー中..."
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

                // キャッシュを無効化（コピー元とコピー先の月）
                const sourceMonth = format(new Date(datePickerDialog.transaction.date), "yyyyMM");
                const destinationMonth = format(new Date(selectedDate), "yyyyMM");
                invalidateMonthCache(sourceMonth);
                if (sourceMonth !== destinationMonth) {
                    invalidateMonthCache(destinationMonth);
                }

                showSnackBar({
                    title: "コピー完了",
                    bodyText: `${formatJPDay(selectedDate)}にコピーされました`,
                    backgroundColor: "#455a64"
                });
                setDatePickerDialog({ open: false, transaction: null });
            } catch (error) {
                console.error("コピー失敗:", error);
                showSnackBar({
                    title: "エラー",
                    bodyText: "コピーに失敗しました",
                    backgroundColor: "#d32f2f"
                });
            } finally {
                setOperationState({
                    isOperating: false,
                    operationType: null,
                    message: ""
                });
            }
        }, [datePickerDialog.transaction, selectedDate, onSaveTransaction, showSnackBar, invalidateMonthCache]);

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
                        
                        {/* 操作ヒント */}
                        <Box sx={{ p: 1, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
                            <Typography variant="caption">
                                💡 記録済みの内容を長押し{!isMobile && "または右クリック"}でメニューを表示
                            </Typography>
                        </Box>

                        <DailySummary
                            dailyTransactions={dailyTransactions}
                            columns={isMobile ? 3 : 2}
                        />

                        {/* 内訳タイトル&内訳追加ボタン */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                p: 1,
                            }}
                        >
                            <Box display="flex" alignItems="center">
                                <NotesIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">内訳</Typography>
                            </Box>
                            <Button
                                startIcon={<AddCircleIcon />}
                                color="primary"
                                onClick={onAddTransactionForm}
                            >
                                内訳を追加
                            </Button>
                        </Box>

                        {/* 取引一覧 */}
                        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                            <List aria-label="取引履歴">
                                <Stack spacing={2}>
                                    {dailyTransactions.map((transaction) => (
                                        <ListItem
                                            disablePadding
                                            key={transaction.id}
                                        >
                                            <Card
                                                sx={{
                                                    width: "100%",
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
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
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
                        <ListItemText>別日にコピー</ListItemText>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => contextMenu?.transaction && handleContextMenuAction('copyToToday', contextMenu!.transaction)}
                        disabled={contextMenu?.transaction?.date === today}
                    >
                        <ListItemIcon>
                            <RestoreIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>今日にコピー</ListItemText>
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
                    <DialogTitle>コピー先の日付を選択</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="コピー先の日付"
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
                                    コピー対象の取引
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
                            コピー
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
                    <DialogTitle>削除確認</DialogTitle>
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

                {/* 操作中のローディング */}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
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