# カレンダーヘッダー固定 - 技術設計

## 実装方針

### 1. コンポーネント構造の変更

**修正対象**:
- `src/pages/Home.tsx` - sticky コンテナの追加
- `src/components/ChangeCalendarMonth.tsx` - position 属性の変更

### 2. Home.tsx の修正

#### 現在のレイアウト構造
```
Box (flexGrow: 1)
├── MonthlySummary
├── Grid
│   └── ChangeCalendarMonth (position: absolute)
└── Box (position: absolute/relative)
    └── Calendar
```

#### 修正後のレイアウト構造
```
Box (flexGrow: 1)
├── MonthlySummary
├── Box (sticky: top: 0, zIndex: 1200, bgcolor: background.paper)
│   ├── Grid
│   │   └── ChangeCalendarMonth (position: relative)
│   └── FullCalendar ヘッダーツールバー
└── Box (Calendar body - scrollable)
    └── Calendar
```

#### 具体的な修正内容

**sticky コンテナの追加**:
```tsx
<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 1200,
    bgcolor: "background.paper",
    borderBottom: "1px solid #e0e0e0", // オプション: 区切り線
  }}
>
  <Grid item xs={12} sx={{ marginBottom: { xs: "13px", sm: 0 } }}>
    <ChangeCalendarMonth calendarRef={calendarRef.current as FullCalendar} />
  </Grid>
</Box>
```

**カレンダーコンテナの分離**:
- sticky コンテナの外側に Calendar を配置
- スクロール時は Calendar body のみがスクロール

### 3. ChangeCalendarMonth.tsx の修正

#### 修正前
```tsx
const mobileDatePickerStyles = useMemo(
  () => ({
    mx: 2,
    position: "absolute",  // ← 絶対配置
    top: { xs: "183px", sm: "202px", md: "205px", ... },
    left: { xs: "0%", md: "235px" },
    ...
  }),
  []
);
```

#### 修正後
```tsx
const mobileDatePickerStyles = useMemo(
  () => ({
    mx: 2,
    position: "relative",  // ← 相対配置に変更
    // top, left は削除
    ...
  }),
  []
);
```

### 4. z-index 戦略

| 要素 | z-index | 理由 |
|-----|---------|------|
| sticky header | 1200 | Calendar content より上 |
| Calendar toolbar | auto | sticky header 内に包含 |
| FAB button | 1000 | sticky header より上（既存） |
| Calendar content | auto | 下層 |

### 5. スタイル設定の詳細

**sticky コンテナ**:
```tsx
sx={{
  position: "sticky",
  top: 0,
  zIndex: 1200,
  bgcolor: "background.paper",  // MUI のデフォルトカラー
  // iOS Safari でのサポート確認済み
}}
```

**利点**:
- MUI の `background.paper` を使用することでテーマ統一
- `position: sticky` は major browsers でサポート済み（IE11 除外、許容）

### 6. ブレークポイント対応

| ブレークポイント | 動作 |
|--------------|------|
| xs（<600px） | 月表示 + 年月選択が sticky |
| sm（≥600px） | 月表示 + 年月選択が sticky |
| md（≥960px） | 月表示 + 年月選択が sticky |
| lg（≥1200px） | 月表示 + 年月選択が sticky |

### 7. CSS ポジショニング

**position: sticky の動作**:
- `top: 0` で最上部に固定
- `position: relative` は親コンテナのサイズを計算
- sticky コンテナが親 (Box with overflow) の外に出ないかぎり sticky 状態を保持

**パフォーマンス考慮**:
- `position: sticky` は GPU 加速対応（最近のブラウザ）
- スクロール時のフレームレート影響は軽微

## データフロー

```
ユーザーがカレンダー領域をスクロール
    ↓
親コンテナ (Box with overflowY) がスクロール
    ↓
sticky コンテナが top: 0 で固定される
    ↓
ChangeCalendarMonth が常に表示される
    ↓
Calendar body だけが相対的にスクロール
```

## エラーハンドリング

### 想定される問題と対策

| 問題 | 原因 | 対策 |
|-----|------|------|
| sticky が効かない | 親コンテナに `overflow: hidden` | 親の overflow を確認・修正 |
| header が途中で消える | z-index 不足 | z-index: 1200 を設定 |
| レイアウトが乱れる | position 計算ミス | relative に統一、margin/padding を確認 |

## 既存実装との統合点

### Calendar.tsx との連携
- Calendar コンポーネントは変更なし
- sticky コンテナにより Calendar body が自動的にスクロール対象となる

### AppLayout.tsx との確認
- 親コンテナの `overflow: hidden` がないことを確認（既にチェック済み）

### MUI テーマ統合
- `bgcolor: "background.paper"` で自動的にテーマ色を適用
- dark mode 対応も自動

## パフォーマンス考慮

- **メモリ**: sticky 要素は追加メモリ使用最小限
- **CPU**: `position: sticky` はネイティブブラウザ実装で軽量
- **GPU**: スクロール時の GPU 加速対応（最近のブラウザ）
- **レンダリング**: 再フロー影響は軽微
