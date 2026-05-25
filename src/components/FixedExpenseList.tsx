import React, { useState } from "react";
import {
    Box,
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

    const handleDeleteConfirm = async () => {
        if (deleteTarget !== null) {
            await onDelete(deleteTarget);
            setDeleteTarget(null);
        }
    };

    if (fixedExpenses.length === 0) {
        return (
            <Typography color="text.secondary">
                固定費が登録されていません
            </Typography>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
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

            <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>固定費を削除しますか？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        削除後、新しい複製は生成されません。既に登録された支出は削除されません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>キャンセル</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        削除
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
