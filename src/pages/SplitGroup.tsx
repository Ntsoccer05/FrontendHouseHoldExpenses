import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { SplitGroupList } from '../components/SplitGroupList';
import { SplitGroupForm } from '../components/SplitGroupForm';
import { useSplitGroupContext } from '../context/SplitGroupContext';
import type { SplitGroup as SplitGroupType, SplitGroupCategoryOverride } from '../types';

const SplitGroup = () => {
    const {
        splitGroups,
        isLoading,
        addSplitGroup,
        editSplitGroup,
        saveSplitGroupSettings,
        saveCategoryOverrides,
        removeSplitGroup,
    } = useSplitGroupContext();

    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<SplitGroupType | null>(null);

    const handleOpenAdd = () => {
        setEditTarget(null);
        setFormOpen(true);
    };

    const handleEdit = (group: SplitGroupType) => {
        setEditTarget(group);
        setFormOpen(true);
    };

    const handleSubmit = async (
        label: string,
        settings: { income_other_ratio: number | null; expense_other_ratio: number | null },
        overrides: SplitGroupCategoryOverride[]
    ) => {
        if (editTarget) {
            if (label !== editTarget.label) {
                await editSplitGroup(editTarget.id, { label });
            }
            await saveSplitGroupSettings(editTarget.id, settings);
            await saveCategoryOverrides(editTarget.id, overrides);
        } else {
            await addSplitGroup({ label });
            const { splitGroupApi } = await import('../api/splitGroupApi');
            const { data } = await splitGroupApi.getAll();
            const newGroup = data.splitGroups[data.splitGroups.length - 1];
            if (newGroup) {
                await saveSplitGroupSettings(newGroup.id, settings);
                await saveCategoryOverrides(newGroup.id, overrides);
            }
        }
    };

    const handleToggleActive = async (id: number, isActive: boolean) => {
        await editSplitGroup(id, { is_active: isActive });
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h5">分担管理</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    追加
                </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                パートナー・ルームメイトなど、月の収支を分担して把握・共有できます。
            </Typography>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <SplitGroupList
                    splitGroups={splitGroups}
                    onEdit={handleEdit}
                    onDelete={removeSplitGroup}
                    onToggleActive={handleToggleActive}
                />
            )}

            <SplitGroupForm
                open={formOpen}
                editTarget={editTarget}
                onClose={() => setFormOpen(false)}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default SplitGroup;
