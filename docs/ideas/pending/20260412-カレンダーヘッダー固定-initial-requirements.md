# カレンダーヘッダー固定 - 初期要件

## 概要

**一言説明**: カレンダー画面でスクロール時に、「2026年3月」の月表示と「年月を選択」セクションがヘッダーとして sticky 固定される機能。

**目的**: ユーザーがスクロール中でも現在表示中の月が常に視認できるようにし、ナビゲーションの利便性を向上させる。

## 要件（やること）

- 「2026年3月」テキスト（FullCalendar fc-header-toolbar）を sticky 固定
- ChangeCalendarMonth コンポーネント全体を sticky 固定
- SP・PC 両方で動作確認
- スクロール時の視認性を確保（z-index 調整）
- FullCalendar の position を相対配置に変更

## 非要件（やらないこと）

- スクロール位置に応じた透明度変更
- ヘッダーの影（box-shadow）追加（初回は不要）
- ダブルスティッキー（2 つのヘッダーが並ぶ構造）

## 設計方針（どうやるか）

### 実装方針

**修正対象**: `src/pages/Home.tsx`, `src/components/ChangeCalendarMonth.tsx`

**Home.tsx**: ChangeCalendarMonth と Calendar を sticky コンテナで wrap

```tsx
<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 100,
    bgcolor: "background.paper",
  }}
>
  <ChangeCalendarMonth />
  {/* Calendar も同じコンテナ内または直後 */}
</Box>
```

**ChangeCalendarMonth.tsx**: position: absolute → position: relative に変更

```tsx
// 修正前
position: "absolute",
top: { xs: "183px", sm: "202px", ... },
left: { xs: "0%", md: "235px" },

// 修正後
position: "relative",  // 通常フロー
// top, left は削除
```

### レイアウト構造

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

## 懸念事項・検討点

- **FullCalendar の headerToolbar**: false に設定せず、ChangeCalendarMonth の日付ピッカーと並存させるか？ → Plan では同じコンテナ内
- **MonthlySummary の位置**: sticky の上に固定か→ MonthlySummary は sticky の外（スクロール対象）
- **Safari 互換性**: position: sticky はサポートだが、古いブラウザでは非対応 → 無視（baseline support ok）

## 実装予定時期

Phase 1（最初の実装）

## 壁打ちの記録

**最終更新**: 2026-04-12
**合意内容**:
- ChangeCalendarMonth と Calendar のヘッダーを sticky でラップ
- position: sticky, top: 0, zIndex: 100, bgcolor: background.paper
- ChangeCalendarMonth の position: absolute → relative に変更
- SP・PC で動作確認
- FullCalendar headerToolbar の変更は不要（ChangeCalendarMonth が overlay）
