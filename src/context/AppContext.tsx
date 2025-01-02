import React, {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    useLayoutEffect,
} from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
    BaseUserCategory,
    CategoryItem,
    LoginUser,
    Transaction,
} from "../types/index";
import apiClient from "../utils/axios";

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
    LoginUser: LoginUser | undefined;
    setLoginUser: React.Dispatch<React.SetStateAction<LoginUser | undefined>>;
    getLoginUser: () => Promise<void>;
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

    // State 管理
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentYear, setCurrentYear] = useState(new Date());
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loginFlg, setLoginFlg] = useState<number>(0);
    const [LoginUser, setLoginUser] = useState<LoginUser | undefined>();
    const [IncomeCategories, setIncomeCategories] = useState<CategoryItem[]>(
        []
    );
    const [ExpenseCategories, setExpenseCategories] = useState<CategoryItem[]>(
        []
    );

    // ログインユーザー取得処理
    const getLoginUser = useCallback(async () => {
        try {
            const { data } = await apiClient.get("/user");
            setLoginUser(data);
            setLoginFlg(1);
        } catch (err) {
            console.error("ログインユーザー取得エラー:", err);
            setLoginFlg(2);
        }
    }, []);

    // 収入カテゴリー取得処理
    const getIncomeCategory = useCallback(async () => {
        if (LoginUser) {
            try {
                const { data } = await apiClient.get("/IncomeCategory", {
                    params: { user_id: LoginUser.id },
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
                    setIncomeCategories(incomeCategories);
                }
            } catch (err) {
                console.error("収入カテゴリー取得エラー:", err);
            }
        }
    }, [LoginUser]);

    // 支出カテゴリー取得処理
    const getExpenseCategory = useCallback(async () => {
        if (LoginUser) {
            try {
                const { data } = await apiClient.get("/ExpenseCategory", {
                    params: { user_id: LoginUser.id },
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
                    setExpenseCategories(expenseCategories);
                }
            } catch (err) {
                console.error("支出カテゴリー取得エラー:", err);
            }
        }
    }, [LoginUser]);

    // 初回マウント時にログインユーザーを取得(useEffectよりuseLayoutEffectの方が前に実行される)
    useLayoutEffect(() => {
        getLoginUser();
    }, [getLoginUser]);

    // ログインユーザーが変更された場合にカテゴリーを取得
    useEffect(() => {
        getIncomeCategory();
        getExpenseCategory();
    }, [LoginUser, getIncomeCategory, getExpenseCategory]);

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
            LoginUser,
            setLoginUser,
            getLoginUser,
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
            LoginUser,
            IncomeCategories,
            ExpenseCategories,
            getLoginUser,
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
