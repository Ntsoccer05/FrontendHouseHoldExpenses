import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { FixedExpenseList } from "../components/FixedExpenseList";
import { FixedExpenseForm } from "../components/FixedExpenseForm";
import { useFixedExpenseContext } from "../context/FixedExpenseContext";
import type { FixedExpense as FixedExpenseType, FixedExpenseFormData } from "../types";

const FixedExpense = () => {
    const { fixedExpenses, addFixedExpense, editFixedExpense, removeFixedExpense } =
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
            await editFixedExpense(editTarget.id, data);
        } else {
            await addFixedExpense(data);
        }
    };

    return (
        <Box p={2}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h5">固定費管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAdd}
                >
                    追加
                </Button>
            </Box>
            <FixedExpenseList
                fixedExpenses={fixedExpenses}
                onEdit={handleEdit}
                onDelete={removeFixedExpense}
            />
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
