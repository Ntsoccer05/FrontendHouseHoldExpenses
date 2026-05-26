import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import type { SplitGroup, SplitGroupCategoryOverride, SplitGroupFormData } from '../types';
import { splitGroupApi } from '../api/splitGroupApi';
import { useAuthContext } from './AuthContext';
import { useAppContext } from './AppContext';

interface SplitGroupContextType {
    splitGroups: SplitGroup[];
    isLoading: boolean;
    fetchSplitGroups: () => Promise<void>;
    addSplitGroup: (data: SplitGroupFormData) => Promise<void>;
    editSplitGroup: (
        id: number,
        data: Partial<SplitGroupFormData> & { is_active?: boolean }
    ) => Promise<void>;
    saveSplitGroupSettings: (
        id: number,
        data: { income_other_ratio: number | null; expense_other_ratio: number | null }
    ) => Promise<void>;
    saveCategoryOverrides: (
        id: number,
        overrides: SplitGroupCategoryOverride[]
    ) => Promise<void>;
    removeSplitGroup: (id: number) => Promise<void>;
}

const SplitGroupContext = createContext<SplitGroupContextType | undefined>(undefined);

export const SplitGroupProvider = ({ children }: { children: ReactNode }) => {
    const { loginUser } = useAuthContext();
    const { showSnackBar } = useAppContext();
    const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSplitGroups = useCallback(async () => {
        if (!loginUser) return;
        setIsLoading(true);
        try {
            const { data } = await splitGroupApi.getAll();
            setSplitGroups(data.splitGroups);
        } finally {
            setIsLoading(false);
        }
    }, [loginUser]);

    const addSplitGroup = useCallback(
        async (data: SplitGroupFormData) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.create(data);
                showSnackBar({ title: '成功', bodyText: '分担グループを作成しました' });
                await fetchSplitGroups();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの作成に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, fetchSplitGroups]
    );

    const editSplitGroup = useCallback(
        async (id: number, data: Partial<SplitGroupFormData> & { is_active?: boolean }) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.update(id, data);
                showSnackBar({ title: '成功', bodyText: '分担グループを更新しました' });
                await fetchSplitGroups();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの更新に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, fetchSplitGroups]
    );

    const saveSplitGroupSettings = useCallback(
        async (
            id: number,
            data: { income_other_ratio: number | null; expense_other_ratio: number | null }
        ) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.updateSettings(id, data);
                showSnackBar({ title: '成功', bodyText: '設定を保存しました' });
                await fetchSplitGroups();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '設定の保存に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, fetchSplitGroups]
    );

    const saveCategoryOverrides = useCallback(
        async (id: number, overrides: SplitGroupCategoryOverride[]) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.updateCategoryOverrides(id, overrides);
                showSnackBar({ title: '成功', bodyText: 'カテゴリ別設定を保存しました' });
                await fetchSplitGroups();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: 'カテゴリ別設定の保存に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, fetchSplitGroups]
    );

    const removeSplitGroup = useCallback(
        async (id: number) => {
            if (!loginUser) return;
            try {
                await splitGroupApi.remove(id);
                showSnackBar({ title: '成功', bodyText: '分担グループを削除しました' });
                await fetchSplitGroups();
            } catch {
                showSnackBar({
                    title: 'エラー',
                    bodyText: '分担グループの削除に失敗しました',
                    backgroundColor: '#d32f2f',
                });
            }
        },
        [loginUser, showSnackBar, fetchSplitGroups]
    );

    useEffect(() => {
        fetchSplitGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.id]);

    return (
        <SplitGroupContext.Provider
            value={{
                splitGroups,
                isLoading,
                fetchSplitGroups,
                addSplitGroup,
                editSplitGroup,
                saveSplitGroupSettings,
                saveCategoryOverrides,
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
