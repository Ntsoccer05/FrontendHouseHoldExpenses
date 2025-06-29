import { Transaction, Balance } from "../types";
import { returnMonth } from "./formatting";

//収入、支出、残高、の合計金額を求める関数
export function financeCalculations(transactions: Transaction[]): Balance {
    // reduceメソッドの第二引数は初期値
    // reduceメソッドのaccは累積値
    return transactions.reduce(
        (acc, transaction) => {
            if (transaction.type === "income") {
                acc.income += transaction.amount;
            } else {
                acc.expense += transaction.amount;
            }
            acc.balance = acc.income - acc.expense;

            return acc;
        },
        { income: 0, expense: 0, balance: 0 },
    );
}

//日付ごとの収支を計算する関数💰
// Record<string, Balance>はRecord<キー, バリュー>の型定義をしている
export function calculateDailyBalances(
    transactions: Transaction[],
): Record<string, Balance> {
    return transactions.reduce<Record<string, Balance>>((acc, transaction) => {
        const day = transaction.date;
        if (!acc[day]) {
            // 新たにキーが日付のオブジェクトを生成
            acc[day] = { income: 0, expense: 0, balance: 0 };
        }

        if (transaction.type === "income") {
            acc[day].income += transaction.amount;
        } else {
            acc[day].expense += transaction.amount;
        }

        acc[day].balance = acc[day].income - acc[day].expense;
        return acc;
    }, {});
}

//月ごとの収支を計算する関数💰
// Record<string, Balance>はRecord<キー, バリュー>の型定義をしている
export function calculateMonthlyBalances(
    transactions: Transaction[],
): Record<string, Balance> {
    return transactions.reduce<Record<string, Balance>>((acc, transaction) => {
        const day = transaction.date;
        const month = returnMonth(day);
        if (!acc[month]) {
            // 新たにキーが月のオブジェクトを生成
            acc[month] = { income: 0, expense: 0, balance: 0 };
        }

        if (transaction.type === "income") {
            acc[month].income += transaction.amount;
        } else {
            acc[month].expense += transaction.amount;
        }

        acc[month].balance = acc[month].income - acc[month].expense;
        return acc;
    }, {});
}

// 比較データの計算
export interface ComparisonData {
    current: Balance;
    previous: Balance;
    changeRates: {
        income: number;
        expense: number;
        balance: number;
    };
}

export function calculateComparison(
    currentTransactions: Transaction[],
    previousTransactions: Transaction[]
): ComparisonData {
    const current = financeCalculations(currentTransactions);
    const previous = financeCalculations(previousTransactions);

    const calculateChangeRate = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    return {
        current,
        previous,
        changeRates: {
            income: calculateChangeRate(current.income, previous.income),
            expense: calculateChangeRate(current.expense, previous.expense),
            balance: calculateChangeRate(current.balance, previous.balance),
        }
    };
}

// カテゴリ別比較データの計算
export interface CategoryComparison {
    category: string;
    current: number;
    previous: number;
    changeRate: number;
    hasCurrentData: boolean;
    hasPreviousData: boolean;
}

export function calculateCategoryComparison(
    currentTransactions: Transaction[],
    previousTransactions: Transaction[],
    transactionType: TransactionType
): CategoryComparison[] {
    const currentCategories = calculateCategoryBalances(currentTransactions, transactionType);
    const previousCategories = calculateCategoryBalances(previousTransactions, transactionType);

    // 全カテゴリを統合
    const allCategories = Array.from(new Set([
        ...Object.keys(currentCategories),
        ...Object.keys(previousCategories)
    ]));

    return allCategories.map(category => {
        const current = currentCategories[category] || 0;
        const previous = previousCategories[category] || 0;
        
        const calculateChangeRate = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return {
            category,
            current,
            previous,
            changeRate: calculateChangeRate(current, previous),
            hasCurrentData: current > 0,
            hasPreviousData: previous > 0,
        };
    }).filter(item => item.hasCurrentData || item.hasPreviousData);
}

// 期間のフォーマット関数
export function formatPeriodLabel(
  selectedYear: Date,
  selectedMonth?: Date,
  viewType: 'monthly' | 'yearly' = 'monthly'
): { current: string; previous: string } {
  if (viewType === 'monthly' && selectedMonth) {
    const currentDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth());
    const previousDate = new Date(currentDate);
    previousDate.setMonth(currentDate.getMonth() - 1);

    return {
      current: `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`,
      previous: `${previousDate.getFullYear()}年${previousDate.getMonth() + 1}月`
    };
  } else {
    const currentYear = selectedYear.getFullYear();
    return {
      current: `${currentYear}年`,
      previous: `${currentYear - 1}年`
    };
  }
}

// カテゴリ別残高を計算する関数
export function calculateCategoryBalances(
    transactions: Transaction[],
    transactionType?: TransactionType
): Record<string, number> {
    return transactions.reduce<Record<string, number>>((acc, transaction) => {
        // transactionTypeが指定されている場合は、そのタイプのみを処理
        if (transactionType && transaction.type !== transactionType) {
            return acc;
        }

        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});
}

