# 「+今日」ボタン右下固定 - 初期要件

## 概要

**一言説明**: スマートフォンでは正常に右下固定されるが、PC の大画面では位置がズレるため、画面幅に応じた動的配置を実装する機能。

**目的**: すべての画面サイズ（SP・タブレット・PC）で「+今日」FAB ボタンを視認性よく右下に固定し、常にアクセス可能にする。

## 要件（やること）

- FAB ボタンの位置をレスポンシブに修正
- PC 画面（lg ブレークポイント以上）での配置を改善
- MUI sx ブレークポイントを活用
- ハードコードされた px 値を削除

## 非要件（やらないこと）

- FAB アニメーション追加
- ボタン位置の自動スクロール追跡
- 複数ボタンの配置最適化

## 設計方針（どうやるか）

### 実装方針

**修正対象**: `src/pages/Home.tsx` の Fab コンポーネント

**変更内容**:
```tsx
// 修正前（ハードコード）
bottom: isMobile ? 10 : 274,
right: isMobile ? 20 : 344,

// 修正後（MUI ブレークポイント）
bottom: { xs: 10, lg: 24 },
right: { xs: 20, lg: 24 },
```

**ブレークポイント定義**:
- `xs`: 0～599px （スマートフォン）→ right: 20px, bottom: 10px
- `lg`: 1200px～（PC）→ right: 24px, bottom: 24px

### ロジック

- `isMobile` boolean は削除（MUI sx で十分）
- width, height のサイズはサイズ自体を responsive にするか？ → 当面は xs/lg の 2 段階のみ
- AddIcon のサイズも responsive に

## 懸念事項・検討点

- **カレンダーコンポーネントとの重なり**: right: 24px で十分か確認 → Plan では ok
- **中間サイズ（md）の扱い**: 当面は lg で一括 → 必要に応じて追加

## 実装予定時期

Phase 1（最初の実装）

## 壁打ちの記録

**最終更新**: 2026-04-12
**合意内容**:
- bottom/right を MUI sx ブレークポイント { xs, lg } で定義
- xs (SP) は bottom: 10, right: 20
- lg (PC) は bottom: 24, right: 24
- width/height は isMobile ternary でも可（当面保留）
- AddIcon も responsive に
