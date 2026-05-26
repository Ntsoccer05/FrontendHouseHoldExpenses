import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { SplitGroup, SplitGroupSetting, SplitPreview } from '../types';
import { splitGroupApi } from '../api/splitGroupApi';
import { useAppContext } from '../context/AppContext';

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    splitGroups: SplitGroup[];
}

const STORAGE_KEY = 'shareDialogPrefs';

type SharePrefs = {
    selectedGroupId?: number | '';
    selectedMonth?: string;
    showIncome?: boolean;
    showExpense?: boolean;
    showBalance?: boolean;
    showRatio?: boolean;
};

const loadPrefs = (): SharePrefs => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
};

const savePrefs = (prefs: SharePrefs) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
};

const formatAmount = (amount: number): string =>
    amount.toLocaleString('ja-JP') + ' 円';

const buildRatioNote = (ratio: number, offset?: number | null): string => {
    let note = `（${ratio}%`;
    if (offset != null && offset !== 0) {
        const sign = offset > 0 ? '+' : '';
        note += ` ${sign}${offset.toLocaleString('ja-JP')}円`;
    }
    note += '）';
    return note;
};

const buildShareText = (
    preview: SplitPreview,
    showIncome: boolean,
    showExpense: boolean,
    showBalance: boolean,
    showRatio: boolean,
    setting: SplitGroupSetting | null | undefined
): string => {
    const [year, monthStr] = preview.month.split('-');
    const monthLabel = `${year}年${parseInt(monthStr)}月`;
    const lines: string[] = [
        `${monthLabel}の家計まとめ【${preview.group_label}】`,
        '───────────',
    ];

    if (showIncome) {
        if (preview.income) {
            lines.push(`収入：${formatAmount(preview.income.total)}`);
            if (showRatio && setting?.income_other_ratio != null) {
                const otherRatio = setting.income_other_ratio;
                const selfRatio  = 100 - otherRatio;
                lines.push(`  自分：${formatAmount(preview.income.self)}${buildRatioNote(selfRatio)}`);
                lines.push(`  ${preview.group_label}：${formatAmount(preview.income.other)}${buildRatioNote(otherRatio, setting.income_other_offset)}`);
            } else {
                lines.push(`  自分：${formatAmount(preview.income.self)}`);
                lines.push(`  ${preview.group_label}：${formatAmount(preview.income.other)}`);
            }
        } else {
            lines.push(`収入：${formatAmount(0)}`);
        }
        lines.push('');
    }

    if (showExpense) {
        if (preview.expense) {
            lines.push(`支出：${formatAmount(preview.expense.total)}`);
            if (showRatio && setting?.expense_other_ratio != null) {
                const otherRatio = setting.expense_other_ratio;
                const selfRatio  = 100 - otherRatio;
                lines.push(`  自分：${formatAmount(preview.expense.self)}${buildRatioNote(selfRatio)}`);
                lines.push(`  ${preview.group_label}：${formatAmount(preview.expense.other)}${buildRatioNote(otherRatio, setting.expense_other_offset)}`);
            } else {
                lines.push(`  自分：${formatAmount(preview.expense.self)}`);
                lines.push(`  ${preview.group_label}：${formatAmount(preview.expense.other)}`);
            }
        } else {
            lines.push(`支出：${formatAmount(0)}`);
        }
        lines.push('');
    }

    if (showBalance) {
        if (preview.balance) {
            lines.push(`残高：${formatAmount(preview.balance.total)}`);
            if (preview.balance.self !== undefined) {
                lines.push(`  自分：${formatAmount(preview.balance.self)}`);
                lines.push(`  ${preview.group_label}：${formatAmount(preview.balance.other!)}`);
            }
        } else {
            lines.push(`残高：${formatAmount(0)}`);
        }
        lines.push('');
    }

    lines.push('───────────');
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
        '───────────',
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
    lines.push('───────────');
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

    const savedPrefs = useMemo(loadPrefs, []);
    const groupInitDoneRef = useRef(false);

    const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(
        savedPrefs.selectedMonth ?? format(currentMonth, 'yyyyMM')
    );
    const [copied, setCopied] = useState(false);

    const [showIncome, setShowIncome] = useState(savedPrefs.showIncome ?? true);
    const [showExpense, setShowExpense] = useState(savedPrefs.showExpense ?? true);
    const [showBalance, setShowBalance] = useState(savedPrefs.showBalance ?? true);
    const [showRatio, setShowRatio] = useState(savedPrefs.showRatio ?? false);
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

    // グループが読み込まれたら savedPref または先頭グループを初期選択
    useEffect(() => {
        if (groupInitDoneRef.current || splitGroups.length === 0) return;
        groupInitDoneRef.current = true;

        const savedId = savedPrefs.selectedGroupId;
        if (savedId === '') {
            setSelectedGroupId('');
        } else if (typeof savedId === 'number' && splitGroups.some(g => g.id === savedId)) {
            setSelectedGroupId(savedId);
        } else {
            setSelectedGroupId(splitGroups[0].id);
        }
    }, [splitGroups]); // eslint-disable-line react-hooks/exhaustive-deps

    // selectedGroupId を永続化（グループ初期化後のみ）
    useEffect(() => {
        if (!groupInitDoneRef.current) return;
        savePrefs({ ...loadPrefs(), selectedGroupId });
    }, [selectedGroupId]);

    // その他の設定を永続化
    useEffect(() => {
        savePrefs({ ...loadPrefs(), selectedMonth, showIncome, showExpense, showBalance, showRatio });
    }, [selectedMonth, showIncome, showExpense, showBalance, showRatio]);

    // グループなし：選択月の収支サマリーを取得
    const { data: monthlySummary, isFetching: isLoadingNoGroup } = useQuery<{ income: number; expense: number; balance: number }>({
        queryKey: ['shareDialogMonthlySummary', selectedMonth],
        queryFn: async () => {
            const { data } = await splitGroupApi.getMonthlySummary(selectedMonth);
            return data;
        },
        enabled: open && !selectedGroupId && !!selectedMonth,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
    });

    const noGroupTotals = useMemo(() => ({
        income:  monthlySummary?.income  ?? 0,
        expense: monthlySummary?.expense ?? 0,
    }), [monthlySummary]);

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
        enabled: open && !!selectedGroupId && !!selectedMonth,
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
        const setting = splitGroups.find(g => g.id === selectedGroupId)?.setting;
        return preview ? buildShareText(preview, showIncome, showExpense, showBalance, showRatio, setting) : '';
    }, [selectedGroupId, preview, noGroupTotals, selectedMonth, showIncome, showExpense, showBalance, showRatio, splitGroups]);

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
                            <Tooltip title={!selectedGroupId ? 'グループ選択時のみ有効' : ''}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={showRatio}
                                            onChange={(e) => setShowRatio(e.target.checked)}
                                            disabled={!selectedGroupId}
                                        />
                                    }
                                    label="割合"
                                />
                            </Tooltip>
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
                                        backgroundColor: 'grey.50',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        overflow: 'hidden',
                                        wordBreak: 'keep-all',
                                        overflowWrap: 'break-word',
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
                <Button
                    variant="contained"
                    onClick={canNativeShare ? handleNativeShare : handleCopy}
                    disabled={!shareText}
                    startIcon={<IosShareIcon />}
                >
                    シェア
                </Button>
            </DialogActions>
        </Dialog>
    );
};
