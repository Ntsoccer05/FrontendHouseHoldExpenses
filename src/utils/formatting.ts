import { format } from "date-fns";

//日付の形式を変換する関数
export function formatMonth(date: Date): string {
    return format(date, "yyyy-MM");
}
export function formatJPMonth(date: Date): string {
    return format(date, "yyyy年MM月");
}
export function formatYear(date: Date): string {
    return format(date, "yyyy");
}
export function formatJPYear(date: Date): string {
    return format(date, "yyyy年");
}
export function returnMonth(date: Date): string {
    return format(date, "MM");
}

//日本円に変換する関数
// 1000 → 1,000 と表示
export function formatCurrency(amount: number): string {
    return amount.toLocaleString("ja-JP");
}

// 全角数値・記号を半角にする
export const toHalfWidth = (str: string) => {
    return str
        .replace(/[\uFF01-\uFF5E]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)
        )
        .replace(/\u3000/g, " ") // 全角スペース → 半角
        .replace(/ー/g, "-");    // 長音記号 → ハイフン
}
