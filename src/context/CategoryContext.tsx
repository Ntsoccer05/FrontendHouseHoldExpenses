import { ReactNode, createContext, useContext } from "react";
import { CategoryItem, TransactionType } from "../types/index";
import { useAppContext } from "../context/AppContext";
import apiClient from "../utils/axios";

type data = {
    content: string;
    icon?: string;
    type: TransactionType;
};

//コンテキスト
interface CategoryContextType {
    editCategory: ({
        id,
        content,
        icon,
        type,
    }: // fixed_category_id,
    {
        id: number;
        content: string;
        icon: string;
        type: TransactionType;
        // fixed_category_id?: number;
    }) => Promise<void>;
    deleteCategories: (
        tgtCategories: CategoryItem[],
        type: TransactionType
    ) => Promise<void>;
    addCategories: (data: data) => Promise<void>;
    sortCategories: (
        tgtCategories: CategoryItem[],
        type: TransactionType
    ) => Promise<void>;
}

// createContextでグローバルにする値を設定　CategoryContext.Providerのvalueの設定値の型を指定する必要がある
const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined
);

interface CategoryProviderProps {
    children: ReactNode;
}

// プロバイダーコンポーネント
export const CategoryProvider = ({ children }: CategoryProviderProps) => {
    const {
        LoginUser,
        IncomeCategories,
        ExpenseCategories,
        getExpenseCategory,
        getIncomeCategory,
    } = useAppContext();

    const addCategories = async (data: data) => {
        try {
            if (LoginUser && data.content !== "") {
                const api =
                    data.type === "income"
                        ? "/addIncomeCategory"
                        : "/addExpenseCategory";
                await apiClient 
                    .post(api, {
                        user_id: LoginUser.id,
                        data,
                    })
                    .then(async (res) => {
                        data.type === "expense"
                            ? await getExpenseCategory()
                            : await getIncomeCategory();
                    })
                    .catch((err) => {});
            }
        } catch (err) {
            console.log(err);
        }
    };

    const editCategory = async ({
        id,
        content,
        icon,
        type,
    }: // fixed_category_id,
    {
        id: number;
        content: string;
        icon: string;
        type: TransactionType;
        // fixed_category_id?: number;
    }) => {
        try {
            const tgtCategory =
                type === "expense"
                    ? (ExpenseCategories as CategoryItem[])
                    : (IncomeCategories as CategoryItem[]);
            if (LoginUser && tgtCategory.length > 0) {
                const updateTgtData = tgtCategory.filter((category) => {
                    return category.id === id;
                });
                if (!updateTgtData) {
                    return;
                }
                const updateData = {
                    id,
                    content,
                    icon,
                    type,
                    // fixed_category_id: fixed_category_id,
                };
                const api =
                    updateData.type === "income"
                        ? "/updateIncomeCategory"
                        : "/updateExpenseCategory";
                await apiClient
                    .post(api, {
                        updateData: updateData,
                        user_id: LoginUser.id,
                    })
                    .then((res) => {
                        type === "expense"
                            ? getExpenseCategory()
                            : getIncomeCategory();
                    })
                    .catch((err) => {});
            }
        } catch (err) {
            console.log(err);
        }
    };
    const sortCategories = async (
        tgtCategories: CategoryItem[],
        type: TransactionType
    ) => {
        try {
            if (LoginUser && tgtCategories.length > 0) {
                tgtCategories = tgtCategories.map((category, index) => ({
                    ...category, // 既存のカテゴリーデータを展開
                    filtered_id: index + 1, // index に 1 を加えて filtered_id を設定
                }));
                const sortData = {
                    tgtCategories,
                };
                const api =
                    type === "income"
                        ? "/sortIncomeCategory"
                        : "/sortExpenseCategory";
                await apiClient
                    .post(api, {
                        sortData: sortData,
                        user_id: LoginUser.id,
                    })
                    .then(async (res) => {
                        type === "expense"
                            ? await getExpenseCategory()
                            : await getIncomeCategory();
                    })
                    .catch((err) => {});
            }
        } catch (err) {
            console.log(err);
        }
    };

    const deleteCategories = async (
        tgtCategories: CategoryItem[],
        type: TransactionType
    ) => {
        try {
            if (LoginUser && tgtCategories.length > 0) {
                const deleteData = {
                    tgtCategories,
                };
                const api =
                    type === "income"
                        ? "/deleteIncomeCategory"
                        : "/deleteExpenseCategory";
                await apiClient
                    .post(api, {
                        deleteData: deleteData,
                        user_id: LoginUser.id,
                    })
                    .then((res) => {
                        type === "expense"
                            ? getExpenseCategory()
                            : getIncomeCategory();
                    })
                    .catch((err) => {});
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        // valueで設定した値をchildrenで受け取ることができる
        <CategoryContext.Provider
            value={{
                editCategory,
                deleteCategories,
                addCategories,
                sortCategories,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

// コンテキストを使用するためのカスタムフック
export const useCategoryContext = () => {
    // useContextでvalueに設定した値を取得できる
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error(
            "useCategoryContextは、AppProvider内で使用する必要があります。"
        );
    }
    return context;
};
