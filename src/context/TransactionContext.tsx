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
import { useQueryClient } from "@tanstack/react-query";

// コンテキストの型定義
interface TransactionContext {
    onSaveTransaction: (transaction: TransactionData) => Promise<void>;
    onDeleteTransaction: (
        transactionIds: string | readonly string[]
    ) => Promise<void>;
    onCopyMultipleTransactions: (
        transactionIds: string[],
        sourceDate: string,
        destinationDate: string
    ) => Promise<void>;
    onUpdateTransaction: (
        transaction: TransactionData,
        transactionId: string
    ) => Promise<void>;
    getMonthlyTransactions: (currentMonth: string) => Promise<Transaction[]>;
    prefetchMonth: (yearMonth: string) => Promise<void>;
    refreshMonthCache: (yearMonth: string) => Promise<void>;
    monthlyTransactions: Transaction[];
    isMonthlyLoading: boolean;
    getYearlyTransactions: (currentYear: string) => Promise<Transaction[]>;
    yearlyTransactions: Transaction[];
    isYearlyLoading: boolean;
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
    const queryClient = useQueryClient();

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

    // 月次/年次データを実際にAPIへ取りに行っている間だけtrueになる
    // （キャッシュヒット時は取得済みのため一度もtrueにならない）
    const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
    const [isYearlyLoading, setIsYearlyLoading] = useState(false);

    // 月間データキャッシュ
    const monthCacheRef = useRef<Map<string, Transaction[]>>(new Map());
    // 年間データキャッシュ（当年分・前年比較分をまとめて年単位でキャッシュ）
    const yearCacheRef = useRef<
        Map<string, { yearlyTransactionData: Transaction[]; preYearlyTransactionData: Transaction[] }>
    >(new Map());
    // 直近リクエストされた月。取得結果を画面に適用する前にこれと比較し、
    // 一致する場合のみ反映する（別の月へ移動済みなら古いレスポンスは破棄）。
    // 単純増分カウンタにしないのは、同じ月に戻ってきた際に自分自身より
    // 「新しい」と誤判定されて結果を捨ててしまうのを避けるため。
    const latestRequestedMonthRef = useRef<string | null>(null);
    // 進行中の月次一括取得リクエストを月ごとに管理し、同じ月への
    // 重複リクエストが発生した場合は新規発行せず既存のPromiseを共有する
    const inFlightBulkRequestsRef = useRef<Map<string, Promise<Transaction[]>>>(
        new Map()
    );
    // 進行中の年次取得リクエストを年ごとに管理し、同じ年への重複リクエスト
    // （StrictModeでのマウント時二重effect実行を含む）が発生した場合は
    // 新規発行せず既存のPromiseを共有する
    const inFlightYearlyRequestsRef = useRef<Map<string, Promise<Transaction[]>>>(
        new Map()
    );
    // 直近リクエストされた年。取得結果を画面に適用する前にこれと比較し、
    // 一致する場合のみ反映する（別の年へ移動済みなら古いレスポンスは破棄する。
    // 年送りボタンを連打した際に、後発の年より遅れて返ってきた古いレスポンスで
    // 上書きされてしまうのを防ぐ）
    const latestRequestedYearRef = useRef<string | null>(null);

    // "yyyyMM" 形式の文字列から前月の "yyyyMM" を返すヘルパー
    const getPreviousMonth = (yearMonth: string): string => {
        const year = parseInt(yearMonth.substring(0, 4));
        const month = parseInt(yearMonth.substring(4, 6));
        if (month === 1) return `${year - 1}12`;
        return `${year}${String(month - 1).padStart(2, "0")}`;
    };

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

        // キャッシュヒットの同期パスも含め、必ずここで更新する
        latestRequestedMonthRef.current = currentMonth;

        // キャッシュに存在すれば即座に返す（取得済みのためローディング表示は不要）
        if (monthCacheRef.current.has(currentMonth)) {
            const cachedData = monthCacheRef.current.get(currentMonth)!;
            setMonthlyTransactions(cachedData);
            const prevMonth = getPreviousMonth(currentMonth);
            setPreMonthlyTransactions(monthCacheRef.current.get(prevMonth) || []);
            setIsMonthlyLoading(false);
            return cachedData;
        }

        // 同じ月への一括取得が既に進行中なら、新規リクエストせず
        // 既存のPromiseを共有する（同一月への重複リクエストを防止）
        const existingRequest = inFlightBulkRequestsRef.current.get(currentMonth);
        if (existingRequest) return existingRequest;

        setIsMonthlyLoading(true);
        const request = (async () => {
            try {
                // キャッシュがなければ4ヶ月一括取得（前々月・前月・当月・翌月）
                const response = await apiClient.get(
                    "/monthly-transactions-bulk",
                    { params: { base_month: currentMonth, user_id: loginUser?.id } }
                );

                // レスポンス: { "202602": [...], "202603": [...], "202604": [...], "202605": [...] }
                const bulkData: Record<string, Transaction[]> = response.data;
                Object.entries(bulkData).forEach(([month, data]) => {
                    monthCacheRef.current.set(month, data);
                });

                const currentMonthData =
                    monthCacheRef.current.get(currentMonth) || [];

                // 別の月への新しいナビゲーションが既に発生していれば、この結果は
                // もう表示対象ではないため画面に反映せず破棄する
                if (latestRequestedMonthRef.current === currentMonth) {
                    setMonthlyTransactions(currentMonthData);
                    const prevMonth = getPreviousMonth(currentMonth);
                    setPreMonthlyTransactions(
                        monthCacheRef.current.get(prevMonth) || []
                    );
                }
                return currentMonthData;
            } catch (err) {
                console.error("Error fetching monthly transactions:", err);
                if (latestRequestedMonthRef.current === currentMonth) {
                    setMonthlyTransactions([]);
                    setPreMonthlyTransactions([]);
                }
                return [];
            } finally {
                inFlightBulkRequestsRef.current.delete(currentMonth);
                // 別の月への新しいナビゲーションが既に発生していれば、
                // そちらの結果が反映されるまでローディング表示を維持する
                if (latestRequestedMonthRef.current === currentMonth) {
                    setIsMonthlyLoading(false);
                }
            }
        })();

