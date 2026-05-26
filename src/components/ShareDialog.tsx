import React, { useEffect, useMemo, useState } from 'react';
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
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import { format, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import type { SplitGroup, SplitPreview, Transaction } from '../types';
import { splitGroupApi } from '../api/splitGroupApi';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';
import apiClient from '../utils/axios';

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    splitGroups: SplitGroup[];
}

const formatAmount = (amount: number): string =>
    amount.toLocaleString('ja-JP') + ' 円';

const buildShareText = (
    preview: SplitPreview,
    showIncome: boolean,
    showExpense: boolean,
    showBalance: boolean
): string => {
    const [year, monthStr] = preview.month.split('-');
    const monthLabel = `${year}年${parseInt(monthStr)}月`;
    const lines: string[] = [
        `${monthLabel}の家計まとめ【${preview.group_label}】`,
        '─────────────────────',
    ];

    if (showIncome) {
        if (preview.income) {
            const incOffset = preview.income.other_offset;
            lines.push(`収入：${formatAmount(preview.income.total)}`);
            lines.push(`  自分：${formatAmount(preview.income.self)}（${preview.income.self_ratio}%）`);
            lines.push(`  ${preview.group_label}：${formatAmount(preview.income.other)}（${preview.income.other_ratio}%）`);
            if (incOffset) lines.push(`    調整：${incOffset > 0 ? '+' : ''}${incOffset.toLocaleString('ja-JP')} 円`);
        } else {
            lines.push(`収入：${formatAmount(0)}`);
        }
        lines.push('');
    }

    if (showExpense) {
        if (preview.expense) {
            const expOffset = preview.expense.other_offset;
            lines.push(`支出：${formatAmount(preview.expense.total)}`);
            lines.push(`  自分：${formatAmount(preview.expense.self)}（${preview.expense.self_ratio}%）`);
            lines.push(`  ${preview.group_label}：${formatAmount(preview.expense.other)}（${preview.expense.other_ratio}%）`);
            if (expOffset) lines.push(`    調整：${expOffset > 0 ? '+' : ''}${expOffset.toLocaleString('ja-JP')} 円`);
        } else {
            lines.push(`支出：${formatAmount(0)}`);
        }
        lines.push('');
    }

    if (showBalance) {
        if (preview.balance) {
            lines.push(`残高：${formatAmount(preview.balance.total)}`);
            lines.push(`  自分：${formatAmount(preview.balance.self)}`);
            lines.push(`  ${preview.group_label}：${formatAmount(preview.balance.other)}`);
        } else {
            lines.push(`残高：${formatAmount(0)}`);
        }
        lines.push('');
    }

    lines.push('─────────────────────');
    lines.push('#カケポン家計簿');

    return lines.join('\n');
};

const buildTotalsShareText = (
    income: number,
    expense: number,
    month: string,
    showIncome: boolean,
    showExpense: boolean,
    showBalance: boolean
): string => {
    const year = month.substring(0, 4);
    const monthLabel = `${year}年${parseInt(month.substring(4, 6))}月`;
    const lines: string[] = [
        `${monthLabel}の家計まとめ`,
        '─────────────────────',
    ];
    if (showIncome) {
        lines.push(`収入：${formatAmount(income)}`);
        lines.push('');
    }
    if (showExpense) {
        lines.push(`支出：${formatAmount(expense)}`);
        lines.push('');
    }
    if (showBalance) {
        lines.push(`残高：${formatAmount(income - expense)}`);
        lines.push('');
    }
    lines.push('─────────────────────');
    lines.push('#カケポン家計簿');
    return lines.join('\n');
};

// X (旧Twitter) ロゴ SVG
const XLogo = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#000000" />
        <path d="M22.5 19.5L30.5 9H28.5L21.6 18.3L16.1 9H9L17.5 21.7L9 32H11L18.4 22.1L24.3 32H31.4L22.5 19.5ZM19.3 20.9L18.5 19.7L11.7 10.3H15.1L20.1 17.9L20.9 19.1L28.5 29.7H25.1L19.3 20.9Z" fill="white" />
    </svg>
);

