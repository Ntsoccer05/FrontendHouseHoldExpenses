import React, { useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FixedExpenseList } from "../components/FixedExpenseList";
import { FixedExpenseForm } from "../components/FixedExpenseForm";
import { useFixedExpenseContext } from "../context/FixedExpenseContext";
import type { FixedExpense as FixedExpenseType, FixedExpenseFormData } from "../types";

const FixedExpense = () => {
    const { fixedExpenses, isLoading, addFixedExpense, editFixedExpense, removeFixedExpense, bulkRemoveFixedExpenses } =
        useFixedExpenseContext();
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<FixedExpenseType | null>(null);

    const handleOpenAdd = () => {
        setEditTarget(null);
        setFormOpen(true);
    };

    const handleEdit = (item: FixedExpenseType) => {
        setEditTarget(item);
        setFormOpen(true);
    };

    const handleSubmit = async (data: FixedExpenseFormData) => {
        if (editTarget) {
            const currentType = editTarget.type_id === 1 ? "income" : "expense";
            const hasChanged =
                data.type !== currentType ||
                data.category_id !== editTarget.category_id ||
                data.amount !== editTarget.amount ||
                data.content !== editTarget.content ||
                data.fixed_expense_day !== editTarget.fixed_expense_day;
            if (!hasChanged) return;
            await editFixedExpense(editTarget.id, data);
        } else {
            await addFixedExpense(data);
        }
    };

    const handleToggleActive = async (id: number, isActive: boolean) => {
        await editFixedExpense(id, { is_active: isActive });
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h5">固定収支管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                >
                    追加
                </Button>
            </Box>
            <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                有効な固定収支は毎月1日10:00に自動で家計簿に登録されます
            </Alert>
            {isLoading && fixedExpenses.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <FixedExpenseList
                    fixedExpenses={fixedExpenses}
                    onEdit={handleEdit}
                    onDelete={removeFixedExpense}
                    onToggleActive={handleToggleActive}
                    onBulkDelete={bulkRemoveFixedExpenses}
                />
            )}
            <FixedExpenseForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
                editTarget={editTarget}
            />
        </Box>
    );
};

export default FixedExpense;
