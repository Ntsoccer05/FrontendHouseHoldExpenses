import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format, subMonths } from 'date-fns';
import type { SplitGroup, SplitPreview } from '../types';
import { splitGroupApi } from '../api/splitGroupApi';
import { useAppContext } from '../context/AppContext';

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    splitGroups: SplitGroup[];
}

const formatAmount = (amount: number): string =>
    amount.toLocaleString('ja-JP') + '円';

const buildShareText = (
    preview: SplitPreview,
    showIncome: boolean,
    showExpense: boolean,
    showBalance: boolean
): string => {
    const [year, monthStr] = preview.month.split('-');
    const monthLabel = `${year}年${parseInt(monthStr)}月`;
    const lines: string[] = [
        `📊 ${monthLabel}の家計まとめ【${preview.group_label}】`,
        '─────────────────────',
    ];

    if (showIncome && preview.income) {
        lines.push(`収入：${formatAmount(preview.income.total)}`);
        lines.push(`  自分：${formatAmount(preview.income.self)}（${preview.income.self_ratio}%）`);
        lines.push(`  ${preview.group_label}：${formatAmount(preview.income.other)}（${preview.income.other_ratio}%）`);
        lines.push('');
    }

    if (showExpense && preview.expense) {
        lines.push(`支出：${formatAmount(preview.expense.total)}`);
        lines.push(`  自分：${formatAmount(preview.expense.self)}（${preview.expense.self_ratio}%）`);
        lines.push(`  ${preview.group_label}：${formatAmount(preview.expense.other)}（${preview.expense.other_ratio}%）`);
        lines.push('');
    }

    if (showBalance && preview.balance) {
        lines.push(`残高：${formatAmount(preview.balance.total)}`);
        lines.push(`  自分：${formatAmount(preview.balance.self)}`);
        lines.push(`  ${preview.group_label}：${formatAmount(preview.balance.other)}`);
        lines.push('');
    }

    lines.push('─────────────────────');
    lines.push('#カケポン家計簿');

    return lines.join('\n');
};

export const ShareDialog = ({ open, onClose, splitGroups }: ShareDialogProps) => {
    const { currentMonth, showSnackBar } = useAppContext();

    const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(
        format(currentMonth, 'yyyyMM')
    );
    const [preview, setPreview] = useState<SplitPreview | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const [showIncome, setShowIncome] = useState(true);
    const [showExpense, setShowExpense] = useState(true);
    const [showBalance, setShowBalance] = useState(true);

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(new Date(), i);
        return { label: format(d, 'yyyy年M月'), value: format(d, 'yyyyMM') };
    });

    useEffect(() => {
        if (!open) return;
        setSelectedGroupId(splitGroups[0]?.id ?? '');
        setSelectedMonth(format(currentMonth, 'yyyyMM'));
        setPreview(null);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!selectedGroupId || !selectedMonth) return;
        const fetchPreview = async () => {
            setIsLoadingPreview(true);
            try {
                const { data } = await splitGroupApi.getPreview(
                    selectedGroupId as number,
                    selectedMonth
                );
                setPreview(data);
            } catch {
                setPreview(null);
            } finally {
                setIsLoadingPreview(false);
            }
        };
        fetchPreview();
    }, [selectedGroupId, selectedMonth]);

    const shareText =
        preview && (showIncome || showExpense || showBalance)
            ? buildShareText(preview, showIncome, showExpense, showBalance)
            : '';

    const handleCopy = async () => {
        if (!shareText) return;
        await navigator.clipboard.writeText(shareText);
        showSnackBar({ title: 'コピーしました', bodyText: 'クリップボードにコピーしました' });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>家計を共有する</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>グループ</InputLabel>
                        <Select
                            value={selectedGroupId}
                            label="グループ"
                            onChange={(e) => setSelectedGroupId(e.target.value as number)}
                        >
                            {splitGroups.map((g) => (
                                <MenuItem key={g.id} value={g.id}>
                                    {g.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>対象月</InputLabel>
                        <Select
                            value={selectedMonth}
                            label="対象月"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {monthOptions.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            共有する項目
                        </Typography>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showIncome}
                                        onChange={(e) => setShowIncome(e.target.checked)}
                                        disabled={!preview?.income}
                                    />
                                }
                                label="収入"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showExpense}
                                        onChange={(e) => setShowExpense(e.target.checked)}
                                        disabled={!preview?.expense}
                                    />
                                }
                                label="支出"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showBalance}
                                        onChange={(e) => setShowBalance(e.target.checked)}
                                        disabled={!preview?.balance}
                                    />
                                }
                                label="残高"
                            />
                        </FormGroup>
                    </Box>

                    <Divider />

                    {isLoadingPreview ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : shareText ? (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                backgroundColor: 'grey.50',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                            }}
                        >
                            {shareText}
                        </Paper>
                    ) : (
                        <Typography color="text.secondary" variant="body2">
                            グループを選択してプレビューを表示します。
                            表示されない場合は、グループの割合設定を確認してください。
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>閉じる</Button>
                <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopy}
                    disabled={!shareText}
                >
                    コピーする
                </Button>
            </DialogActions>
        </Dialog>
    );
};