// LINE 公式ロゴ SVG
const LineLogo = ({ size = 40 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#06C755" />
        <path
            d="M33 18.9C33 13.4 27.6 9 21 9S9 13.4 9 18.9c0 4.95 4.39 9.1 10.32 9.89.4.09.95.27 1.09.62.12.32.08.82.04 1.14l-.18 1.08c-.05.32-.25 1.25 1.09.68 1.35-.57 7.28-4.28 9.93-7.33C32.06 22.8 33 21 33 18.9z"
            fill="white"
        />
        <path
            d="M17.5 16.5h-1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5zm6 0h-1a.5.5 0 0 0-.5.5v2.38l-1.83-2.68A.5.5 0 0 0 19.74 16.5h-1a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.38l1.83 2.68a.5.5 0 0 0 .42.2h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5zm-9 1h1.5v.75h-1.5v.75h1.5v.75h-1.5v.75h1.5a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-1.5v1zm13 0v-1h-1.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h1.5v-1h-1v-.75h1v-.75h-1v-.5h1z"
            fill="#06C755"
        />
    </svg>
);

// Web Share API が使えるかチェック
const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

export const ShareDialog = ({ open, onClose, splitGroups }: ShareDialogProps) => {
    const { currentMonth, showSnackBar } = useAppContext();
    const { loginUser } = useAuthContext();

    const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(
        format(currentMonth, 'yyyyMM')
    );
    const [copied, setCopied] = useState(false);

    const [showIncome, setShowIncome] = useState(true);
    const [showExpense, setShowExpense] = useState(true);
    const [showBalance, setShowBalance] = useState(true);
    const [xConsent, setXConsent] = useState(false);

    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(new Date(), i);
        return { label: format(d, 'yyyy年M月'), value: format(d, 'yyyyMM') };
    });

    useEffect(() => {
        if (!open) return;
        setCopied(false);
        setXConsent(false);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    // グループなし：選択月のトランザクション合計を取得
    const { data: noGroupTransactions, isFetching: isLoadingNoGroup } = useQuery<Transaction[]>({
        queryKey: ['shareDialogTransactions', selectedMonth],
        queryFn: async () => {
            const response = await apiClient.get('/monthly-transaction', {
                params: { currentMonth: selectedMonth, user_id: loginUser?.id },
            });
            return response.data.monthlyTransactionData || [];
        },
        enabled: !selectedGroupId && !!selectedMonth && !!loginUser,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
    });

    const noGroupTotals = useMemo(() => {
        const transactions = noGroupTransactions ?? [];
        const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { income, expense };
    }, [noGroupTransactions]);

    // グループあり：分担プレビューを取得
    const { data: preview, isFetching: isLoadingPreview } = useQuery<SplitPreview>({
        queryKey: ['splitGroupPreview', selectedGroupId, selectedMonth],
        queryFn: async () => {
            const { data } = await splitGroupApi.getPreview(
                selectedGroupId as number,
                selectedMonth
            );
            return data as SplitPreview;
        },
        enabled: !!selectedGroupId && !!selectedMonth,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
    });

    const isLoading = selectedGroupId ? isLoadingPreview : isLoadingNoGroup;

    const shareText = useMemo(() => {
        if (!(showIncome || showExpense || showBalance)) return '';
        if (!selectedGroupId) {
            return buildTotalsShareText(
                noGroupTotals.income,
                noGroupTotals.expense,
                selectedMonth,
                showIncome,
                showExpense,
                showBalance
            );
        }
        return preview ? buildShareText(preview, showIncome, showExpense, showBalance) : '';
    }, [selectedGroupId, preview, noGroupTotals, selectedMonth, showIncome, showExpense, showBalance]);

    const handleCopy = async () => {
        if (!shareText) return;
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        showSnackBar({ title: 'コピーしました', bodyText: 'クリップボードにコピーしました' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLineShare = () => {
        if (!shareText) return;
        const pageUrl = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(shareText);
        window.open(
            `https://social-plugins.line.me/lineit/share?url=${pageUrl}&text=${text}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleXShare = () => {
        if (!shareText || !xConsent) return;
        const text = encodeURIComponent(shareText);
        window.open(
            `https://x.com/intent/tweet?text=${text}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleNativeShare = async () => {
        if (!shareText) return;
        try {
            await navigator.share({ text: shareText });
        } catch {
            // キャンセルまたは非対応
        }
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
                            <MenuItem value="">グループなし（合計のみ）</MenuItem>
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
                                    />
                                }
                                label="収入"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showExpense}
                                        onChange={(e) => setShowExpense(e.target.checked)}
                                    />
                                }
                                label="支出"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showBalance}
                                        onChange={(e) => setShowBalance(e.target.checked)}
                                    />
                                }
                                label="残高"
                            />
                        </FormGroup>
                    </Box>

                    <Divider />

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : shareText ? (
                        <>
                            {/* テキストプレビュー（コピーアイコン付き） */}
                            <Box sx={{ position: 'relative' }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        pr: 5,
                                        backgroundColor: 'grey.50',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {shareText}
                                </Paper>
                                <Tooltip title={copied ? 'コピーしました！' : 'コピー'}>
                                    <IconButton
                                        size="small"
                                        onClick={handleCopy}
                                        sx={{
                                            position: 'absolute',
                                            top: 6,
                                            right: 6,
                                            color: copied ? 'success.main' : 'action.active',
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* SNS シェアアイコン行 */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                    シェア
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                                    <Tooltip title="LINEで送る">
                                        <IconButton
                                            onClick={handleLineShare}
                                            sx={{ p: 0, borderRadius: '10px' }}
                                        >
                                            <LineLogo size={44} />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={xConsent ? 'Xに投稿する' : '下のチェックボックスに同意してください'}>
                                        <span>
                                            <IconButton
                                                onClick={handleXShare}
                                                disabled={!xConsent}
                                                sx={{ p: 0, borderRadius: '10px', opacity: xConsent ? 1 : 0.4 }}
                                            >
                                                <XLogo size={44} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>

                                    {canNativeShare && (
                                        <Tooltip title="その他のアプリで共有">
                                            <IconButton
                                                onClick={handleNativeShare}
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: '10px',
                                                    backgroundColor: 'grey.200',
                                                    color: 'text.primary',
                                                    '&:hover': { backgroundColor: 'grey.300' },
                                                }}
                                            >
                                                <IosShareIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                                <FormControlLabel
                                    sx={{ mt: 1 }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={xConsent}
                                            onChange={(e) => setXConsent(e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Typography variant="caption" color="text.secondary">
                                            X への投稿が不特定多数に公開されることに同意する
                                        </Typography>
                                    }
                                />
                            </Box>
                        </>
                    ) : (
                        <Typography color="text.secondary" variant="body2">
                            共有する項目を選択してください。
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>閉じる</Button>
            </DialogActions>
        </Dialog>
    );
};
