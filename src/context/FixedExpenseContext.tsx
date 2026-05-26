import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
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

export const FixedExpenseProvider = ({ children }: { children: ReactNode }) => {
    const { loginUser } = useAuthContext();
    const { showSnackBar } = useAppContext();
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // showSnackBar を deps から除外するため、fetch は純粋なデータ取得のみ担う
    const fetchFixedExpenses = useCallback(async () => {
        if (!loginUser) return;
        setIsLoading(true);
        try {
            const { data } = await fixedExpenseApi.getAll();
            setFixedExpenses(data.fixedExpenses);
        } finally {
            setIsLoading(false);
        }
    }, [loginUser]);

    const addFixedExpense = useCallback(
        async (data: FixedExpenseFormData) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.create(data);
                showSnackBar({ title: "成功", bodyText: "固定費を追加しました" });
                await fetchFixedExpenses();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の追加に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    const editFixedExpense = useCallback(
        async (id: number, data: Partial<FixedExpenseFormData> & { is_active?: boolean }) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.update(id, data);
                showSnackBar({ title: "成功", bodyText: "固定費を更新しました" });
                await fetchFixedExpenses();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の更新に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    const removeFixedExpense = useCallback(
        async (id: number) => {
            if (!loginUser) return;
            try {
                await fixedExpenseApi.remove(id);
                showSnackBar({ title: "成功", bodyText: "固定費を削除しました" });
                await fetchFixedExpenses();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "固定費の削除に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    const bulkRemoveFixedExpenses = useCallback(
        async (ids: number[]) => {
            if (!loginUser) return;
            try {
                await Promise.all(ids.map((id) => fixedExpenseApi.remove(id)));
                showSnackBar({ title: "成功", bodyText: `${ids.length}件を削除しました` });
                await fetchFixedExpenses();
            } catch {
                showSnackBar({
                    title: "エラー",
                    bodyText: "削除に失敗しました",
                    backgroundColor: "#d32f2f",
                });
            }
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    useEffect(() => {
        fetchFixedExpenses();
        // loginUser?.id を依存にすることで、関数参照の変化による余分な再実行を防ぐ
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginUser?.id]);

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
