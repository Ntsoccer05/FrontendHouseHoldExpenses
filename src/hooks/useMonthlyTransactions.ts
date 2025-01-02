import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Transaction } from "../types";
import { formatMonth } from "../utils/formatting";

const useMonthlyTransactions = (): Transaction[] => {
    const { transactions, currentMonth } = useAppContext();

    // useMemoで[transactions, currentMonth]が変更された時のみ実行
    const monthlyTransactions = useMemo(() => {
        return transactions.filter((transaction) =>
            transaction.date.startsWith(formatMonth(currentMonth))
        );
    }, [transactions, currentMonth]);

    return monthlyTransactions;
};

export default useMonthlyTransactions;
