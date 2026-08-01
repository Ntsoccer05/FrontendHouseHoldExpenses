import React, { ReactNode, createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SplitGroup, SplitGroupCategoryOverride, SplitGroupFormData } from '../types';
import { splitGroupApi } from '../api/splitGroupApi';
import { useAuthContext } from './AuthContext';
import { useAppContext } from './AppContext';

interface SplitGroupSettings {
    income_other_ratio: number | null;
    income_other_offset: number | null;
    expense_other_ratio: number | null;
    expense_other_offset: number | null;
    overrides?: SplitGroupCategoryOverride[];
}

interface SplitGroupContextType {
    splitGroups: SplitGroup[];
    isLoading: boolean;
    fetchSplitGroups: () => Promise<void>;
    addSplitGroup: (data: SplitGroupFormData) => Promise<SplitGroup | undefined>;
    editSplitGroup: (id: number, data: Partial<SplitGroupFormData>) => Promise<void>;
    saveSplitGroupSettings: (id: number, data: SplitGroupSettings) => Promise<void>;
    removeSplitGroup: (id: number) => Promise<void>;
}

const SplitGroupContext = createContext<SplitGroupContextType | undefined>(undefined);

const splitGroupsQueryKey = (userId?: number) => ['splitGroups', userId] as const;

export const SplitGroupProvider = ({ children }: { children: ReactNode }) => {
    const { loginUser } = useAuthContext();
    const { showSnackBar } = useAppContext();
    const queryClient = useQueryClient();

    // react-queryの単一QueryClientにキャッシュされるため、Providerがページ遷移で
    // アンマウント・再マウントされても再取得は起きない（staleTime内は再フェッチ不要）
    const { data, isLoading, refetch } = useQuery({
        queryKey: splitGroupsQueryKey(loginUser?.id),
        queryFn: async () => {
            const { data } = await splitGroupApi.getAll();
            return data.splitGroups;
        },
        enabled: !!loginUser,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const splitGroups = data ?? [];

    const fetchSplitGroups = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: splitGroupsQueryKey(loginUser?.id) });
    }, [queryClient, loginUser?.id]);

    const addSplitGroup = useCallback(
        async (data: SplitGroupFormData) => {
            if (!loginUser) return undefined;
            try {
                const { data: responseData } = await splitGroupApi.create(data);
                showSnackBar({ title: '成功', bodyText: '分担グループを作成しました' });
                invalidate();
                return responseData.splitGroup;
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの作成に失敗しました',
                    backgroundColor: '#d32f2f',
                });
                return undefined;
            }
        },
        [loginUser, showSnackBar, invalidate]
    );

    const editSplitGroup = useCallback(
        async (id: number, data: Partial<SplitGroupFormData>) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.update(id, data);
                showSnackBar({ title: '成功', bodyText: '分担グループを更新しました' });
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
                invalidate();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの更新に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, invalidate, queryClient]
    );

    const saveSplitGroupSettings = useCallback(
        async (id: number, data: SplitGroupSettings) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.updateSettings(id, data);
                showSnackBar({ title: '成功', bodyText: '設定を保存しました' });
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
                invalidate();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '設定の保存に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, invalidate, queryClient]
    );

    const removeSplitGroup = useCallback(
        async (id: number) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.remove(id);
                showSnackBar({ title: '成功', bodyText: '分担グループを削除しました' });
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
                invalidate();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの削除に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, invalidate, queryClient]
    );

    return (
        <SplitGroupContext.Provider
            value={{
                splitGroups,
                isLoading,
                fetchSplitGroups,
                addSplitGroup,
                editSplitGroup,
                saveSplitGroupSettings,
                removeSplitGroup,
            }}
        >
            {children}
        </SplitGroupContext.Provider>
    );
};

export const useSplitGroupContext = () => {
    const context = useContext(SplitGroupContext);
    if (!context) {
        throw new Error('useSplitGroupContext は SplitGroupProvider 内で使用してください。');
    }
    return context;
};
