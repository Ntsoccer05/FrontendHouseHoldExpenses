import React, { useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FixedExpense, FixedExpenseFormData } from "../types";
import { useAppContext } from "../context/AppContext";

const fixedExpenseSchema = z.object({
    category_id: z
        .number({ invalid_type_error: "カテゴリを選択してください" })
        .int()
        .positive("カテゴリを選択してください"),
    amount: z
        .number({ invalid_type_error: "金額を入力してください" })
        .int()
        .min(1, "金額を入力してください"),
    content: z.string().min(1, "内容を入力してください").max(255),
    fixed_expense_day: z.number().int().min(1).max(31),
});

type FixedExpenseFormInputs = z.infer<typeof fixedExpenseSchema>;

interface FixedExpenseFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FixedExpenseFormData) => Promise<void>;
    editTarget?: FixedExpense | null;
}

export const FixedExpenseForm = ({
    open,
    onClose,
    onSubmit,
    editTarget,
}: FixedExpenseFormProps) => {
    const { ExpenseCategories } = useAppContext();
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FixedExpenseFormInputs>({
        resolver: zodResolver(fixedExpenseSchema),
        defaultValues: { category_id: 0, amount: 0, content: "", fixed_expense_day: 1 },
    });

    const fixedExpenseDay = watch("fixed_expense_day");
    const showWarning = fixedExpenseDay >= 29;

    useEffect(() => {
        if (editTarget) {
            reset({
                category_id: editTarget.category_id,
                amount: editTarget.amount,
                content: editTarget.content,
                fixed_expense_day: editTarget.fixed_expense_day,
            });
        } else {
            reset({ category_id: 0, amount: 0, content: "", fixed_expense_day: 1 });
        }
    }, [editTarget, reset]);

    const handleFormSubmit = async (data: FixedExpenseFormInputs) => {
        await onSubmit(data);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editTarget ? "固定費を編集" : "固定費を追加"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                            <FormControl error={!!errors.category_id}>
                                <InputLabel>カテゴリ</InputLabel>
                                <Select {...field} label="カテゴリ">
                                    {(ExpenseCategories ?? []).map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id ?? 0}>
                                            {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.category_id && (
                                    <Typography color="error" variant="caption">
                                        {errors.category_id.message}
                                    </Typography>
                                )}
                            </FormControl>
                        )}
                    />
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="金額"
                                type="number"
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        )}
                    />
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="内容"
                                error={!!errors.content}
                                helperText={errors.content?.message}
                            />
                        )}
                    />
                    <Controller
                        name="fixed_expense_day"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="毎月の実行日（日付）"
                                type="number"
                                inputProps={{ min: 1, max: 31 }}
                                error={!!errors.fixed_expense_day}
                                helperText={errors.fixed_expense_day?.message ?? "1〜31日から選択"}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        )}
                    />
                    {showWarning && (
                        <Alert severity="warning">
                            29日以上を指定した場合、その日が存在しない月は当月の最終日に自動調整されます。
                            例）2月に29日指定 → 平年は2/28、閏年は2/29
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <Button onClick={handleSubmit(handleFormSubmit)} variant="contained">
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
};
