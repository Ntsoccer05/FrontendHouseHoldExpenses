import React, { ReactNode, createContext, useContext, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FixedExpense, FixedExpenseFormData } from "../types";
import { fixedExpenseApi } from "../api/fixedExpenseApi";
import { useAuthContext } from "./AuthContext";
import { useAppContext } from "./AppContext";

interface FixedExpenseContextType {
    fixedExpenses: FixedExpense[];
    isLoading: boolean;
    fetchFixedExpenses: () => Promise<void>;
    addFixedExpense: (data: FixedExpenseFormData) => Promise<void>;
    editFixedExpense: (
        id: number,
        data: Partial<FixedExpenseFormData> & { is_active?: boolean }
    ) => Promise<void>;
    removeFixedExpense: (id: number) => Promise<void>;
    bulkRemoveFixedExpenses: (ids: number[]) => Promise<void>;
}

const FixedExpenseContext = createContext<FixedExpenseContextType | undefined>(undefined);

const fixedExpensesQueryKey = (userId?: number) => ['fixedExpenses', userId] as const;

export const FixedExpenseProvider = ({ children }: { children: ReactNode }) => {
    const { loginUser } = useAuthContext();
    const { showSnackBar } = useAppContext();
    const queryClient = useQueryClient();

    // react-queryの単一QueryClientにキャッシュされるため、Providerがページ遷移で
    // アンマウント・再マウントされても再取得は起きない（staleTime内は再フェッチ不要）
    const { data, isLoading, refetch } = useQuery({
        queryKey: fixedExpensesQueryKey(loginUser?.id),
        queryFn: async () => {
            const { data } = await fixedExpenseApi.getAll();
            return data.fixedExpenses;
        },
        enabled: !!loginUser,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const fixedExpenses = data ?? [];

    const fetchFixedExpenses = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: fixedExpensesQueryKey(loginUser?.id) });
    }, [queryClient, loginUser?.id]);

    const addFixedExpense = useCallback(
        async (data: FixedExpenseFormData) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.create(data);
                showSnackBar({ title: "成功", bodyText: "固定費を追加しました" });
                invalidate();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の追加に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, invalidate]
    );

    const editFixedExpense = useCallback(
        async (id: number, data: Partial<FixedExpenseFormData> & { is_active?: boolean }) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.update(id, data);
                showSnackBar({ title: "成功", bodyText: "固定費を更新しました" });
                invalidate();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の更新に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, invalidate]
    );

    const removeFixedExpense = useCallback(
        async (id: number) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.remove(id);
                showSnackBar({ title: "成功", bodyText: "固定費を削除しました" });
                invalidate();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の削除に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, invalidate]
    );

    const bulkRemoveFixedExpenses = useCallback(
        async (ids: number[]) => {
            if (!loginUser) return;
            try {
                await Promise.all(ids.map((id) => fixedExpenseApi.remove(id)));
                showSnackBar({ title: "成功", bodyText: `${ids.length}件を削除しました` });
                invalidate();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "削除に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, invalidate]
    );

    return (
        <FixedExpenseContext.Provider
            value={{
                fixedExpenses,
                isLoading,
                fetchFixedExpenses,
                addFixedExpense,
                editFixedExpense,
                removeFixedExpense,
                bulkRemoveFixedExpenses,
            }}
        >
            {children}
        </FixedExpenseContext.Provider>
    );
};

export const useFixedExpenseContext = () => {
    const context = useContext(FixedExpenseContext);
    if (!context) {
        throw new Error("useFixedExpenseContextはFixedExpenseProvider内で使用する必要があります。");
    }
    return context;
};
