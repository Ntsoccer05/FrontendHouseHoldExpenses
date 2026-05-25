# Category D&D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カテゴリ編集ページの D&D 並び替えを再設計し、「並び替え後のインデックスずれ」バグを根絶する。

**Architecture:** `CategoryEditForm` の状態をインデックスベースの並列配列から `LocalItem[]`（id キーのオブジェクト配列）に一本化。編集モード中は API を一切呼ばず、保存ボタン押下時に `sortCategories` + `editCategory` を一括送信する。ドラッグハンドルを行全体から専用セルに分離し、TextField・Select との競合を排除する。

**Tech Stack:** React 18, TypeScript, MUI, dnd-kit/core v6, dnd-kit/sortable v8

**Spec:** `.claude/specs/2026-05-25-category-dnd-redesign.md`

---

## Task 1: Category.tsx — 不要な state・props の除去と selection の修正

**Files:**
- Modify: `src/pages/Category.tsx`

### 変更の概要

| 削除対象 | 箇所 |
|---------|------|
| `swichedCategory` state + setter + effect | `useState`, `setSwichedCategory(false)`, `useEffect([type])` |
| `deleted` state + setter | `useState`, `setDeleted(true)` |
| CategoryEditForm への不要 props | `swichedCategory`, `setCategories`, `deleted`, `setDeleted` |
| `selected` の値を `filtered_id` → `id` に変更 | `handleSelectAllClick`, `onDeleteCategories` |

---

- [ ] **Step 1: `swichedCategory` を削除する**

`src/pages/Category.tsx` の以下を削除する。

削除対象①（state 宣言）:
```ts
const [swichedCategory, setSwichedCategory] = useState<boolean>(false);
```

削除対象②（`doSwitchType` 内の呼び出し）:
```ts
setSwichedCategory(false);
```

削除対象③（useEffect）:
```ts
useEffect(() => {
    setSwichedCategory(true);
}, [type]);
```

- [ ] **Step 2: `deleted` を削除する**

削除対象①（state 宣言）:
```ts
const [deleted, setDeleted] = useState(false);
```

削除対象②（`onDeleteCategories` 内の呼び出し）:
```ts
setDeleted(true);
```

- [ ] **Step 3: `handleSelectAllClick` で `id` を使うように変更する**

変更前:
```ts
const newSelected =
    categories && categories.map((n) => n.filtered_id);
setSelected(newSelected as number[]);
```

変更後:
```ts
const newSelected =
    categories && categories.map((n) => n.id);
setSelected(newSelected as number[]);
```

- [ ] **Step 4: `onDeleteCategories` で `id` を使うように変更する**

変更前:
```ts
const tgtCategories = categories?.filter((category, index) => {
    return selected.includes(category.filtered_id as number);
}) as CategoryItem[];
```

変更後:
```ts
const tgtCategories = categories?.filter((category) => {
    return selected.includes(category.id as number);
}) as CategoryItem[];
```

- [ ] **Step 5: `CategoryEditForm` への props から不要なものを削除する**

変更前:
```tsx
<CategoryEditForm
    edited={edited}
    type={type}
    categories={categories}
    selected={selected}
    swichedCategory={swichedCategory}
    setSelected={setSelected}
    setCategories={setCategories}
    added={added}
    deleted={deleted}
    setAdded={setAdded}
    setEdited={setEdited}
    setDeleted={setDeleted}
    isSaving={isSaving}
    setIsSaving={setIsSaving}
    onSortChanged={() => setHasSortChanged(true)}
/>
```

変更後:
```tsx
<CategoryEditForm
    edited={edited}
    type={type}
    categories={categories}
    selected={selected}
    setSelected={setSelected}
    added={added}
    setAdded={setAdded}
    setEdited={setEdited}
    isSaving={isSaving}
    setIsSaving={setIsSaving}
    onSortChanged={() => setHasSortChanged(true)}
/>
```

---

## Task 2: CategoryEditForm.tsx — 全面書き直し

**Files:**
- Modify: `src/components/CategoryEditForm.tsx`

以下の完全なコードで `src/components/CategoryEditForm.tsx` を置き換える。

---

- [ ] **Step 1: ファイル全体を以下のコードに置き換える**

