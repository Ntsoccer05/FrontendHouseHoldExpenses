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
    isFixedExpense?: boolean;
    fixedExpenseId?: number | null;
}
export interface TransactionData {
    date: string;
    amount: number;
    content: string;
    type: TransactionType;
    category: string;
    icon?: string;
    isFixedExpense?: boolean;
    fixedExpenseDay?: number;
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
    email_verified_at?: Date;
    password?: string;
    remember_token?: string;
    created_at?: Date;
    updated_at?: Date;
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

export interface SnackBarState {
  open: boolean;
  vertical: "top" | "bottom";
  horizontal: "left" | "center" | "right";
  title: string;
  bodyText: string;
  backgroundColor: string;
  autoHideDuration: number;
}

export interface FixedExpense {
    id: number;
    user_id: number;
    type_id: number;
    category_id: number;
    amount: number;
    content: string;
    fixed_expense_day: number;
    is_active: boolean;
    last_replicated_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FixedExpenseFormData {
    type: TransactionType;
    category_id: number;
    amount: number;
    content: string;
    fixed_expense_day: number;
}

export interface SplitGroup {
    id: number;
    label: string;
    is_active: boolean;
    setting: SplitGroupSetting | null;
    category_overrides: SplitGroupCategoryOverride[];
}

export interface SplitGroupSetting {
    income_other_ratio: number | null;
    expense_other_ratio: number | null;
}

export interface SplitGroupCategoryOverride {
    category_id: number;
    type_id: number;
    other_ratio: number;
}

export interface SplitGroupFormData {
    label: string;
}

export interface SplitPreview {
    group_label: string;
    month: string;
    income?: {
        total: number;
        self: number;
        other: number;
        self_ratio: number;
        other_ratio: number;
    };
    expense?: {
        total: number;
        self: number;
        other: number;
        self_ratio: number;
        other_ratio: number;
    };
    balance?: {
        total: number;
        self: number;
        other: number;
    };
}
