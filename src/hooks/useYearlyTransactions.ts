import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Transaction } from "../types";
import { formatYear } from "../utils/formatting";

const useYearlyTransactions = (): Transaction[] => {
    const { transactions, currentYear } = useAppContext();

    // useMemoで[transactions, currentYear]が変更された時のみ実行
    const yearlyTransactions = useMemo(() => {
        return transactions.filter((transaction) =>
            transaction.date.startsWith(formatYear(currentYear))
        );
    }, [transactions, currentYear]);

    return yearlyTransactions;
};

export default useYearlyTransactions;
