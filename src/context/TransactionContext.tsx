import {
    ReactNode,
    createContext,
    useContext,
    useCallback,
    useMemo,
    useState,
} from "react";
import { Transaction, TransactionData } from "../types/index";
import { useTheme } from "@mui/material";
import { useAppContext } from "../context/AppContext";
import apiClient from "../utils/axios";

// コンテキストの型定義
interface TransactionContext {
    onSaveTransaction: (transaction: TransactionData) => Promise<void>;
    onDeleteTransaction: (
        transactionIds: string | readonly string[]
    ) => Promise<void>;
    onUpdateTransaction: (
        transaction: TransactionData,
        transactionId: string
    ) => Promise<void>;
    getMonthlyTransactions: (currentMonth: string) => Promise<any>;
    monthlyTransactions: Transaction[];
    getYearlyTransactions: (currentYear: string) => Promise<any>;
    yearlyTransactions: Transaction[];
}

// コンテキストの初期化
const TransactionContext = createContext<TransactionContext | undefined>(
    undefined
);

interface TransactionProviderProps {
    children: ReactNode;
}

// プロバイダーコンポーネント
export const TransactionProvider = ({ children }: TransactionProviderProps) => {
    const theme = useTheme();

    const {
        LoginUser,
        transactions,
        setTransactions,
        ExpenseCategories,
        IncomeCategories,
    } = useAppContext();

    const [monthlyTransactions, setMonthlyTransactions] = useState<
        Transaction[]
    >([]);

    const [yearlyTransactions, setYearlyTransactions] = useState<Transaction[]>(
        []
    );

    // 共通アイコン取得処理をメモ化
    const addCategoryIcon = useMemo(() => {
        return (transaction: TransactionData) => {
            const categories =
                transaction.type === "expense"
                    ? ExpenseCategories
                    : IncomeCategories;
            return categories?.find(
                (category) => category.label === transaction.category
            )?.icon;
        };
    }, [ExpenseCategories, IncomeCategories]);

    // 月間取引データの取得
    const getMonthlyTransactions = useCallback(async (currentMonth: string) => {
        try {
            const response = await apiClient.get("/monthly-transaction", {
                params: { currentMonth },
            });
            setMonthlyTransactions(response.data.monthlyTransactionData);
            return response.data.monthlyTransactionData;
        } catch (err) {
            console.error("Error fetching monthly transactions:", err);
            return [];
        }
    }, []);

    // 年間取引データの取得
    const getYearlyTransactions = useCallback(async (currentYear: string) => {
        try {
            const response = await apiClient.get("/yearly-transaction", {
                params: { currentYear },
            });
            setYearlyTransactions(response.data.yearlyTransactionData);
            return response.data.yearlyTransactionData;
        } catch (err) {
            console.error("Error fetching yearly transactions:", err);
            return [];
        }
    }, []);

    // 取引を保存
    const onSaveTransaction = useCallback(
        async (transaction: TransactionData) => {
            try {
                const transactionWithIcon = {
                    ...transaction,
                    icon: addCategoryIcon(transaction),
                };
                const response = await apiClient.post("/addTransaction", {
                    transaction: transactionWithIcon,
                    user_id: LoginUser?.id,
                });
                const newTransaction = {
                    id: response.data.id,
                    ...transactionWithIcon,
                } as Transaction;

                setMonthlyTransactions((prevTransactions) => [
                    ...prevTransactions,
                    newTransaction,
                ]);
            } catch (err) {
                console.error("Error saving transaction:", err);
            }
        },
        [addCategoryIcon, LoginUser?.id, setMonthlyTransactions]
    );

    // 取引を削除
    const onDeleteTransaction = useCallback(
        async (transactionIds: string | readonly string[]) => {
            try {
                const idsToDelete = Array.isArray(transactionIds)
                    ? transactionIds
                    : [transactionIds];

                await Promise.all(
                    idsToDelete.map((id) =>
                        apiClient.post("/deleteTransaction", {
                            transactionId: id,
                            user_id: LoginUser?.id,
                        })
                    )
                );

                setMonthlyTransactions((prevTransactions) =>
                    prevTransactions.filter(
                        (transaction) => !idsToDelete.includes(transaction.id)
                    )
                );
            } catch (err) {
                console.error("Error deleting transaction(s):", err);
            }
        },
        [LoginUser?.id, setMonthlyTransactions]
    );

    // 取引を更新
    const onUpdateTransaction = useCallback(
        async (transaction: TransactionData, transactionId: string) => {
            try {
                const transactionWithIcon = {
                    ...transaction,
                    icon: addCategoryIcon(transaction),
                };
                await apiClient.post("/updateTransaction", {
                    transaction: transactionWithIcon,
                    transactionId,
                    user_id: LoginUser?.id,
                });

                setMonthlyTransactions((prevTransactions) =>
                    prevTransactions.map((t) =>
                        t.id === transactionId
                            ? { ...t, ...transactionWithIcon }
                            : t
                    )
                );
            } catch (err) {
                console.error("Error updating transaction:", err);
            }
        },
        [addCategoryIcon, LoginUser?.id, setMonthlyTransactions]
    );

    return (
        <TransactionContext.Provider
            value={{
                onSaveTransaction,
                onDeleteTransaction,
                onUpdateTransaction,
                getMonthlyTransactions,
                monthlyTransactions,
                getYearlyTransactions,
                yearlyTransactions,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

// カスタムフック
export const useTransactionContext = () => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error(
            "useTransactionContextは、TransactionProvider内で使用する必要があります。"
        );
    }
    return context;
};
