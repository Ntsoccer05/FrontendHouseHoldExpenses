# 編集フォームへの固定収支登録チェックボックス追加 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 取引編集フォームに「固定収支として登録」チェックボックスを追加し、チェックを入れて保存すると自動的に固定費登録も行われるようにする。

**Architecture:** `FixedExpenseProvider` を Home ルートにも追加して `addFixedExpense` をフォーム内から利用可能にする。`TransactionForm` の `onSubmit` で編集時かつ `isFixedExpense=true` かつ未登録の場合に `addFixedExpense` を追加で呼び出す。既登録済みの取引に対してはチェックボックスを disabled にして保護する。

**Tech Stack:** React, TypeScript, React Hook Form, MUI, FixedExpenseContext

---

## ファイルマップ

| ファイル | 変更種別 | 変更内容 |
|---|---|---|
| `src/routes/router.tsx` | 変更 | Home ルートに `FixedExpenseProvider` を追加 |
| `src/components/TransactionForm.tsx` | 変更 | ①インポート追加 ②useEffect に isFixedExpense 初期値追加 ③onSubmit に固定費登録処理追加 ④チェックボックス表示条件を編集時も含めるよう変更 |

---

### Task 1: router.tsx に FixedExpenseProvider を追加

**Files:**
- Modify: `src/routes/router.tsx:44-48`

- [ ] **Step 1: Home ルートを FixedExpenseProvider でラップする**

`src/routes/router.tsx` の 44〜48 行目を以下に変更:

```tsx
element={
    <FixedExpenseProvider>
        <TransactionProvider>
            <Home />
        </TransactionProvider>
    </FixedExpenseProvider>
}
```

---

### Task 2: TransactionForm.tsx — useFixedExpenseContext のインポートと使用を追加

**Files:**
- Modify: `src/components/TransactionForm.tsx`

- [ ] **Step 1: useFixedExpenseContext のインポートを追加**

`src/components/TransactionForm.tsx` の既存インポート群（32〜36 行あたり）に追加:

```tsx
import { useFixedExpenseContext } from "../context/FixedExpenseContext";
```

- [ ] **Step 2: コンポーネント内で addFixedExpense を取得**

`src/components/TransactionForm.tsx` の `useTransactionContext` の行（66行目）の直後に追加:

```tsx
const { addFixedExpense } = useFixedExpenseContext();
```

---

### Task 3: TransactionForm.tsx — 編集時の isFixedExpense 初期値をセット

**Files:**
- Modify: `src/components/TransactionForm.tsx:244-260`

- [ ] **Step 1: selectedTransaction の useEffect に isFixedExpense の setValue を追加**

`src/components/TransactionForm.tsx` の 244〜260 行目の useEffect を以下に変更:

```tsx
useEffect(() => {
    if (selectedTransaction) {
        setValue("type", selectedTransaction.type);
        setValue("date", selectedTransaction.date);
        setValue("amount", selectedTransaction.amount);
        setValue("content", selectedTransaction.content);
        setValue("isFixedExpense", selectedTransaction.isFixedExpense ?? false);
    } else {
        reset({
            type: "expense",
            date: currentDay,
            amount: 0,
            category: categories?.[0].label,
            content: "",
            isFixedExpense: false,
        });
    }
}, [selectedTransaction]);
```

---

### Task 4: TransactionForm.tsx — onSubmit に固定費登録処理を追加

**Files:**
- Modify: `src/components/TransactionForm.tsx:183-222`

- [ ] **Step 1: 編集時 onSubmit の then ブロックに固定費登録を追加**

`src/components/TransactionForm.tsx` の 183〜222 行目の `onSubmit` を以下に変更:

```tsx
const onSubmit: SubmitHandler<Schema> = async(data) => {
    if (selectedTransaction) {
        await onUpdateTransaction(data, selectedTransaction.id)
            .then(async () => {
                // 固定収支チェックが入っており、かつ未登録の場合のみ登録
                if (data.isFixedExpense && !selectedTransaction.isFixedExpense) {
                    const matchedCategory = categories?.find(
                        (cat) => cat.label === data.category
                    );
                    const categoryId = matchedCategory?.id;
                    if (categoryId !== undefined) {
                        await addFixedExpense({
                            type: data.type,
                            category_id: categoryId,
                            amount: Math.abs(data.amount),
                            content: data.content ?? "",
                            fixed_expense_day: new Date(data.date).getDate(),
                        });
                    }
                }
                setSelectedTransaction(null);
                showSnackBar({
                    title: "更新完了",
                    bodyText: "家計簿が更新されました。",
                    backgroundColor: "#00695c"
                });
                if (isMobile) {
                    setIsDialogOpen(false);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    } else {
        await onSaveTransaction(data)
            .then(() => {
                showSnackBar({
                    title: "保存完了",
                    bodyText: "家計簿が登録されました。",
                    backgroundColor: "#2e7d32"
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }
    reset({
        type: currentType,
        date: currentDay,
        amount: 0,
        category: selectedLabel,
        content: "",
        isFixedExpense: false,
    });
};
```

---

### Task 5: TransactionForm.tsx — チェックボックス表示条件を編集時も含めるよう変更

**Files:**
- Modify: `src/components/TransactionForm.tsx:578-595`

- [ ] **Step 1: チェックボックスブロックを以下に置き換える**

`src/components/TransactionForm.tsx` の 578〜595 行目を以下に変更:

```tsx
{/* 固定収支チェックボックス（新規・編集・収入・支出すべてで表示） */}
<Controller
    name="isFixedExpense"
    control={control}
    render={({ field }) => {
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
    }}
/>
```

---

### 最終コミット

- [ ] **全タスク完了後にコミット**

```bash
git add src/routes/router.tsx src/components/TransactionForm.tsx
git commit -m "feat: 取引編集フォームに固定収支として登録チェックボックスを追加"
```
