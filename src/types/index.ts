export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};

export type Provider = "google" | "github" | undefined;
export type OAuthParams = {
    code: string;
    state: string;
};

export type TransactionType = "income" | "expense";
export type IncomeCategory = "給与" | "副収入" | "お小遣い";
export type ExpenseCategory =
    | "食費"
    | "日用品"
    | "住居費"
    | "交際費"
    | "娯楽"
    | "交通費";

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    content: string;
    type: TransactionType;
    category: string;
    icon?: string;
}
export interface TransactionData {
    date: string;
    amount: number;
    content: string;
    type: TransactionType;
    category: string;
    icon?: string;
}

export interface Balance {
    income: number;
    expense: number;
    balance: number;
}

export interface CalendarContent {
    start: string;
    income: string;
    expense: string;
    balance: string;
}

export interface LoginUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: Date;
    password: string;
    remember_token: string;
    created_at: Date;
    updated_at: Date;
}
export interface BaseUserCategory {
    content: string;
    created_at: Date;
    id: number;
    filtered_id: number;
    type_id: number;
    icon: string;
    deleted: number;
    updated_at: Date;
}

export interface CategoryItem {
    id?: number;
    filtered_id?: number;
    label: string;
    icon: string;
}

export interface CheckBoxItem {
    key: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    onStateChange: (checked?: boolean, key?: string) => void;
}
