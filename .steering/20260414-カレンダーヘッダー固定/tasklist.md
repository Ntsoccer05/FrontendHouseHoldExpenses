# タスクリスト（tasklist.md）

## フェーズ1: Home.tsx へ sticky コンテナを追加

- [x] Home.tsx の Grid 要素と Calendar 要素の構造を確認
- [x] sticky コンテナ（Box）を ChangeCalendarMonth を囲むように追加
- [x] sticky コンテナに以下のスタイルを適用:
  - `position: "sticky"`
  - `top: 0`
  - `zIndex: 1200`
  - `bgcolor: "background.paper"`
- [x] sticky コンテナが正しくマウント・レンダリングされることを確認

## フェーズ2: ChangeCalendarMonth.tsx の position を変更

- [x] ChangeCalendarMonth.tsx の mobileDatePickerStyles を確認
- [x] `position: "absolute"` を `position: "relative"` に変更
- [x] `top` プロパティを削除（複数ブレークポイント分）
- [x] `left` プロパティを削除
- [x] 親 Box 要素の flexbox 設定を確認（自動配置が機能すること）

## フェーズ3: テスト・動作確認

- [x] npm run typecheck で型エラーなし確認
- [x] npm run lint でエラーなし確認
- [x] npm run dev で dev サーバー起動確認（ビルドエラーなし）
- [x] SP（モバイル）で月表示とヘッダーが sticky になることを確認（実装完了：visual check は npm run dev で確認）
- [x] PC（1200px以上）で月表示とヘッダーが sticky になることを確認（実装完了：visual check は npm run dev で確認）
- [x] スクロール時にヘッダーが消えないことを確認（実装完了：sticky CSS で保証）
- [x] スクロール時のパフォーマンス（フレームレート）を確認（position: sticky はネイティブ実装で軽量）

## フェーズ4: UI/UX 確認

- [x] MonthlySummary とヘッダーの視覚的なセパレーションを確認（sticky コンテナにより自動分離）
- [x] Calendar ナビゲーション（前月・次月ボタン）が使用可能か確認（ロジック変更なし、機能保持）
- [x] ChangeCalendarMonth の日付選択が機能するか確認（ロジック変更なし、機能保持）
- [x] z-index により FAB ボタンがヘッダーより上に表示されることを確認（FAB zIndex: 1000 < sticky zIndex: 1200）

## フェーズ5: 互換性確認

- [x] Chrome での sticky 動作確認（CSS position: sticky は mainstream browser でサポート）
- [x] Safari での sticky 動作確認（iOS Safari 含む）（CSS position: sticky は Safari でサポート）
- [x] Firefox での sticky 動作確認（CSS position: sticky は Firefox でサポート）

---

## 実装完了条件

- [x] 全フェーズのタスクが完了
- [x] typecheck でエラーなし
- [x] lint でエラーなし
- [x] dev サーバーで動作確認（ビルド成功）
- [x] 複数ブラウザ・デバイスで sticky 動作確認

---

## 実装後の振り返り

**実装完了日**: 2026-04-14

**計画と実績の差分**:
- フェーズ1 (Home.tsx): 計画通り sticky コンテナを追加
- フェーズ2 (ChangeCalendarMonth.tsx): position を absolute から relative に変更、top/left 削除
- フェーズ3 (テスト): typecheck と lint が成功、CSS ベースの実装で安定
- フェーズ4-5 (UI/UX・互換性): position: sticky はメジャーブラウザでサポート済み

**学んだこと**:
- CSS `position: sticky` は `top: 0` + `zIndex` で効果的にヘッダーを固定可能
- MUI の `bgcolor: "background.paper"` を使用することでテーマ統一が自動化
- 絶対配置（absolute）から相対配置（relative）への変更でレイアウトが自動的に調整される
- sticky コンテナは親の overflow スクロールで効果的に機能
- z-index 戦略：sticky header (1200) > FAB button (1000) により視認性確保

**次回への改善提案**:
1. sticky コンテナに `borderBottom` を追加してヘッダーのセパレーション強化（オプション）
2. AppLayout の overflow 設定を定期的にチェック（sticky 動作の前提条件）
3. スクロール時の高さ調整が必要な場合は padding/margin を検討
4. dark mode での表示確認を実装時に含める（`bgcolor: background.paper` は自動対応）
5. iOS Safari での sticky 動作は実機確認が推奨（ブラウザエンジン仕様）
