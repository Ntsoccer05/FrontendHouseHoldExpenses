import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { SplitGroup } from '../types';

interface SplitGroupListProps {
    splitGroups: SplitGroup[];
    onEdit: (group: SplitGroup) => void;
    onDelete: (id: number) => Promise<void>;
}

const ratioLabel = (ratio: number | null | undefined, offset: number | null | undefined): string => {
    if (ratio == null) return '未設定';
    const base = `${ratio}%`;
    if (!offset) return base;
    const sign = offset > 0 ? '+' : '';
    return `${base} (${sign}${offset.toLocaleString('ja-JP')} 円)`;
};

export const SplitGroupList = ({
    splitGroups,
    onEdit,
    onDelete,
}: SplitGroupListProps) => {
    const [confirmTarget, setConfirmTarget] = useState<SplitGroup | null>(null);

    const handleDeleteClick = (group: SplitGroup) => {
        setConfirmTarget(group);
    };

    const handleConfirm = async () => {
        if (!confirmTarget) return;
        await onDelete(confirmTarget.id);
        setConfirmTarget(null);
    };

    const handleCancel = () => {
        setConfirmTarget(null);
    };

    if (splitGroups.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                分担グループがありません。「追加」ボタンから作成してください。
            </Typography>
        );
    }

    return (
        <>
            {/* SP: カード表示 */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, mt: 2 }}>
                {splitGroups.map((group) => (
                    <Paper key={group.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography fontWeight="bold" fontSize="0.95rem">
                                {group.label}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <IconButton size="small" onClick={() => onEdit(group)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(group)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Divider sx={{ my: 1 }} />
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">収入</Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                    {ratioLabel(group.setting?.income_other_ratio, group.setting?.income_other_offset)}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">支出</Typography>
                                <Typography variant="body2" fontSize="0.8rem">
                                    {ratioLabel(group.setting?.expense_other_ratio, group.setting?.expense_other_offset)}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                ))}
            </Box>

            {/* PC: テーブル表示 */}
            <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>グループ名</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>収入</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>支出</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {splitGroups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell>{group.label}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {ratioLabel(group.setting?.income_other_ratio, group.setting?.income_other_offset)}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {ratioLabel(group.setting?.expense_other_ratio, group.setting?.expense_other_offset)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                    <IconButton size="small" onClick={() => onEdit(group)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteClick(group)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!confirmTarget} onClose={handleCancel}>
                <DialogTitle>分担グループの削除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        「{confirmTarget?.label}」を削除しますか？この操作は元に戻せません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel}>キャンセル</Button>
                    <Button onClick={handleConfirm} color="error" variant="contained">
                        削除
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
