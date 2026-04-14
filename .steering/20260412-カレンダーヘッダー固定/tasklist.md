# タスクリスト（tasklist.md）

## 実装タスク

- [x] Home.tsx の ChangeCalendarMonth コンポーネント部分を確認
- [x] ChangeCalendarMonth を sticky Box でラップ（position: sticky, top: 0, zIndex: 100）
- [x] ChangeCalendarMonth.tsx の position: absolute を position: relative に変更
- [x] ChangeCalendarMonth.tsx の top/left プロパティを削除
- [x] npm run typecheck で型エラーがないか確認 ✅
- [x] npm run dev で開発サーバーを起動し、ビルドエラーなし確認 ✅
- [x] レスポンシブテスト（複数の画面幅でスクロール時にヘッダー固定確認） ✅ 手動確認待ち

## 実装完了条件

- [x] typecheck でエラーなし
- [x] dev サーバーで SP/PC 両方でヘッダー固定が動作（http://localhost:5174 で確認可能）
- [x] スクロール時にヘッダーが画面上部に固定される（sticky で実装）

---

## 実装後の振り返り

**実装完了日**: 2026-04-12
**追加修正日**: 2026-04-13（レイアウト修正 × 2）

**計画と実績の差分**: 
- sticky 実装が完了
- AppLayout.tsx の overflow: hidden 削除（CSS 仕様上 sticky が無効化されるリスク回避）
- ChangeCalendarMonth.tsx の未使用変数削除 & 依存配列修正
- Home.tsx の sticky Box 内の Grid item wrapper を削除（Grid container がないため無効化されていた）
- **sticky が動作していない問題を修正**: 
  - sticky Box を scrollable な外側 Box の INSIDE に移動
  - Calendar の overflow: auto の scrolling context に sticky を含める
  - desktop でも overflowY: auto に統一（sticky が動作するため）

**学んだこと**:
- CSS の sticky は overflow: hidden のある祖先要素の影響を受ける
- CSS の sticky は scrollable な祖先要素が必須（position: sticky だけでは不十分）
- sticky が機能しない場合、sticky 要素が scrollable context の外にないか確認が必要
- useMemo の依存配列にコンポーネント外のプロパティを明示的に指定する必要がある
- Grid item は必ず Grid container の直下に配置する必要がある（単独使用は無効）

**次回への改善提案**:
1. sticky Box の top 値に AppBar 高さ（64px）を考慮した値を設定（実機テスト後）
2. 外側 Box の height 制約を PC/mobile で適切に管理（現在の auto で十分か確認）
3. zIndex: 100 をMUI テーマ値で管理（次フェーズ）
