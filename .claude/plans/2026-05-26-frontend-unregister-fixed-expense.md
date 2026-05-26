# Frontend Fixed Expense Unregister UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 取引編集フォームの「固定収支として登録」チェックボックスをオフにして保存すると固定収支が無効化（is_active=false）されるようにする。

**Architecture:** `TransactionForm.tsx` のみを変更する。`editFixedExpense` は `FixedExpenseContext` に既存で `is_active` をサポート済み。チェックをオフにした瞬間に警告テキストを表示し、保存時に `editFixedExpense(fixedExpenseId, { is_active: false })` を呼び出す。`fixedExpenseId` が null の場合は disabled のまま（解除不可）。

**Tech Stack:** React, TypeScript, React Hook Form, MUI, FixedExpenseContext

**Working directory:** `C:\WorkSpace\FrontendHouseHoldExpenses`

**前提:** バックエンド計画（2026-05-26-backend-cleanup-and-deactivated-at.md）が完了していること。

---

### Task 1: TransactionForm.tsx — editFixedExpense を取得してチェックボックスを更新する

**Files:**
- Modify: `src/components/TransactionForm.tsx`

現在のチェックボックス部分（598行目付近）：
```tsx
const isAlreadyRegistered = selectedTransaction?.isFixedExpense === true;
return (
    <>
        <FormControlLabel
            control={
                <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isAlreadyRegistered}
                />
            }
            label="固定収支として登録（毎月自動複製）"
        />
        {isAlreadyRegistered && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
                固定収支として登録済みです
            </Typography>
        )}
    </>
);
```

- [ ] **Step 1: useFixedExpenseContext から editFixedExpense も取得する**

68行目付近の既存コード：
```tsx
const { addFixedExpense } = useFixedExpenseContext();
```

以下に変更：
```tsx
const { addFixedExpense, editFixedExpense } = useFixedExpenseContext();
```

- [ ] **Step 2: チェックボックスの render 関数を以下に置き換える**

```tsx
const isAlreadyRegistered = selectedTransaction?.isFixedExpense === true;
const canUnregister = isAlreadyRegistered && !!selectedTransaction?.fixedExpenseId;
const showUnregisterWarning = isAlreadyRegistered && !field.value;
return (
    <>
        <FormControlLabel
            control={
                <Checkbox
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isAlreadyRegistered && !canUnregister}
                />
            }
            label="固定収支として登録（毎月自動複製）"
        />
        {isAlreadyRegistered && !showUnregisterWarning && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: "block" }}>
                固定収支として登録済みです
            </Typography>
        )}
        {showUnregisterWarning && (
            <Typography variant="caption" color="warning.main" sx={{ ml: 4, display: "block" }}>
                更新すると固定収支登録が解除されます
            </Typography>
        )}
    </>
);
```

---

### Task 2: TransactionForm.tsx — onSubmit に登録解除処理を追加する

**Files:**
- Modify: `src/components/TransactionForm.tsx`

現在の onSubmit の編集時ブロック（190〜203行目付近）：
```tsx
if (data.isFixedExpense && !selectedTransaction.isFixedExpense) {
    const categoryId = categories?.find(
        (cat) => cat.label === data.category
    )?.id;
    if (categoryId !== undefined) {
        await addFixedExpense({
            type: data.type,
            category_id: categoryId,
            amount: Math.abs(data.amount),
            content: data.content ?? "",
            fixed_expense_day: parseInt(data.date.split("-")[2], 10),
        });
    }
}
setSelectedTransaction(null);
```

- [ ] **Step 1: 固定収支登録ブロックの直後（setSelectedTransaction の前）に登録解除処理を追加する**

```tsx
if (data.isFixedExpense && !selectedTransaction.isFixedExpense) {
    const categoryId = categories?.find(
        (cat) => cat.label === data.category
    )?.id;
    if (categoryId !== undefined) {
        await addFixedExpense({
            type: data.type,
            category_id: categoryId,
            amount: Math.abs(data.amount),
            content: data.content ?? "",
            fixed_expense_day: parseInt(data.date.split("-")[2], 10),
        });
    }
}
// 固定収支チェックがオフになり fixedExpenseId がある場合は無効化
if (!data.isFixedExpense && selectedTransaction.isFixedExpense && selectedTransaction.fixedExpenseId) {
    await editFixedExpense(selectedTransaction.fixedExpenseId, { is_active: false });
}
setSelectedTransaction(null);
```

- [ ] **Step 2: `npm run build` を実行してビルドエラーがないことを確認する**

```bash
npm run build
```

Expected: エラーなし

---

### 最終コミット

- [ ] **全タスク完了後にコミット**

```bash
cd C:\WorkSpace\FrontendHouseHoldExpenses
git add src/components/TransactionForm.tsx
git commit -m "feat: 取引編集フォームから固定収支登録解除に対応"
```
