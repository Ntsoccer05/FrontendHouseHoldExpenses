import React, { useEffect, useState } from "react";
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
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FixedExpense, FixedExpenseFormData } from "../types";
import { useAppContext } from "../context/AppContext";

const toHalfWidth = (value: string) =>
    value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

const fixedExpenseSchema = z.object({
    type: z.enum(["income", "expense"]),
    category_id: z
        .number({ invalid_type_error: "カテゴリを選択してください" })
        .int()
        .positive("カテゴリを選択してください"),
    amount: z
        .number({ invalid_type_error: "金額を入力してください" })
        .int()
        .min(1, "金額を入力してください"),
    content: z.string().min(1, "内容を入力してください").max(255),
    fixed_expense_day: z
        .number({ invalid_type_error: "1〜31の数値を入力してください" })
        .int()
        .min(1, "1〜31の数値を入力してください")
        .max(31, "1〜31の数値を入力してください"),
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
    const { ExpenseCategories, IncomeCategories } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FixedExpenseFormInputs>({
        resolver: zodResolver(fixedExpenseSchema),
        defaultValues: { type: "expense", category_id: 0, amount: 0, content: "", fixed_expense_day: 1 },
    });

    const selectedType = watch("type");
    const fixedExpenseDay = watch("fixed_expense_day");
    const showWarning = fixedExpenseDay >= 29;
    const categories = selectedType === "income" ? IncomeCategories : ExpenseCategories;

    useEffect(() => {
        if (editTarget) {
            reset({
                type: editTarget.type_id === 1 ? "income" : "expense",
                category_id: editTarget.category_id,
                amount: editTarget.amount,
                content: editTarget.content,
                fixed_expense_day: editTarget.fixed_expense_day,
            });
        } else {
            reset({ type: "expense", category_id: 0, amount: 0, content: "", fixed_expense_day: 1 });
        }
    }, [editTarget, reset]);

    const handleFormSubmit = async (data: FixedExpenseFormInputs) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editTarget ? "固定費・収益を編集" : "固定費・収益を追加"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {/* 種別トグル */}
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <ToggleButtonGroup
                                value={field.value}
                                exclusive
                                onChange={(_, newType) => {
                                    if (newType) {
                                        field.onChange(newType);
                                        setValue("category_id", 0);
                                    }
                                }}
                                fullWidth
                                size="small"
                            >
                                <ToggleButton value="expense" color="error">
                                    支出
                                </ToggleButton>
                                <ToggleButton value="income" color="primary">
                                    収入
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    />
                    {/* カテゴリ */}
                    <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                            <FormControl error={!!errors.category_id}>
                                <InputLabel>カテゴリ</InputLabel>
                                <Select {...field} label="カテゴリ">
                                    {(categories ?? []).map((cat) => (
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
                    {/* 金額 */}
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="金額"
                                type="text"
                                inputMode="numeric"
                                value={field.value === 0 ? "" : field.value}
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                                onChange={(e) => {
                                    const half = toHalfWidth(e.target.value);
                                    const num = Number(half);
                                    field.onChange(isNaN(num) ? field.value : num);
                                }}
                            />
                        )}
                    />
                    {/* 内容 */}
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
                    {/* 実行日 */}
                    <Controller
                        name="fixed_expense_day"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="毎月の実行日（日付）"
                                type="text"
                                inputMode="numeric"
                                value={field.value === 0 ? "" : field.value}
                                error={!!errors.fixed_expense_day}
                                helperText={errors.fixed_expense_day?.message ?? "1〜31日から選択"}
                                onChange={(e) => {
                                    const half = toHalfWidth(e.target.value);
                                    const num = Number(half);
                                    field.onChange(isNaN(num) ? field.value : num);
                                }}
                                onBlur={() => {
                                    if (!field.value || field.value < 1) field.onChange(1);
                                    field.onBlur();
                                }}
                            />
                        )}
                    />
                    {showWarning && (
                        <Alert severity="warning">
                            存在しない日付の月は末日に自動調整されます
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>キャンセル</Button>
                <LoadingButton
                    onClick={handleSubmit(handleFormSubmit)}
                    variant="contained"
                    color={selectedType === "income" ? "primary" : "error"}
                    loading={isSubmitting}
                >
                    保存
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
