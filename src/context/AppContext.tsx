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
    SnackBarState,
    Transaction,
} from "../types/index";
import apiClient from "../utils/axios";
import { useAuthContext } from "./AuthContext";
import { getSessionStorage, setSessionStorage } from "../utils/manageSessionStorage";

const defaultState: SnackBarState = {
  open: false,
  vertical: "top",
  horizontal: "center",
  title: "",
  bodyText: "",
  backgroundColor: "#1976d2",
  autoHideDuration: 3000,
};

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
    snackBarState: SnackBarState;
    setSnackBarState: React.Dispatch<React.SetStateAction<SnackBarState>>;
    showSnackBar: (state: Partial<SnackBarState>) => void
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

    const [snackBarState, setSnackBarState] = useState<SnackBarState>(defaultState);

    // 表示関数
    const showSnackBar = (state: Partial<SnackBarState>) => {
        setSnackBarState((prev) => ({ ...prev, ...state, open: true }));
    };

    // 収入カテゴリー取得処理
    const getIncomeCategory = useCallback(async () => {
        const cached = getSessionStorage('incomeCategories');
        if (cached) { setIncomeCategories(cached); return; }
        try {
            const { data } = await apiClient.get("/IncomeCategory");
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
        const cached = getSessionStorage('expenseCategories');
        if (cached) { setExpenseCategories(cached); return; }
        try {
            const { data } = await apiClient.get("/ExpenseCategory");
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
            snackBarState,
            setSnackBarState,
            showSnackBar
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
            snackBarState,
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
