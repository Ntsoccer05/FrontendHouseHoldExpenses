import { format } from "date-fns";

//日付の形式を変換する関数
export function formatMonth(date: Date): string {
    return format(date, "yyyy-MM");
}
export function formatJPMonth(date: Date): string {
    return format(date, "yyyy年MM月");
}
/**
 * 日付文字列を日本語形式（yyyy年mm月dd日）に変換
 * @param dateString - YYYY-MM-DD形式の日付文字列
 * @returns yyyy年mm月dd日形式の文字列
 */
export const formatJPDay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      return dateString; // 無効な場合は元の文字列を返す
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0ベースなので+1
    const day = date.getDate();
    
    return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`;
  } catch (error) {
    console.error('formatJPDay error:', error);
    return dateString; // エラーの場合は元の文字列を返す
  }
};
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
