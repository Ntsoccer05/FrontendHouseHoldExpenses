import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SplitGroup, SplitGroupCategoryOverride } from '../types';
import { useAppContext } from '../context/AppContext';

const schema = z.object({
    label: z.string().min(1, 'グループ名を入力してください').max(100),
    income_other_ratio: z.number().int().min(0).max(100).nullable(),
    expense_other_ratio: z.number().int().min(0).max(100).nullable(),
});

type FormInputs = z.infer<typeof schema>;

interface SplitGroupFormProps {
    open: boolean;
    editTarget: SplitGroup | null;
    onClose: () => void;
    onSubmit: (
        label: string,
        settings: { income_other_ratio: number | null; expense_other_ratio: number | null },
        overrides: SplitGroupCategoryOverride[]
    ) => Promise<void>;
}

export const SplitGroupForm = ({
    open,
    editTarget,
    onClose,
    onSubmit,
}: SplitGroupFormProps) => {
    const { IncomeCategories, ExpenseCategories, getIncomeCategory, getExpenseCategory } =
        useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [overrides, setOverrides] = useState<SplitGroupCategoryOverride[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormInputs>({
        resolver: zodResolver(schema),
        defaultValues: {
            label: '',
            income_other_ratio: null,
            expense_other_ratio: null,
        },
    });

    useEffect(() => {
        if (open) {
            getIncomeCategory();
            getExpenseCategory();
            if (editTarget) {
                reset({
                    label: editTarget.label,
                    income_other_ratio: editTarget.setting?.income_other_ratio ?? null,
                    expense_other_ratio: editTarget.setting?.expense_other_ratio ?? null,
                });
                setOverrides(editTarget.category_overrides ?? []);
            } else {
                reset({ label: '', income_other_ratio: null, expense_other_ratio: null });
                setOverrides([]);
            }
        }
    }, [open, editTarget]); // eslint-disable-line react-hooks/exhaustive-deps

    const incomeRatio = watch('income_other_ratio');
    const expenseRatio = watch('expense_other_ratio');

    const getOverrideRatio = (categoryId: number, typeId: number): number | null => {
        const found = overrides.find(
            (o) => o.category_id === categoryId && o.type_id === typeId
        );
        return found ? found.other_ratio : null;
    };

    const setOverrideRatio = (categoryId: number, typeId: number, ratio: number | null) => {
        setOverrides((prev) => {
            const filtered = prev.filter(
                (o) => !(o.category_id === categoryId && o.type_id === typeId)
            );
            if (ratio === null) return filtered;
            return [...filtered, { category_id: categoryId, type_id: typeId, other_ratio: ratio }];
        });
    };

    const handleFormSubmit = async (values: FormInputs) => {
        setIsSubmitting(true);
        try {
            await onSubmit(
                values.label,
                {
                    income_other_ratio: values.income_other_ratio,
                    expense_other_ratio: values.expense_other_ratio,
                },
                overrides
            );
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {editTarget ? '分担グループを編集' : '分担グループを追加'}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Controller
                        name="label"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="グループ名"
                                placeholder="例：パートナー、ルームメイト"
                                error={!!errors.label}
                                helperText={errors.label?.message}
                                fullWidth
                            />
                        )}
                    />

                    {/* 収入割合 */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            収入の按分（グループ側の割合 %）
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={incomeRatio === null}
                                        onChange={(e) =>
                                            setValue(
                                                'income_other_ratio',
                                                e.target.checked ? null : 50
                                            )
                                        }
                                    />
                                }
                                label="未設定（共有テキストに表示しない）"
                            />
                            {incomeRatio !== null && (
                                <Controller
                                    name="income_other_ratio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="グループ側 %"
                                            type="number"
                                            inputProps={{ min: 0, max: 100 }}
                                            size="small"
                                            sx={{ width: 120 }}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            value={field.value ?? ''}
                                        />
                                    )}
                                />
                            )}
                            {incomeRatio !== null && (
                                <Typography variant="body2" color="text.secondary">
                                    自分：{100 - incomeRatio}% / グループ：{incomeRatio}%
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* 支出割合 */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            支出の按分（グループ側の割合 %）
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={expenseRatio === null}
                                        onChange={(e) =>
                                            setValue(
                                                'expense_other_ratio',
                                                e.target.checked ? null : 50
                                            )
                                        }
                                    />
                                }
                                label="未設定（共有テキストに表示しない）"
                            />
                            {expenseRatio !== null && (
                                <Controller
                                    name="expense_other_ratio"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="グループ側 %"
                                            type="number"
                                            inputProps={{ min: 0, max: 100 }}
                                            size="small"
                                            sx={{ width: 120 }}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? null
                                                        : Number(e.target.value)
                                                )
                                            }
                                            value={field.value ?? ''}
                                        />
                                    )}
                                />
                            )}
                            {expenseRatio !== null && (
                                <Typography variant="body2" color="text.secondary">
                                    自分：{100 - expenseRatio}% / グループ：{expenseRatio}%
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* カテゴリ別上書き設定 */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">
                                カテゴリ別詳細設定（任意）
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                カテゴリごとに基本設定と異なる割合を設定できます。
                                空欄は基本設定を使用します。
                            </Typography>
                            {IncomeCategories && IncomeCategories.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        収入カテゴリ
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                                        {IncomeCategories.map((cat) => (
                                            <Stack
                                                key={cat.id}
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                            >
                                                <Typography sx={{ minWidth: 120 }}>
                                                    {cat.icon} {cat.label}
                                                </Typography>
                                                <TextField
                                                    label="グループ側 %"
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    sx={{ width: 120 }}
                                                    placeholder="基本設定"
                                                    value={getOverrideRatio(cat.id!, 1) ?? ''}
                                                    onChange={(e) =>
                                                        setOverrideRatio(
                                                            cat.id!,
                                                            1,
                                                            e.target.value === ''
                                                                ? null
                                                                : Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            {ExpenseCategories && ExpenseCategories.length > 0 && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        支出カテゴリ
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                                        {ExpenseCategories.map((cat) => (
                                            <Stack
                                                key={cat.id}
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                            >
                                                <Typography sx={{ minWidth: 120 }}>
                                                    {cat.icon} {cat.label}
                                                </Typography>
                                                <TextField
                                                    label="グループ側 %"
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    sx={{ width: 120 }}
                                                    placeholder="基本設定"
                                                    value={getOverrideRatio(cat.id!, 2) ?? ''}
                                                    onChange={(e) =>
                                                        setOverrideRatio(
                                                            cat.id!,
                                                            2,
                                                            e.target.value === ''
                                                                ? null
                                                                : Number(e.target.value)
                                                        )
                                                    }
                                                />
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>キャンセル</Button>
                <LoadingButton
                    loading={isSubmitting}
                    variant="contained"
                    onClick={handleSubmit(handleFormSubmit)}
                >
                    {editTarget ? '更新' : '作成'}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
