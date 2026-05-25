# Fixed Income Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 固定費管理ページで収入（固定収益）も登録・表示できるようにする。

**Architecture:** フォームに収入/支出トグルを追加し、選択した種別に応じたカテゴリを表示する。バックエンドでは `type` 文字列を受け取り `type_id` に変換して保存。一覧にも種別チップ列を追加する。

**Tech Stack:** React + TypeScript + MUI, Laravel (PHP), Zod, React Hook Form

---

## ファイルマップ

| ファイル | 変更内容 |
|---|---|
| `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\StoreFixedExpenseRequest.php` | `type` バリデーション追加 |
| `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\UpdateFixedExpenseRequest.php` | `type` バリデーション追加（optional） |
| `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Controllers\FixedExpenseController.php` | `store`/`update` で `type` → `type_id` 変換 |
| `c:\WorkSpace\FrontendHouseHoldExpenses\src\types\index.ts` | `FixedExpenseFormData` に `type` 追加 |
| `c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseForm.tsx` | 種別トグル追加、カテゴリ切り替え対応 |
| `c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseList.tsx` | 種別チップ列追加 |

---

### Task 1: バックエンド — `type` バリデーションと `type_id` 変換

**Files:**
- Modify: `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\StoreFixedExpenseRequest.php`
- Modify: `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\UpdateFixedExpenseRequest.php`
- Modify: `c:\WorkSpace\HouseHoldExpenses\src\app\Http\Controllers\FixedExpenseController.php`

- [ ] **Step 1: StoreFixedExpenseRequest に `type` を追加**

```php
// c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\StoreFixedExpenseRequest.php
public function rules(): array
{
    return [
        'type'              => 'required|in:income,expense',
        'category_id'       => 'required|integer',
        'amount'            => 'required|integer|min:1',
        'content'           => 'required|string|max:255',
        'fixed_expense_day' => 'required|integer|min:1|max:31',
    ];
}
```

- [ ] **Step 2: UpdateFixedExpenseRequest に `type` を追加（optional）**

```php
// c:\WorkSpace\HouseHoldExpenses\src\app\Http\Requests\UpdateFixedExpenseRequest.php
public function rules(): array
{
    return [
        'type'              => 'sometimes|in:income,expense',
        'category_id'       => 'sometimes|integer',
        'amount'            => 'sometimes|integer|min:1',
        'content'           => 'sometimes|string|max:255',
        'fixed_expense_day' => 'sometimes|integer|min:1|max:31',
        'is_active'         => 'sometimes|boolean',
    ];
}
```

- [ ] **Step 3: FixedExpenseController の `store` で `type` → `type_id` 変換**

```php
// c:\WorkSpace\HouseHoldExpenses\src\app\Http\Controllers\FixedExpenseController.php
public function store(StoreFixedExpenseRequest $request)
{
    $typeId = $request->type === 'income'
        ? config('app.income_type_id')
        : config('app.expense_type_id');

    $fixedExpense = new FixedExpense();
    $fixedExpense->user_id           = $request->user()->id;
    $fixedExpense->type_id           = $typeId;
    $fixedExpense->category_id       = $request->category_id;
    $fixedExpense->amount            = $request->amount;
    $fixedExpense->content           = $request->content;
    $fixedExpense->fixed_expense_day = $request->fixed_expense_day;
    $fixedExpense->save();
    return response()->json(['status' => 200, 'message' => '固定費を作成しました', 'fixedExpense' => $fixedExpense]);
}
```

- [ ] **Step 4: FixedExpenseController の `update` で `type` → `type_id` 変換**

```php
// c:\WorkSpace\HouseHoldExpenses\src\app\Http\Controllers\FixedExpenseController.php
public function update(UpdateFixedExpenseRequest $request, FixedExpense $fixedExpense)
{
    if ($fixedExpense->user_id !== $request->user()->id) {
        return response()->json(['status' => 403, 'message' => '権限がありません'], 403);
    }
    $fixedExpense->fill($request->only(['category_id', 'amount', 'content', 'fixed_expense_day', 'is_active']));
    if ($request->has('type')) {
        $fixedExpense->type_id = $request->type === 'income'
            ? config('app.income_type_id')
            : config('app.expense_type_id');
    }
    $fixedExpense->save();
    return response()->json(['status' => 200, 'message' => '固定費を更新しました', 'fixedExpense' => $fixedExpense]);
}
```

---

### Task 2: フロントエンド型定義 — `FixedExpenseFormData` に `type` を追加

**Files:**
- Modify: `c:\WorkSpace\FrontendHouseHoldExpenses\src\types\index.ts:127-133`

- [ ] **Step 1: `FixedExpenseFormData` に `type` フィールドを追加**

