# 設計（design.md）

## UI/UX の変更

### 修正前
- ChangeCalendarMonth が `position: absolute` で absolute 配置
- スクロール時に「2026年3月」テキストが流れてしまう

### 修正後
- ChangeCalendarMonth と FullCalendar ヘッダーを sticky コンテナでラップ
- スクロール時にヘッダーが固定表示

## 技術的な実装方針

### 変更対象ファイル
1. `src/pages/Home.tsx`
2. `src/components/ChangeCalendarMonth.tsx`

### 修正1: Home.tsx
```tsx
// 修正前
<ChangeCalendarMonth calendarRef={...} />
<Calendar ... />

// 修正後
<Box sx={{ position: "sticky", top: 0, zIndex: 100, bgcolor: "background.paper" }}>
  <ChangeCalendarMonth calendarRef={...} />
</Box>
<Calendar ... />
```

### 修正2: ChangeCalendarMonth.tsx
```tsx
// 修正前
position: "absolute",
top: { xs: "183px", sm: "202px", md: "205px", ... },
left: { xs: "0%", md: "235px" },

// 修正後
position: "relative",  // absolute → relative に変更
// top, left は削除
```

## レイアウト構造
```
┌─────────────────────────────────┐
│ MonthlySummary                  │
├─────────────────────────────────┤ ← sticky: top: 0
│ [ChangeCalendarMonth]           │
│ FullCalendar header toolbar     │
└─────────────────────────────────┘
│ FullCalendar body (scrollable)  │
│                                 │
│ ...                             │
└─────────────────────────────────┘
```

## テスト方針

1. **開発サーバーで動作確認**
   - `npm run dev` で起動
   - SP 表示でスクロール時にヘッダー固定確認
   - PC 表示でスクロール時にヘッダー固定確認

2. **レスポンシブテスト**
   - 複数の画面サイズでスクロール動作確認

3. **型チェック**
   - `npm run typecheck` で TypeScript エラーなし
