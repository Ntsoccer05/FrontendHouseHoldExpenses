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
    InputAdornment,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SplitGroup, SplitGroupCategoryOverride } from '../types';
import { useAppContext } from '../context/AppContext';
import DynamicIcon from './common/DynamicIcon';

const OFFSET_MAX = 9_999_999;

const schema = z.object({
    label: z.string().min(1, 'グループ名を入力してください').max(100),
    income_other_ratio: z.number().int().min(0).max(100).nullable(),
    income_other_offset: z.number().int().min(-OFFSET_MAX, { message: '調整額が大きすぎます' }).max(OFFSET_MAX, { message: '調整額が大きすぎます' }).nullable(),
    expense_other_ratio: z.number().int().min(0).max(100).nullable(),
    expense_other_offset: z.number().int().min(-OFFSET_MAX, { message: '調整額が大きすぎます' }).max(OFFSET_MAX, { message: '調整額が大きすぎます' }).nullable(),
});

type FormInputs = z.infer<typeof schema>;

interface OffsetInputProps {
    value: number | null;
    onChange: (v: number | null) => void;
    label: string;
}

const OffsetInput = ({ value, onChange, label }: OffsetInputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [display, setDisplay] = useState('');

    useEffect(() => {
        if (!isFocused) {
            setDisplay(value === null ? '' : value.toLocaleString('ja-JP'));
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        setDisplay(value === null ? '' : String(value));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/[,，]/g, '');
        setDisplay(input);
        if (input === '' || input === '-') {
            onChange(null);
        } else {
            const n = parseInt(input, 10);
            if (!isNaN(n)) onChange(n);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (value === null) { setDisplay(''); return; }
        const clamped = Math.min(OFFSET_MAX, Math.max(-OFFSET_MAX, value));
        onChange(clamped);
        setDisplay(clamped.toLocaleString('ja-JP'));
    };

    return (
        <TextField
            label={label}
            type="text"
            inputMode="numeric"
            size="small"
            fullWidth
            placeholder="-3,000"
            InputProps={{
                endAdornment: <InputAdornment position="end"> 円</InputAdornment>,
            }}
            value={display}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
        />
    );
};

interface SplitGroupFormProps {
    open: boolean;
    editTarget: SplitGroup | null;
    onClose: () => void;
    onSubmit: (
        label: string,
        settings: {
            income_other_ratio: number | null;
            income_other_offset: number | null;
            expense_other_ratio: number | null;
            expense_other_offset: number | null;
        },
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
    const [incomeIsUnset, setIncomeIsUnset] = useState(true);
    const [expenseIsUnset, setExpenseIsUnset] = useState(true);

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
            income_other_offset: null,
            expense_other_ratio: null,
            expense_other_offset: null,
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
                    income_other_offset: editTarget.setting?.income_other_offset ?? null,
                    expense_other_ratio: editTarget.setting?.expense_other_ratio ?? null,
                    expense_other_offset: editTarget.setting?.expense_other_offset ?? null,
                });
                setIncomeIsUnset(editTarget.setting?.income_other_ratio == null);
                setExpenseIsUnset(editTarget.setting?.expense_other_ratio == null);
                setOverrides(editTarget.category_overrides ?? []);
            } else {
                reset({ label: '', income_other_ratio: null, income_other_offset: null, expense_other_ratio: null, expense_other_offset: null });
                setIncomeIsUnset(true);
                setExpenseIsUnset(true);
                setOverrides([]);
            }
        }
    }, [open, editTarget]); // eslint-disable-line react-hooks/exhaustive-deps

    const labelValue = watch('label');
    const groupLabel = labelValue || 'グループ';
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
                    income_other_ratio: incomeIsUnset ? null : values.income_other_ratio,
                    income_other_offset: incomeIsUnset ? null : values.income_other_offset,
                    expense_other_ratio: expenseIsUnset ? null : values.expense_other_ratio,
                    expense_other_offset: expenseIsUnset ? null : values.expense_other_offset,
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
            <DialogTitle sx={{ pr: 6 }}>
                {editTarget ? '分担グループを編集' : '分担グループを追加'}
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
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
                            収入の割合（{groupLabel}）
                        </Typography>
                        <Stack direction="column" spacing={1} alignItems="flex-start">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={incomeIsUnset}
                                        onChange={(e) => {
                                            setIncomeIsUnset(e.target.checked);
                                            if (!e.target.checked && incomeRatio === null) {
                                                setValue('income_other_ratio', 50);
                                            }
                                        }}
                                    />
                                }
                                label="未設定"
                            />
                            {!incomeIsUnset && (
                                <>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' }}>
                                        <Controller
                                            name="income_other_ratio"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`${groupLabel}の割合`}
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    fullWidth
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
                                        <Controller
                                            name="income_other_offset"
                                            control={control}
                                            render={({ field }) => (
                                                <OffsetInput
                                                    label="調整額"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            調整額：-で差し引き / +で上乗せ
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            自分：{100 - (incomeRatio ?? 0)}% / {groupLabel}：{incomeRatio ?? 0}%
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>
                    </Box>

                    {/* 支出割合 */}
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            支出の割合（{groupLabel}）
                        </Typography>
                        <Stack direction="column" spacing={1} alignItems="flex-start">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={expenseIsUnset}
                                        onChange={(e) => {
                                            setExpenseIsUnset(e.target.checked);
                                            if (!e.target.checked && expenseRatio === null) {
                                                setValue('expense_other_ratio', 50);
                                            }
                                        }}
                                    />
                                }
                                label="未設定"
                            />
                            {!expenseIsUnset && (
                                <>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' }}>
                                        <Controller
                                            name="expense_other_ratio"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label={`${groupLabel}の割合`}
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    fullWidth
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
                                        <Controller
                                            name="expense_other_offset"
                                            control={control}
                                            render={({ field }) => (
                                                <OffsetInput
                                                    label="調整額"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </Box>
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            調整額：-で差し引き / +で上乗せ
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            自分：{100 - (expenseRatio ?? 0)}% / {groupLabel}：{expenseRatio ?? 0}%
                                        </Typography>
                                    </Box>
                                </>
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
                                                <Typography sx={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                                                    <DynamicIcon iconName={cat.icon} fontSize="small" />
                                                    {cat.label}
                                                </Typography>
                                                <TextField
                                                    label={`${groupLabel}の割合`}
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    sx={{ flex: 1 }}
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
                                                <Typography sx={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}>
                                                    <DynamicIcon iconName={cat.icon} fontSize="small" />
                                                    {cat.label}
                                                </Typography>
                                                <TextField
                                                    label={`${groupLabel}の割合`}
                                                    type="number"
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                    sx={{ flex: 1 }}
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
