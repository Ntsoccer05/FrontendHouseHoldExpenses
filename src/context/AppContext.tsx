import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
    BaseUserCategory,
    CategoryItem,
    Transaction,
} from "../types/index";
import apiClient from "../utils/axios";
import { useAuthContext } from "./AuthContext";
import { getSessionStorage, setSessionStorage } from "../utils/manageSessionStorage";

// コンテキストの型定義
interface AppContextType {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    currentMonth: Date;
    setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
    currentYear: Date;
    setCurrentYear: React.Dispatch<React.SetStateAction<Date>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isMobile: boolean;
    setLoginFlg: React.Dispatch<React.SetStateAction<number>>;
    loginFlg: number;
    getIncomeCategory: () => Promise<void>;
    getExpenseCategory: () => Promise<void>;
    IncomeCategories: CategoryItem[] | undefined;
    ExpenseCategories: CategoryItem[] | undefined;
}

// コンテキスト作成
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

// プロバイダーコンポーネント
export const AppProvider = ({ children }: AppProviderProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentYear, setCurrentYear] = useState(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loginFlg, setLoginFlg] = useState<number>(0);
    const {loginUser} = useAuthContext();

    // 👇 useAuthを使ってLoginUser取得
    const [IncomeCategories, setIncomeCategories] = useState<CategoryItem[]>([]);
    const [ExpenseCategories, setExpenseCategories] = useState<CategoryItem[]>([]);

    // 収入カテゴリー取得処理
    const getIncomeCategory = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/IncomeCategory", {
                params: { user_id: loginUser?.id },
            });
            if (data.incomeUserCategory) {
                const incomeCategories = data.incomeUserCategory.map(
                    (incomeCategory: BaseUserCategory) => ({
                        id: incomeCategory.id,
                        filtered_id: incomeCategory.filtered_id,
                        label: incomeCategory.content,
                        icon: incomeCategory.icon,
                        deleted: incomeCategory.deleted,
                    })
                );
                setSessionStorage('incomeCategories' ,incomeCategories)
                setIncomeCategories(incomeCategories);
            }
        } catch (err) {
            console.error("収入カテゴリー取得エラー:", err);
        }
    }, [loginUser]);

    // 支出カテゴリー取得処理
    const getExpenseCategory = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/ExpenseCategory", {
                params: { user_id: loginUser?.id },
            });
            if (data.expenseUserCategory) {
                const expenseCategories = data.expenseUserCategory.map(
                    (expenseCategory: BaseUserCategory) => ({
                        id: expenseCategory.id,
                        filtered_id: expenseCategory.filtered_id,
                        label: expenseCategory.content,
                        icon: expenseCategory.icon,
                        deleted: expenseCategory.deleted,
                    })
                );
                setSessionStorage('expenseCategories' ,expenseCategories)
                setExpenseCategories(expenseCategories);
            }
        } catch (err) {
            console.error("支出カテゴリー取得エラー:", err);
        }
    }, [loginUser]);

    // ログインユーザーが変更された場合にカテゴリーを取得
    useEffect(() => {
        if(loginUser){
            const sessionIncomeCategory = getSessionStorage('incomeCategories');
            const sessionExpenseCategory = getSessionStorage('expenseCategories');
            sessionIncomeCategory ? setIncomeCategories(sessionIncomeCategory) : getIncomeCategory();
            sessionExpenseCategory ? setExpenseCategories(sessionExpenseCategory) : getExpenseCategory();
        }
    }, [loginUser, getIncomeCategory, getExpenseCategory]);

    // Context Value をメモ化
    const contextValue = useMemo(
        () => ({
            transactions,
            setTransactions,
            currentMonth,
            setCurrentMonth,
            currentYear,
            setCurrentYear,
            isLoading,
            setIsLoading,
            isMobile,
            setLoginFlg,
            loginFlg,
            IncomeCategories,
            ExpenseCategories,
            getIncomeCategory,
            getExpenseCategory,
        }),
        [
            transactions,
            currentMonth,
            currentYear,
            isLoading,
            isMobile,
            loginFlg,
            IncomeCategories,
            ExpenseCategories,
            getIncomeCategory,
            getExpenseCategory,
        ]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// コンテキストを使用するためのカスタムフック
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error(
            "useAppContextはAppProvider内で使用する必要があります。"
        );
    }
    return context;
};
