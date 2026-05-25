import React, { useState } from "react";
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { FixedExpense } from "../types";

interface FixedExpenseListProps {
    fixedExpenses: FixedExpense[];
    onEdit: (fixedExpense: FixedExpense) => void;
    onDelete: (id: number) => Promise<void>;
}

export const FixedExpenseList = ({
    fixedExpenses,
    onEdit,
    onDelete,
}: FixedExpenseListProps) => {
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    if (fixedExpenses.length === 0) {
        return (
            <Typography color="text.secondary">
                固定費・収益が登録されていません
            </Typography>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>種別</TableCell>
                            <TableCell>内容</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>実行日</TableCell>
                            <TableCell>状態</TableCell>
                            <TableCell align="center">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fixedExpenses.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Chip
                                        label={item.type_id === 1 ? "収入" : "支出"}
                                        color={item.type_id === 1 ? "primary" : "error"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{item.content}</TableCell>
                                <TableCell align="right">
                                    ¥{item.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>毎月{item.fixed_expense_day}日</TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.is_active ? "有効" : "無効"}
                                        color={item.is_active ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
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

            <Dialog open={deleteTarget !== null} onClose={() => !isDeleting && setDeleteTarget(null)}>
                <DialogTitle>削除しますか？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        この固定費・収益を削除します。過去に登録済みのデータには影響しません。
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
        </>
    );
};
