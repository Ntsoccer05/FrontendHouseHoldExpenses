import { useCallback, useState } from "react";
import {
    getSessionStorage,
    setSessionStorage,
} from "../utils/manageSessionStorage";

/**
 * useState と sessionStorage を組み合わせたカスタムフック。
 * 初期値はセッションストレージから復元し、値が変わるたびに自動保存する。
 *
 * @param key           sessionStorage のキー
 * @param defaultValue  ストレージに値がない場合のデフォルト値
 * @param fromStorage   ストレージから取り出した値を T に変換する関数（省略可）
 */
export function useSessionState<T>(
    key: string,
    defaultValue: T,
    fromStorage?: (stored: unknown) => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        const stored = getSessionStorage(key);
        if (stored === null || stored === undefined) return defaultValue;
        return fromStorage ? fromStorage(stored) : (stored as T);
    });

    const setPersisted = useCallback<React.Dispatch<React.SetStateAction<T>>>(
        (value) => {
            setState((prev) => {
                const next =
                    typeof value === "function"
                        ? (value as (prev: T) => T)(prev)
                        : value;
                setSessionStorage(key, next);
                return next;
            });
        },
        [key]
    );

    return [state, setPersisted];
}
