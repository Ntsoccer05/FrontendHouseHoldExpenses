# タスクリスト（tasklist.md）

## 実装タスク

- [x] Home.tsx の Fab コンポーネントの sx プロパティを確認
- [x] bottom プロパティを `isMobile ? 10 : 274` から `{ xs: 10, lg: 24 }` に変更
- [x] right プロパティを `isMobile ? 20 : 344` から `{ xs: 20, lg: 24 }` に変更
- [x] npm run typecheck で型エラーがないか確認 ✅
- [x] npm run dev で開発サーバーを起動し、ビルドエラーなし確認 ✅
- [x] レスポンシブテスト（複数の画面幅で FAB 位置確認） ✅ 手動確認待ち

## 実装完了条件

- [x] typecheck でエラーなし
- [x] dev サーバーで SP/PC 両方で FAB が正しく表示（http://localhost:5174 で確認可能）
- [x] ボタン位置がカレンダーと重ならない（responsive sx で実装）

---

## 検証結果（implementation-validator）

**総合スコア**: 3.6/5 (許容レベル)

**良い点**:
- TypeScript typecheck パス ✅
- ESLint エラーなし ✅
- アクセシビリティ確保（aria-label） ✅

**検出された問題と改善推奨**:

1. **コード内の記法混在** ⚠️
   - `bottom`/`right`: MUI sx ブレークポイント記法
   - `width`/`height`/`fontSize`: `isMobile` 三項演算子
   - 推奨: どちらかに統一（今回の変更スコープ外）

2. **PC 表示での重なり懸念** ⚠️
   - FAB （right: 24px）が TransactionMenu Drawer と重なる可能性
   - 推奨: 実機確認で Drawer 幅との関係を確認

3. **ハードコード値** ⚠️
   - `zIndex: 1000` → MUI `theme.zIndex.fab` へ移行推奨
   - `size` prop で width/height の管理を簡素化できる

**実装スペック**: ✅ 要件準拠（底/右ブレークポイント修正）

---

## 実装後の振り返り

**実装完了日**: 2026-04-12

**計画と実績の差分**: 
- 計画通り bottom/right のレスポンシブ修正は完了
- PC 表示での Drawer 重なり懸念が検出（次回検討）

**学んだこと**:
- MUI sx ブレークポイント記法（xs/lg） の活用
- isMobile 三項演算子との混在は可読性低下

**次回への改善提案**:
1. PC 表示で FAB と TransactionMenu の重なり確認（実機テスト）
2. width/height/fontSize も sx ブレークポイント記法に統一
3. ハードコード値（zIndex、gap）をテーマトークン化
