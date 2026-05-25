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
}

const FixedExpenseContext = createContext<FixedExpenseContextType | undefined>(undefined);

export const FixedExpenseProvider = ({ children }: { children: ReactNode }) => {
    const { loginUser } = useAuthContext();
    const { showSnackBar } = useAppContext();
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFixedExpenses = useCallback(async () => {
        if (!loginUser) return;
        setIsLoading(true);
        try {
            const { data } = await fixedExpenseApi.getAll(loginUser.id);
            setFixedExpenses(data.fixedExpenses);
        } catch {
            showSnackBar({
                title: "エラー",
                bodyText: "固定費の取得に失敗しました",
                backgroundColor: "#d32f2f",
            });
        } finally {
            setIsLoading(false);
        }
    }, [loginUser, showSnackBar]);

    const addFixedExpense = useCallback(
        async (data: FixedExpenseFormData) => {
            if (!loginUser) return;
            await fixedExpenseApi.create(loginUser.id, data);
            showSnackBar({ title: "成功", bodyText: "固定費を追加しました" });
            await fetchFixedExpenses();
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    const editFixedExpense = useCallback(
        async (id: number, data: Partial<FixedExpenseFormData> & { is_active?: boolean }) => {
            if (!loginUser) return;
            await fixedExpenseApi.update(loginUser.id, id, data);
            showSnackBar({ title: "成功", bodyText: "固定費を更新しました" });
            await fetchFixedExpenses();
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    const removeFixedExpense = useCallback(
        async (id: number) => {
            if (!loginUser) return;
            await fixedExpenseApi.remove(loginUser.id, id);
            showSnackBar({ title: "成功", bodyText: "固定費を削除しました" });
            await fetchFixedExpenses();
        },
        [loginUser, showSnackBar, fetchFixedExpenses]
    );

    useEffect(() => {
        fetchFixedExpenses();
    }, [fetchFixedExpenses]);

    return (
        <FixedExpenseContext.Provider
            value={{
                fixedExpenses,
                isLoading,
                fetchFixedExpenses,
                addFixedExpense,
                editFixedExpense,
                removeFixedExpense,
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
