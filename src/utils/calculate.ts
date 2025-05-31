export const safeEvaluate = (expression: string): number | null => {
  try {
    // 安全な文字だけに制限（数字・小数点・+-*/() のみ）
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) return null;

    const result = Function(`"use strict"; return (${expression})`)();
    return isFinite(result) ? result : null;
  } catch {
    return null;
  }
};