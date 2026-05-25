# カテゴリ編集 D&D 並び替え 再設計仕様

**日付**: 2026-05-25  
**対象ファイル**:
- `src/components/CategoryEditForm.tsx`
- `src/pages/Category.tsx`

---

## 背景・問題点

### 根本バグ

`editCategory`（テキスト・アイコン変更）の完了後に `getExpenseCategory()` が呼ばれ `categories` prop が更新される。
すると以下の effect が発火し、ドラッグで並び替えた `localCategories` が**バックエンドの元の順番で上書き**される。

```ts
// 現行コード（バグ箇所）
React.useEffect(() => {
    if (activeId === null) {
        setLocalCategories(categories); // ← D&D後の順番が消える
    }
}, [categories, activeId]);
```

### 副次的な問題

| 問題 | 詳細 |
|------|------|
| インデックスベース状態 | `contentValues[index]` / `iconValues[index]` は D&D 後に index とアイテムが乖離するリスク |
| 行全体がドラッグ領域 | `<TableRow {...listeners}>` で TextField・Select クリックが D&D と競合 |
| 複雑な同期ロジック | `initialized`・`wasEdited`・`swichedCategory` など複数フラグが絡み合い追跡困難 |
| 保存タイミングの混在 | テキスト・アイコンは即時保存、並び替えは保存ボタン → 競合が不可避 |

---

## 設計方針

**テキスト・アイコン編集・並び替えすべてを「保存ボタン押下時に一括保存」に統一する。**  
編集モード中は一切 API を呼ばず、すべての変更をローカル state のみで管理する。

---

## 新しい状態設計

### LocalItem 型

```ts
type LocalItem = {
    id: number;     // DB の主キー（D&D id として使用）
    label: string;
    icon: string;
};
```

`filtered_id` はソート順を表すだけで `sortCategories` が index+1 で再採番するため、ローカル管理では不要。

### state

```ts
const [localItems, setLocalItems] = useState<LocalItem[]>([]);
const originalItemsRef = useRef<LocalItem[]>([]);  // 差分検出・キャンセル用
```

`contentValues[]` / `iconValues[]` / `localCategories` / `initialized` / `debounceTime` / `timer` / `wasEdited` / `overIdRef` / `activeId` / `overId` はすべて削除。

---

## 同期ロジック

| タイミング | 処理 | 理由 |
|-----------|------|------|
| `edited` が false → true | `categories` → `localItems` を初期化 + `originalItemsRef` に保存 | 編集開始時の snapshot |
| `!edited && !isSaving` で `categories` 変化 | `localItems` を同期 | 追加・削除・キャンセル後のリフレッシュ |
| 編集モード中に `categories` 変化 | **何もしない** | バグ根本の排除 |

```ts
// 編集開始時のみ初期化
useEffect(() => {
    if (edited) {
        const items = toLocalItems(categories);
        setLocalItems(items);
        originalItemsRef.current = items;
    }
}, [edited]);

// 非編集時・非保存時のみ同期
useEffect(() => {
    if (!edited && !isSaving) {
        setLocalItems(toLocalItems(categories));
    }
}, [categories, edited, isSaving]);
```

---

## ドラッグハンドル分離

`listeners` をハンドルセル（DragHandleIcon の TableCell）にのみ適用する。  
行全体への `{...listeners}` 展開は廃止。

```tsx
const SortableRow = ({ id, children }: { id: number; children: React.ReactNode }) => {
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
                sx={{ cursor: 'grab' }}
            >
                <DragHandleIcon />
            </TableCell>
            {children}
        </TableRow>
    );
};
```

---

## ハンドラー

### ドラッグ完了

```ts
const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex(item => item.id === Number(active.id));
    const newIndex = localItems.findIndex(item => item.id === Number(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
        setLocalItems(prev => arrayMove(prev, oldIndex, newIndex));
        onSortChanged?.();
    }
};
```

### テキスト変更

```ts
const handleLabelChange = (index: number, value: string) => {
    setLocalItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, label: value } : item))
    );
};
```

### アイコン変更

```ts
const handleIconChange = (index: number, value: string) => {
    setLocalItems(prev =>
        prev.map((item, i) => (i === index ? { ...item, icon: value } : item))
    );
};
```

---

## 一括保存フロー

`isSaving` が true になったとき:

```ts
useEffect(() => {
    if (!isSaving) return;
    const save = async () => {
        // 1. 並び順を保存（sortCategories 内で filtered_id を index+1 で再採番）
        await sortCategories(toCategories(localItems), type);

        // 2. label/icon が変更された項目のみ editCategory を送信
        const changedItems = localItems.filter(item => {
            const original = originalItemsRef.current.find(o => o.id === item.id);
            return original && (original.label !== item.label || original.icon !== item.icon);
        });
        await Promise.all(
            changedItems.map(item =>
                editCategory({ id: item.id, content: item.label, icon: item.icon, type })
            )
        );
        setIsSaving(false);
    };
    save();
}, [isSaving]);
```

**注**: `editCategory` は内部で `getExpenseCategory/getIncomeCategory` を呼ぶが、この時点で `edited === false` かつ `isSaving === true` のため、categories 同期 effect はスキップされる。`setIsSaving(false)` 後に最終リフレッシュが走る。

---

## カテゴリ追加中の編集モード対応

編集モード中にカテゴリを追加した場合、編集モードを終了する（元の挙動を維持）。

```ts
useEffect(() => {
    if (added) {
        if (edited) setEdited(false);
        setAdded(false);
    }
}, [added]);
```

---

## Props の変更

### CategoryEditForm

| prop | 変更 | 理由 |
|------|------|------|
| `swichedCategory` | **削除** | type 変更 → `edited=false` → categories 同期で自動対応 |
| `deleted` | **削除** | 非編集中の削除は categories 変化で自動同期 |
| `setDeleted` | **削除** | 上記に伴い不要 |
| `setCategories` | **削除** | CategoryEditForm 内で未使用（dead code） |
| その他 | 変更なし | |

### Category.tsx

| state/変数 | 変更 | 理由 |
|-----------|------|------|
| `swichedCategory` | **削除** | 上記に伴い不要 |
| `deleted` | **削除** | 上記に伴い不要 |
| `categories` state | 維持 | 表示用として引き続き使用 |

---

## ユーティリティ関数

```ts
// CategoryItem[] → LocalItem[]
const toLocalItems = (categories: CategoryItem[] | undefined): LocalItem[] =>
    categories?.filter(c => c.id !== undefined).map(c => ({
        id: c.id!,
        label: c.label,
        icon: c.icon,
    })) ?? [];

// LocalItem[] → CategoryItem[]（sortCategories 呼び出し用）
const toCategories = (items: LocalItem[]): CategoryItem[] =>
    items.map(item => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        filtered_id: 0, // sortCategories 内で index+1 に上書きされる
    }));
```

---

## 変更対象ファイルまとめ

| ファイル | 変更規模 |
|---------|---------|
| `src/components/CategoryEditForm.tsx` | **全面書き直し**（ロジック層） |
| `src/pages/Category.tsx` | 小規模修正（削除 props の除去、state 整理） |
| `src/context/CategoryContext.tsx` | **変更なし** |
| `src/types/index.ts` | **変更なし** |