```tsx
import * as React from "react";
import { useRef } from "react";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import {
    FormControl,
    ListItemIcon,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from "@mui/material";
import { CategoryItem } from "../types";
import { useState } from "react";
import DynamicIcon from "./common/DynamicIcon";
import { expenseMuiIcons, incomeMuiIcons } from "../config/CategoryIcon";
import { useCategoryContext } from "../context/CategoryContext";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type LocalItem = {
    id: number;
    label: string;
    icon: string;
};

const toLocalItems = (categories: CategoryItem[] | undefined): LocalItem[] =>
    categories?.filter((c) => c.id !== undefined).map((c) => ({
        id: c.id!,
        label: c.label,
        icon: c.icon,
    })) ?? [];

const toCategories = (items: LocalItem[]): CategoryItem[] =>
    items.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        filtered_id: 0,
    }));

interface CategoryEditProps {
    edited: boolean;
    type: "income" | "expense";
    categories: CategoryItem[] | undefined;
    selected: readonly number[];
    added: boolean;
    isSaving: boolean;
    setSelected: React.Dispatch<React.SetStateAction<readonly number[]>>;
    setAdded: React.Dispatch<React.SetStateAction<boolean>>;
    setEdited: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
    onSortChanged?: () => void;
}

const SortableRow = ({
    id,
    children,
}: {
    id: number;
    children: React.ReactNode;
}) => {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id });
    return (
        <TableRow
            ref={setNodeRef}
            {...attributes}
            sx={{ opacity: isDragging ? 0.3 : 1 }}
        >
            <TableCell
                padding="checkbox"
                align="center"
                {...listeners}
                sx={{ cursor: "grab" }}
            >
                <DragHandleIcon />
            </TableCell>
            {children}
        </TableRow>
    );
};

const CategoryEditForm = React.memo(
    ({
        edited,
        type,
        categories,
        selected,
        added,
        isSaving,
        setSelected,
        setAdded,
        setEdited,
        setIsSaving,
        onSortChanged,
    }: CategoryEditProps) => {
        const { editCategory, sortCategories } = useCategoryContext();

        const [localItems, setLocalItems] = useState<LocalItem[]>([]);
        const originalItemsRef = useRef<LocalItem[]>([]);
        // stale closure 回避: effect 内で最新の localItems/categories を読む
        const localItemsRef = useRef<LocalItem[]>(localItems);
        localItemsRef.current = localItems;
        const categoriesRef = useRef(categories);
        categoriesRef.current = categories;

        const sensors = useSensors(
            useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
            useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
        );

        // 編集開始時のみ localItems を初期化（編集中の categories 変化は無視）
        React.useEffect(() => {
            if (edited) {
                const items = toLocalItems(categoriesRef.current);
                setLocalItems(items);
                originalItemsRef.current = items;
            }
        }, [edited]);

        // 非編集・非保存時のみ categories → localItems を同期
        // （バグ根本の排除: 編集中に categories が変化しても上書きしない）
        React.useEffect(() => {
            if (!edited && !isSaving) {
                setLocalItems(toLocalItems(categories));
            }
        }, [categories, edited, isSaving]);

        // 編集中にカテゴリが追加された場合、編集モードを終了
        React.useEffect(() => {
            if (added) {
                if (edited) setEdited(false);
                setAdded(false);
            }
        }, [added]);

        // 保存: isSaving が true になったとき一括送信
        React.useEffect(() => {
            if (!isSaving) return;
            const save = async () => {
                const items = localItemsRef.current;
                await sortCategories(toCategories(items), type);
                const changedItems = items.filter((item) => {
                    const original = originalItemsRef.current.find(
                        (o) => o.id === item.id,
                    );
                    return (
                        original &&
                        (original.label !== item.label ||
                            original.icon !== item.icon)
                    );
                });
                await Promise.all(
                    changedItems.map((item) =>
                        editCategory({
                            id: item.id,
                            content: item.label,
                            icon: item.icon,
                            type,
                        }),
                    ),
                );
                setIsSaving(false);
            };
            save();
        }, [isSaving]);

        const handleDragEnd = (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const oldIndex = localItems.findIndex(
                (item) => item.id === Number(active.id),
            );
            const newIndex = localItems.findIndex(
                (item) => item.id === Number(over.id),
            );
            if (oldIndex !== -1 && newIndex !== -1) {
                setLocalItems((prev) => arrayMove(prev, oldIndex, newIndex));
                onSortChanged?.();
            }
        };

        const handleLabelChange = (index: number, value: string) => {
            setLocalItems((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, label: value } : item,
                ),
            );
        };

        const handleIconChange = (index: number, value: string) => {
            setLocalItems((prev) =>
                prev.map((item, i) =>
                    i === index ? { ...item, icon: value } : item,
                ),
            );
        };

        const handleClick = (
            event: React.MouseEvent<unknown>,
            id: number,
        ) => {
            const selectedIndex = selected.indexOf(id);
            let newSelected: readonly number[] = [];
            if (selectedIndex === -1) {
                newSelected = newSelected.concat(selected, id);
            } else if (selectedIndex === 0) {
                newSelected = newSelected.concat(selected.slice(1));
            } else if (selectedIndex === selected.length - 1) {
                newSelected = newSelected.concat(selected.slice(0, -1));
            } else if (selectedIndex > 0) {
                newSelected = newSelected.concat(
                    selected.slice(0, selectedIndex),
                    selected.slice(selectedIndex + 1),
                );
            }
            setSelected(newSelected);
        };

        const isSelected = (id: number) => selected.indexOf(id) !== -1;

        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={localItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <TableBody>
                        {localItems.map((item, index) => {
                            const isItemSelected = isSelected(item.id);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            const dataCells = (
                                <>
                                    <TableCell
                                        component="th"
                                        id={labelId}
                                        scope="row"
                                        padding="none"
                                        align="center"
                                    >
                                        {edited ? (
                                            <TextField
                                                required
                                                value={item.label}
                                                onChange={(e) =>
                                                    handleLabelChange(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                InputProps={{
                                                    style: {
                                                        height: "36px",
                                                        padding: "0",
                                                    },
                                                }}
                                            />
                                        ) : (
                                            item.label
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {edited ? (
                                            <FormControl fullWidth>
                                                <Select
                                                    value={item.icon}
                                                    onChange={(
                                                        e: SelectChangeEvent<string>,
                                                    ) =>
                                                        handleIconChange(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    style={{ height: "36px" }}
                                                >
                                                    {(type === "expense"
                                                        ? expenseMuiIcons
                                                        : incomeMuiIcons
                                                    ).map(
                                                        (
                                                            categoryIcon,
                                                            iconIndex,
                                                        ) => (
                                                            <MenuItem
                                                                key={iconIndex}
                                                                value={
                                                                    categoryIcon
                                                                }
                                                            >
                                                                <ListItemIcon>
                                                                    <DynamicIcon
                                                                        iconName={
                                                                            categoryIcon
                                                                        }
                                                                        fontSize="medium"
                                                                    />
                                                                </ListItemIcon>
                                                            </MenuItem>
                                                        ),
                                                    )}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <DynamicIcon
                                                iconName={item.icon}
                                                fontSize="medium"
                                            />
                                        )}
                                    </TableCell>
                                </>
                            );

                            if (edited) {
                                return (
                                    <SortableRow key={item.id} id={item.id}>
                                        {dataCells}
                                    </SortableRow>
                                );
                            }

                            return (
                                <TableRow
                                    key={item.id}
                                    hover
                                    onClick={(event) =>
                                        handleClick(event, item.id)
                                    }
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    selected={isItemSelected}
                                    sx={{
                                        cursor: "pointer",
                                        textAlign: "center",
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            inputProps={{
                                                "aria-labelledby": labelId,
                                            }}
                                        />
                                    </TableCell>
                                    {dataCells}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </SortableContext>
            </DndContext>
        );
    },
);

export default CategoryEditForm;
```

