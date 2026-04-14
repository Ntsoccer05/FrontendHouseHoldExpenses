import {
    ReactNode,
    createContext,
    useContext,
    useCallback,
    useMemo,
    useState,
    useRef,
} from "react";
import { Transaction, TransactionData, TransactionType } from "../types/index";
import { useAppContext } from "../context/AppContext";
import apiClient from "../utils/axios";
import { useAuthContext } from "./AuthContext";
import { format, subMonths, addMonths } from "date-fns";

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
    invalidateMonthCache: (yearMonth: string) => void;
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
        ExpenseCategories,
        IncomeCategories,
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

    // 月間データキャッシュ（プリフェッチ用）
    const monthCacheRef = useRef<Map<string, Transaction[]>>(new Map());

    // バックエンドデータを Transaction 型に変換する共通関数
    const transformTransactionData = useCallback(
        (data: any[]): Transaction[] => {
            return Array.isArray(data)
                ? data.map((item: any) => {
                    // category ID をカテゴリー名にマッピング
                    const categories = item.type_id === 1 ? IncomeCategories : ExpenseCategories;
                    const categoryObj = categories?.find(cat => cat.filtered_id === item.category_id);
                    const categoryName = categoryObj?.label || `Category ${item.category_id}`;

                    return {
                      id: String(item.id),
                      date: item.recorded_at ? item.recorded_at.split(' ')[0] : '',
                      amount: item.amount,
                      content: item.content || '',
                      type: item.type_id === 1 ? 'income' : 'expense' as TransactionType,
                      category: categoryName,
                      icon: categoryObj?.icon,
                    };
                  })
                : [];
        },
        [ExpenseCategories, IncomeCategories]
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

    // 月間取引データの取得（キャッシュ優先、3ヶ月一括取得）
    const getMonthlyTransactions = useCallback(async (currentMonth: string) => {
        try {
            // キャッシュに存在すれば即座に返す（変換済みデータ）
            if (monthCacheRef.current.has(currentMonth)) {
                const cachedData = monthCacheRef.current.get(currentMonth)!;
                setMonthlyTransactions(cachedData);
                return cachedData;
            }

            // キャッシュがなければ API リクエスト（3ヶ月一括取得）
            const response = await apiClient.get("/monthly-transactions-multi", {
                params: { month: currentMonth, user_id: loginUser?.id },
            });

            // レスポンス構造の確認とデータ抽出
            // バックエンドは prevMonth, currentMonth, nextMonth で返す
            const prevMonth = response.data?.prevMonth || [];
            const currentMonthData = response.data?.currentMonth || [];
            const nextMonth = response.data?.nextMonth || [];

            // currentMonth を ISO 8601 形式に変換（"202604" → "2026-04-01"）
            const dateStr = `${currentMonth.slice(0, 4)}-${currentMonth.slice(4)}-01`;
            const dateObj = new Date(dateStr);

            const prevMonthKey = format(subMonths(dateObj, 1), "yyyyMM");
            const nextMonthKey = format(addMonths(dateObj, 1), "yyyyMM");

            // データを変換してからキャッシュに保存
            const transformedPrevMonth = transformTransactionData(prevMonth);
            const transformedCurrentMonth = transformTransactionData(currentMonthData);
            const transformedNextMonth = transformTransactionData(nextMonth);

            monthCacheRef.current.set(prevMonthKey, transformedPrevMonth);
            monthCacheRef.current.set(currentMonth, transformedCurrentMonth);
            monthCacheRef.current.set(nextMonthKey, transformedNextMonth);

            // state を確実に更新
            setMonthlyTransactions(transformedCurrentMonth);
            setPreMonthlyTransactions([]);
            return transformedCurrentMonth;
        } catch (err) {
            console.error("Error fetching monthly transactions:", err);
            // エラー時は確実に空配列で初期化
            setMonthlyTransactions([]);
            setPreMonthlyTransactions([]);
            return [];
        }
    }, [loginUser?.id, transformTransactionData]);

    // 月間データをバックグラウンドで先読み（プリフェッチ）
    const prefetchMonth = useCallback(async (yearMonth: string) => {
        // キャッシュに存在すれば何もしない
        if (monthCacheRef.current.has(yearMonth)) return;

        // バックグラウンドで API リクエスト（エラー時も無視）
        try {
            const response = await apiClient.get("/monthly-transactions-multi", {
                params: { month: yearMonth, user_id: loginUser?.id },
            });

            // レスポンス構造の確認とデータ抽出
            // バックエンドは prevMonth, currentMonth, nextMonth で返す
            const prevMonth = response.data?.prevMonth || [];
            const currentMonthData = response.data?.currentMonth || [];
            const nextMonth = response.data?.nextMonth || [];

            // yearMonth を ISO 8601 形式に変換（"202604" → "2026-04-01"）
            const dateStr = `${yearMonth.slice(0, 4)}-${yearMonth.slice(4)}-01`;
            const dateObj = new Date(dateStr);

            const prevMonthKey = format(subMonths(dateObj, 1), "yyyyMM");
            const nextMonthKey = format(addMonths(dateObj, 1), "yyyyMM");

            // データを変換してからキャッシュに保存
            const transformedPrevMonth = transformTransactionData(prevMonth);
            const transformedCurrentMonth = transformTransactionData(currentMonthData);
            const transformedNextMonth = transformTransactionData(nextMonth);

            monthCacheRef.current.set(prevMonthKey, transformedPrevMonth);
            monthCacheRef.current.set(yearMonth, transformedCurrentMonth);
            monthCacheRef.current.set(nextMonthKey, transformedNextMonth);

            // プリフェッチ対象の月が現在月と同じ場合は state を更新
            const currentMonthFormatted = format(currentMonth, "yyyyMM");
            if (yearMonth === currentMonthFormatted && Array.isArray(transformedCurrentMonth)) {
                setMonthlyTransactions(transformedCurrentMonth);
            }
        } catch (err) {
            // プリフェッチ失敗時も UI には影響しない
            console.warn(`Failed to prefetch month ${yearMonth}:`, err);
        }
    }, [loginUser?.id, currentMonth, transformTransactionData]);

    // 月間データキャッシュを無効化
    const invalidateMonthCache = useCallback((yearMonth: string) => {
        monthCacheRef.current.delete(yearMonth);
    }, []);

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
                invalidateMonthCache(transactionMonth);
            } catch (err) {
                console.error("Error saving transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, invalidateMonthCache]
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
                invalidateMonthCache(currentMonthFormatted);
            } catch (err) {
                console.error("Error deleting transaction(s):", err);
            }
        },
        [loginUser?.id, setMonthlyTransactions, invalidateMonthCache, currentMonth]
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
                invalidateMonthCache(transactionMonth);
            } catch (err) {
                console.error("Error updating transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, invalidateMonthCache]
    );

    return (
        <TransactionContext.Provider
            value={{
                onSaveTransaction,
                onDeleteTransaction,
                onUpdateTransaction,
                getMonthlyTransactions,
                prefetchMonth,
                invalidateMonthCache,
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
