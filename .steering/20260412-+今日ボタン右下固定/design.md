# 設計（design.md）

## UI/UX の変更

### 修正前（ハードコード）
```tsx
bottom: isMobile ? 10 : 274,
right: isMobile ? 20 : 344,
width: isMobile ? 50 : 64,
height: isMobile ? 50 : 64,
```

**問題**: PC の大画面（lg ブレークポイント以上、1200px～）でボタンが固定されるべき位置（右下）からズレている

### 修正後（MUI ブレークポイント）
```tsx
bottom: { xs: 10, lg: 24 },
right: { xs: 20, lg: 24 },
width: isMobile ? 50 : 64,        // 当面保留
height: isMobile ? 50 : 64,       // 当面保留
```

**改善**: すべての画面サイズ（SP・タブレット・PC）で「+今日」FAB ボタンを視認性よく右下に固定

## 技術的な実装方針

### 変更対象ファイル
- `src/pages/Home.tsx`

### 修正範囲
- Fab コンポーネントの sx プロパティ内の bottom・right のみ

### ブレークポイント定義
- `xs`: 0～599px（スマートフォン）→ right: 20px, bottom: 10px
- `lg`: 1200px～（PC）→ right: 24px, bottom: 24px

### 影響度
- **低**: Fab コンポーネントの位置プロパティのみ変更
- 他のコンポーネントには影響なし
- 既存機能に影響なし

## テスト方針

1. **開発サーバーで動作確認**
   - `npm run dev` で起動
   - SP 表示（xs）で FAB が右下に固定されるか確認
   - PC 表示（lg）で FAB が右下に固定されるか確認（DevTools でブレークポイント変更）

2. **レスポンシブテスト**
   - 複数の画面サイズで確認（375px、768px、1200px、1920px）
   - ボタンがカレンダーと重ならないか確認

3. **型チェック**
   - `npm run typecheck` で TypeScript エラーなし