```ts
// src/types/index.ts の FixedExpenseFormData を下記に置き換える
export interface FixedExpenseFormData {
    type: TransactionType;
    category_id: number;
    amount: number;
    content: string;
    fixed_expense_day: number;
}
```

- [ ] **Step 2: 型チェックが通ることを確認**

```bash
cd c:\WorkSpace\FrontendHouseHoldExpenses
npx tsc --noEmit
```

Expected: エラーなし（`FixedExpenseContext` の `addFixedExpense`/`editFixedExpense` は `FixedExpenseFormData` をそのまま API に渡すため変更不要）

---

### Task 3: フォームコンポーネント — 種別トグルとカテゴリ切り替え

**Files:**
- Modify: `c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseForm.tsx`

変更の概要:
- Zod スキーマに `type` フィールドを追加
- MUI `ToggleButtonGroup` で収入/支出を選択
- `watch('type')` で現在の種別を取得し、対応するカテゴリ一覧を表示
- 種別変更時に `category_id` を 0 にリセット
- 編集時: `editTarget.type_id === 1` なら `'income'`、それ以外は `'expense'` で初期化

- [ ] **Step 1: `FixedExpenseForm.tsx` を完全に置き換える**

```tsx
// c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseForm.tsx
import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FixedExpense, FixedExpenseFormData } from "../types";
import { useAppContext } from "../context/AppContext";

const toHalfWidth = (value: string) =>
    value.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

const fixedExpenseSchema = z.object({
    type: z.enum(["income", "expense"]),
    category_id: z
        .number({ invalid_type_error: "カテゴリを選択してください" })
        .int()
        .positive("カテゴリを選択してください"),
    amount: z
        .number({ invalid_type_error: "金額を入力してください" })
        .int()
        .min(1, "金額を入力してください"),
    content: z.string().min(1, "内容を入力してください").max(255),
    fixed_expense_day: z
        .number({ invalid_type_error: "1〜31の数値を入力してください" })
        .int()
        .min(1, "1〜31の数値を入力してください")
        .max(31, "1〜31の数値を入力してください"),
});

type FixedExpenseFormInputs = z.infer<typeof fixedExpenseSchema>;

interface FixedExpenseFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FixedExpenseFormData) => Promise<void>;
    editTarget?: FixedExpense | null;
}

export const FixedExpenseForm = ({
    open,
    onClose,
    onSubmit,
    editTarget,
}: FixedExpenseFormProps) => {
    const { ExpenseCategories, IncomeCategories } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FixedExpenseFormInputs>({
        resolver: zodResolver(fixedExpenseSchema),
        defaultValues: { type: "expense", category_id: 0, amount: 0, content: "", fixed_expense_day: 1 },
    });

    const selectedType = watch("type");
    const fixedExpenseDay = watch("fixed_expense_day");
    const showWarning = fixedExpenseDay >= 29;
    const categories = selectedType === "income" ? IncomeCategories : ExpenseCategories;

    useEffect(() => {
        if (editTarget) {
            reset({
                type: editTarget.type_id === 1 ? "income" : "expense",
                category_id: editTarget.category_id,
                amount: editTarget.amount,
                content: editTarget.content,
                fixed_expense_day: editTarget.fixed_expense_day,
            });
        } else {
            reset({ type: "expense", category_id: 0, amount: 0, content: "", fixed_expense_day: 1 });
        }
    }, [editTarget, reset]);

    const handleFormSubmit = async (data: FixedExpenseFormInputs) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{editTarget ? "固定費・収益を編集" : "固定費・収益を追加"}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {/* 種別トグル */}
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <ToggleButtonGroup
                                value={field.value}
                                exclusive
                                onChange={(_, newType) => {
                                    if (newType) {
                                        field.onChange(newType);
                                        setValue("category_id", 0);
                                    }
                                }}
                                fullWidth
                                size="small"
                            >
                                <ToggleButton value="expense" color="error">
                                    支出
                                </ToggleButton>
                                <ToggleButton value="income" color="primary">
                                    収入
                                </ToggleButton>
                            </ToggleButtonGroup>
                        )}
                    />
                    {/* カテゴリ */}
                    <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                            <FormControl error={!!errors.category_id}>
                                <InputLabel>カテゴリ</InputLabel>
                                <Select {...field} label="カテゴリ">
                                    {(categories ?? []).map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id ?? 0}>
                                            {cat.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.category_id && (
                                    <Typography color="error" variant="caption">
                                        {errors.category_id.message}
                                    </Typography>
                                )}
                            </FormControl>
                        )}
                    />
                    {/* 金額 */}
                    <Controller
                        name="amount"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="金額"
                                type="text"
                                inputMode="numeric"
                                value={field.value === 0 ? "" : field.value}
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                                onChange={(e) => {
                                    const half = toHalfWidth(e.target.value);
                                    const num = Number(half);
                                    field.onChange(isNaN(num) ? field.value : num);
                                }}
                            />
                        )}
                    />
                    {/* 内容 */}
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="内容"
                                error={!!errors.content}
                                helperText={errors.content?.message}
                            />
                        )}
                    />
                    {/* 実行日 */}
                    <Controller
                        name="fixed_expense_day"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="毎月の実行日（日付）"
                                type="text"
                                inputMode="numeric"
                                value={field.value === 0 ? "" : field.value}
                                error={!!errors.fixed_expense_day}
                                helperText={errors.fixed_expense_day?.message ?? "1〜31日から選択"}
                                onChange={(e) => {
                                    const half = toHalfWidth(e.target.value);
                                    const num = Number(half);
                                    field.onChange(isNaN(num) ? field.value : num);
                                }}
                                onBlur={() => {
                                    if (!field.value || field.value < 1) field.onChange(1);
                                    field.onBlur();
                                }}
                            />
                        )}
                    />
                    {showWarning && (
                        <Alert severity="warning">
                            存在しない日付の月は末日に自動調整されます
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>キャンセル</Button>
                <LoadingButton
                    onClick={handleSubmit(handleFormSubmit)}
                    variant="contained"
                    color={selectedType === "income" ? "primary" : "error"}
                    loading={isSubmitting}
                >
                    保存
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};
```

