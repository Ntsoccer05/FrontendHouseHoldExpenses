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
