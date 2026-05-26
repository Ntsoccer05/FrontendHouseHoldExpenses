import React from 'react';
import {
    Box,
    Chip,
    IconButton,
    Paper,
    Switch,
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
    onToggleActive: (id: number, isActive: boolean) => Promise<void>;
}

const ratioLabel = (ratio: number | null | undefined): string => {
    if (ratio == null) return '未設定';
    return `${100 - ratio}% / ${ratio}%`;
};

export const SplitGroupList = ({
    splitGroups,
    onEdit,
    onDelete,
    onToggleActive,
}: SplitGroupListProps) => {
    if (splitGroups.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                分担グループがありません。「追加」ボタンから作成してください。
            </Typography>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>グループ名</TableCell>
                        <TableCell>収入（自分/グループ）</TableCell>
                        <TableCell>支出（自分/グループ）</TableCell>
                        <TableCell>有効</TableCell>
                        <TableCell align="right">操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {splitGroups.map((group) => (
                        <TableRow key={group.id}>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {group.label}
                                    {group.category_overrides.length > 0 && (
                                        <Chip
                                            label={`カテゴリ設定 ${group.category_overrides.length}件`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                {ratioLabel(group.setting?.income_other_ratio)}
                            </TableCell>
                            <TableCell>
                                {ratioLabel(group.setting?.expense_other_ratio)}
                            </TableCell>
                            <TableCell>
                                <Switch
                                    checked={group.is_active}
                                    onChange={(e) => onToggleActive(group.id, e.target.checked)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => onEdit(group)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(group.id)}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