- [ ] **Step 2: 型チェックが通ることを確認**

```bash
cd c:\WorkSpace\FrontendHouseHoldExpenses
npx tsc --noEmit
```

Expected: エラーなし

---

### Task 4: 一覧コンポーネント — 種別チップ列の追加

**Files:**
- Modify: `c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseList.tsx`

変更の概要:
- テーブルヘッダーに「種別」列を追加
- `type_id === 1` → `primary` カラーの「収入」チップ
- `type_id !== 1` → `error` カラーの「支出」チップ
- 空データ時のメッセージも「固定費・収益が登録されていません」に変更

- [ ] **Step 1: `FixedExpenseList.tsx` を完全に置き換える**

```tsx
// c:\WorkSpace\FrontendHouseHoldExpenses\src\components\FixedExpenseList.tsx
import React, { useState } from "react";
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { FixedExpense } from "../types";

interface FixedExpenseListProps {
    fixedExpenses: FixedExpense[];
    onEdit: (fixedExpense: FixedExpense) => void;
    onDelete: (id: number) => Promise<void>;
}

export const FixedExpenseList = ({
    fixedExpenses,
    onEdit,
    onDelete,
}: FixedExpenseListProps) => {
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteConfirm = async () => {
        if (deleteTarget !== null) {
            setIsDeleting(true);
            try {
                await onDelete(deleteTarget);
                setDeleteTarget(null);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (fixedExpenses.length === 0) {
        return (
            <Typography color="text.secondary">
                固定費・収益が登録されていません
            </Typography>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>種別</TableCell>
                            <TableCell>内容</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>実行日</TableCell>
                            <TableCell>状態</TableCell>
                            <TableCell align="center">操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fixedExpenses.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Chip
                                        label={item.type_id === 1 ? "収入" : "支出"}
                                        color={item.type_id === 1 ? "primary" : "error"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{item.content}</TableCell>
                                <TableCell align="right">
                                    ¥{item.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>毎月{item.fixed_expense_day}日</TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.is_active ? "有効" : "無効"}
                                        color={item.is_active ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" onClick={() => onEdit(item)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => setDeleteTarget(item.id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteTarget !== null} onClose={() => !isDeleting && setDeleteTarget(null)}>
                <DialogTitle>削除しますか？</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        この固定費・収益を削除します。過去に登録済みのデータには影響しません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                        キャンセル
                    </Button>
                    <LoadingButton
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        loading={isDeleting}
                    >
                        削除
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
};
```

- [ ] **Step 2: 型チェックが通ることを確認**

```bash
cd c:\WorkSpace\FrontendHouseHoldExpenses
npx tsc --noEmit
```

Expected: エラーなし

---

### Final Commit

- [ ] **バックエンドをコミット**

```bash
cd c:\WorkSpace\HouseHoldExpenses
git add src/app/Http/Requests/StoreFixedExpenseRequest.php
git add src/app/Http/Requests/UpdateFixedExpenseRequest.php
git add src/app/Http/Controllers/FixedExpenseController.php
git commit -m "feat: 固定費管理に収入種別を追加（type フィールド対応）"
```

- [ ] **フロントエンドをコミット**

```bash
cd c:\WorkSpace\FrontendHouseHoldExpenses
git add src/types/index.ts
git add src/components/FixedExpenseForm.tsx
git add src/components/FixedExpenseList.tsx
git commit -m "feat: 固定費管理に収益（固定収入）登録・表示機能を追加"
```