---

## Task 3: 型チェック・ビルド確認

**Files:** なし（検証のみ）

- [ ] **Step 1: TypeScript 型チェックを実行する**

```bash
npm run typecheck
```

期待結果: エラーなし。もしエラーが出た場合は以下を確認:
- `selected` の型 (`readonly number[]`) と `id` (`number`) の整合性
- `CategoryEditProps` から削除した props が Category.tsx の呼び出しから除去されているか
- `toCategories` の戻り値が `CategoryItem[]` 型に適合しているか

- [ ] **Step 2: ESLint を実行する**

```bash
npm run lint
```

期待結果: 警告・エラーなし。`react-hooks/exhaustive-deps` の警告が出た場合は `// eslint-disable-next-line react-hooks/exhaustive-deps` を対象 effect の直上に追加する。

- [ ] **Step 3: ブラウザで動作確認する**

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開き、カテゴリページで以下を確認する:

| 確認項目 | 期待動作 |
|---------|---------|
| 編集ボタンを押す | 各行にドラッグハンドルアイコン（≡）が表示される |
| ドラッグハンドルをドラッグして並び替え | リストの順序が変わる |
| 並び替え後にテキストを編集 | **リストの順番が変わらない**（バグ修正の確認） |
| 並び替え後にアイコンを変更 | **リストの順番が変わらない** |
| 保存ボタンを押す | 並び順・テキスト・アイコンが保存される |
| キャンセルボタンを押す | 変更が破棄され元の状態に戻る |
| 支出/収入タブを切り替える | 対応するカテゴリリストに切り替わる |
| 非編集モードでチェックボックスをクリック | 行が選択される |
| 選択後に削除ボタンを押す | 選択したカテゴリが削除される |
| 編集中にカテゴリ追加フォームから追加 | 編集モードが終了し新しいカテゴリが表示される |

---

## Final Commit

すべてのタスクが完了し動作確認が取れたらコミットする。

```bash
git add src/components/CategoryEditForm.tsx src/pages/Category.tsx
git commit -m "$(cat <<'EOF'
fix: カテゴリD&D並び替えを再設計してインデックスずれバグを修正

- LocalItem[]（idキーのオブジェクト配列）で状態を一本化し、並列インデックス配列を廃止
- 編集モード中はAPIを呼ばず、保存ボタン押下時にsortCategories+editCategoryを一括送信
- ドラッグリスナーをDragHandleセルのみに分離し、TextField/Selectとの競合を排除
- 編集中のcategories prop変化でlocalItemsが上書きされるバグを根絶
- 不要なswichedCategory/deleted state・propsを削除

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