        inFlightBulkRequestsRef.current.set(currentMonth, request);
        return request;
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
            // 現在表示中の月なら画面にも即時反映
            const currentMonthFormatted = format(currentMonth, "yyyyMM");
            if (yearMonth === currentMonthFormatted) {
                setMonthlyTransactions(data);
            }
        } catch {
            // サイレント失敗（次回 getMonthlyTransactions で bulk 再取得）
        }
    }, [loginUser?.id, currentMonth]);

    // 年間取引データの取得（キャッシュ優先）
    const getYearlyTransactions = useCallback(async (currentYear: string) => {
        if (!loginUser?.id) return [];

        // キャッシュヒットの同期パスも含め、必ずここで更新する
        latestRequestedYearRef.current = currentYear;

        const cached = yearCacheRef.current.get(currentYear);
        if (cached) {
            setYearlyTransactions(cached.yearlyTransactionData);
            setPreYearlyTransactions(cached.preYearlyTransactionData);
            setIsYearlyLoading(false);
            return cached.yearlyTransactionData;
        }

        // 同じ年への取得が既に進行中なら、新規リクエストせず
        // 既存のPromiseを共有する（StrictModeの二重effect実行を含む重複リクエストを防止）
        const existingRequest = inFlightYearlyRequestsRef.current.get(currentYear);
        if (existingRequest) return existingRequest;

        setIsYearlyLoading(true);
        const request = (async () => {
            try {
                const response = await apiClient.get("/yearly-transaction", {
                    params: { currentYear, user_id: loginUser?.id },
                });
                const yearlyTransactionData: Transaction[] = response.data.yearlyTransactionData;
                const preYearlyTransactionData: Transaction[] = response.data.preYearlyTransactionData;
                yearCacheRef.current.set(currentYear, { yearlyTransactionData, preYearlyTransactionData });

                // 別の年への新しいナビゲーションが既に発生していれば、この結果は
                // もう表示対象ではないため画面に反映せず破棄する
                if (latestRequestedYearRef.current === currentYear) {
                    setYearlyTransactions(yearlyTransactionData);
                    setPreYearlyTransactions(preYearlyTransactionData);
                }
                return yearlyTransactionData;
            } catch (err) {
                console.error("Error fetching yearly transactions:", err);
                if (latestRequestedYearRef.current === currentYear) {
                    setYearlyTransactions([]);
                    setPreYearlyTransactions([]);
                }
                return [];
            } finally {
                inFlightYearlyRequestsRef.current.delete(currentYear);
                if (latestRequestedYearRef.current === currentYear) {
                    setIsYearlyLoading(false);
                }
            }
        })();

        inFlightYearlyRequestsRef.current.set(currentYear, request);
        return request;
    }, [loginUser?.id]);

    // 取引の変更（追加・更新・削除・コピー）後に年間キャッシュ全体を無効化する。
    // 年をまたぐ組み合わせの特定が煩雑なため、対象を絞らず丸ごとクリアする
    // （エントリ数が少なく再取得コストも小さいため許容できる）
    const invalidateYearlyCache = useCallback(() => {
        yearCacheRef.current.clear();
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
                invalidateYearlyCache();
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
            } catch (err) {
                console.error("Error saving transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, refreshMonthCache, invalidateYearlyCache, queryClient]
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
                invalidateYearlyCache();
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
            } catch (err) {
                console.error("Error deleting transaction(s):", err);
            }
        },
        [loginUser?.id, setMonthlyTransactions, refreshMonthCache, invalidateYearlyCache, currentMonth, queryClient]
    );

    // 複数取引をコピー
    const onCopyMultipleTransactions = useCallback(
        async (
            transactionIds: string[],
            sourceDate: string,
            destinationDate: string
        ) => {
            try {
                await apiClient.post("/copyMultipleContents", {
                    source_date: sourceDate,
                    destination_date: destinationDate,
                    content_ids: transactionIds.map((id) => parseInt(id, 10)),
                });

                // コピー元とコピー先の月のキャッシュを無効化
                const sourceMonth = format(new Date(sourceDate), "yyyyMM");
                const destinationMonth = format(new Date(destinationDate), "yyyyMM");
                await refreshMonthCache(sourceMonth);
                if (sourceMonth !== destinationMonth) {
                    await refreshMonthCache(destinationMonth);
                }
                invalidateYearlyCache();
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
            } catch (err) {
                console.error("一括コピーエラー:", err);
                throw err;
            }
        },
        [refreshMonthCache, invalidateYearlyCache, queryClient]
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
                invalidateYearlyCache();
                queryClient.invalidateQueries({ queryKey: ['splitGroupPreview'] });
            } catch (err) {
                console.error("Error updating transaction:", err);
            }
        },
        [addCategoryIcon, loginUser?.id, setMonthlyTransactions, refreshMonthCache, invalidateYearlyCache, queryClient]
    );

    return (
        <TransactionContext.Provider
            value={{
                onSaveTransaction,
                onDeleteTransaction,
                onCopyMultipleTransactions,
                onUpdateTransaction,
                getMonthlyTransactions,
                prefetchMonth,
                refreshMonthCache,
                monthlyTransactions,
                isMonthlyLoading,
                getYearlyTransactions,
                yearlyTransactions,
                isYearlyLoading,
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
