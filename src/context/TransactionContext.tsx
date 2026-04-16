import {
    ReactNode,
    createContext,
    useContext,
    useCallback,
    useMemo,
    useState,
    useRef,
} from "react";
import { Transaction, TransactionData } from "../types/index";
import { useAppContext } from "../context/AppContext";
import apiClient from "../utils/axios";
import { useAuthContext } from "./AuthContext";
import { format } from "date-fns";

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
    prefetchMonth: (yearMonth: string) => Promise<void>;
    refreshMonthCache: (yearMonth: string) => Promise<void>;
    monthlyTransactions: Transaction[];
    getYearlyTransactions: (currentYear: string) => Promise<any>;
    yearlyTransactions: Transaction[];
    preMonthlyTransactions: Transaction[];
    preYearlyTransactions: Transaction[];
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
    const {
        currentMonth,
    } = useAppContext();

    const { loginUser } = useAuthContext();

    const [monthlyTransactions, setMonthlyTransactions] = useState<
        Transaction[]
    >([]);

    const [yearlyTransactions, setYearlyTransactions] = useState<Transaction[]>(
        []
    );

    // 前月家計簿内容
    const [preMonthlyTransactions, setPreMonthlyTransactions] = useState<
        Transaction[]
    >([]);

    // 前年家計簿内容
    const [preYearlyTransactions, setPreYearlyTransactions] = useState<Transaction[]>(
        []
    );

    // 月間データキャッシュ
    const monthCacheRef = useRef<Map<string, Transaction[]>>(new Map());
    // 進行中の一括取得リクエストを管理（重複リクエスト防止）
    const pendingMonthRef = useRef<string | null>(null);

    // 共通アイコン取得処理をメモ化
    const { ExpenseCategories, IncomeCategories } = useAppContext();
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

    // 月間取引データの取得（キャッシュ優先、初回は4ヶ月一括取得）
    const getMonthlyTransactions = useCallback(async (currentMonth: string) => {
        // 未ログイン時はAPIを呼ばない
        if (!loginUser?.id) return [];

        // キャッシュに存在すれば即座に返す
        if (monthCacheRef.current.has(currentMonth)) {
            const cachedData = monthCacheRef.current.get(currentMonth)!;
            setMonthlyTransactions(cachedData);
            return cachedData;
        }

        // 同じ月の一括取得が進行中の場合は重複リクエストを防ぐ
        if (pendingMonthRef.current === currentMonth) return [];
        pendingMonthRef.current = currentMonth;

        try {
            // キャッシュがなければ4ヶ月一括取得（前々月・前月・当月・翌月）
            const response = await apiClient.get("/monthly-transactions-bulk", {
                params: { base_month: currentMonth, user_id: loginUser?.id },
            });

            // レスポンス: { "202602": [...], "202603": [...], "202604": [...], "202605": [...] }
            const bulkData: Record<string, Transaction[]> = response.data;
            Object.entries(bulkData).forEach(([month, data]) => {
                monthCacheRef.current.set(month, data);
            });

            const currentMonthData = monthCacheRef.current.get(currentMonth) || [];
            setMonthlyTransactions(currentMonthData);
            setPreMonthlyTransactions([]);
            return currentMonthData;
        } catch (err) {
            console.error("Error fetching monthly transactions:", err);
            setMonthlyTransactions([]);
            setPreMonthlyTransactions([]);
            return [];
        } finally {
            pendingMonthRef.current = null;
        }
    }, [loginUser?.id]);

    // 月間データをバックグラウンドで先読み（キャッシュミス時のフォールバック）
    const prefetchMonth = useCallback(async (yearMonth: string) => {
        // 未ログイン時またはキャッシュに存在すれば何もしない
        if (!loginUser?.id) return;
        if (monthCacheRef.current.has(yearMonth)) return;

        try {
            const response = await apiClient.get("/monthly-transaction", {
                params: { currentMonth: yearMonth, user_id: loginUser?.id },
            });
            const data: Transaction[] = response.data.monthlyTransactionData || [];
            monthCacheRef.current.set(yearMonth, data);

            // プリフェッチ対象が現在表示中の月の場合は state を更新
            const currentMonthFormatted = format(currentMonth, "yyyyMM");
            if (yearMonth === currentMonthFormatted) {
                setMonthlyTransactions(data);
            }
        } catch (err) {
            console.warn(`Failed to prefetch month ${yearMonth}:`, err);
        }
    }, [loginUser?.id, currentMonth]);

    // 対象月のキャッシュを単月再取得で更新（データ変更後に使用）
    const refreshMonthCache = useCallback(async (yearMonth: string) => {
        monthCacheRef.current.delete(yearMonth);
        if (!loginUser?.id) return;
        try {
            const response = await apiClient.get("/monthly-transaction", {
                params: { currentMonth: yearMonth, user_id: loginUser?.id },
            });
            const data: Transaction[] = response.data.monthlyTransactionData || [];
            monthCacheRef.current.set(yearMonth, data);
        } catch {
            // サイレント失敗（次回 getMonthlyTransactions で bulk 再取得）
        }
    }, [loginUser?.id]);

    // 年間取引データの取得
    const getYearlyTransactions = useCallback(async (currentYear: string) => {
        try {
            const response = await apiClient.get("/yearly-transaction", {
                params: { currentYear, user_id: loginUser?.id },
            });
            setYearlyTransactions(response.data.yearlyTransactionData);
            setPreYearlyTransactions(response.data.preYearlyTransactionData);
            return response.data.yearlyTransactionData;
        } catch (err) {
            console.error("Error fetching yearly transactions:", err);
            return [];
        }
    }, [loginUser]);

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
                    user_id: loginUser?.id,
                });
                const newTransaction = {
                    id: response.data.id,
                    ...transactionWithIcon,
                } as Transaction;

                setMonthlyTransactions((prevTransactions) => [
                    ...prevTransactions,
                    newTransaction,
                ]);

                // キャッシュを無効化（トランザクションが追加された月）
                const transactionMonth = format(new Date(transaction.date), "yyyyMM");
                refreshMonthCache(transactionMonth);
            } catch (err) {
                console.error("Error saving transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, refreshMonthCache]
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
                            user_id: loginUser?.id,
                        })
                    )
                );

                setMonthlyTransactions((prevTransactions) =>
                    prevTransactions.filter(
                        (transaction) => !idsToDelete.includes(transaction.id)
                    )
                );

                // キャッシュを無効化（削除が行われた月）
                const currentMonthFormatted = format(currentMonth, "yyyyMM");
                refreshMonthCache(currentMonthFormatted);
            } catch (err) {
                console.error("Error deleting transaction(s):", err);
            }
        },
        [loginUser?.id, setMonthlyTransactions, refreshMonthCache, currentMonth]
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
                    user_id: loginUser?.id,
                });

                setMonthlyTransactions((prevTransactions) =>
                    prevTransactions.map((t) =>
                        t.id === transactionId
                            ? { ...t, ...transactionWithIcon }
                            : t
                    )
                );

                // キャッシュを無効化（更新が行われた月）
                const transactionMonth = format(new Date(transaction.date), "yyyyMM");
                refreshMonthCache(transactionMonth);
            } catch (err) {
                console.error("Error updating transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, refreshMonthCache]
    );

    return (
        <TransactionContext.Provider
            value={{
                onSaveTransaction,
                onDeleteTransaction,
                onUpdateTransaction,
                getMonthlyTransactions,
                prefetchMonth,
                refreshMonthCache,
                monthlyTransactions,
                getYearlyTransactions,
                yearlyTransactions,
                preMonthlyTransactions,
                preYearlyTransactions,
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
