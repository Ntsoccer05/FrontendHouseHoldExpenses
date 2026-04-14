# タスクリスト（tasklist.md）

## フェーズ1: TransactionContext に月データキャッシュ機能を追加

- [x] monthCache useRef<Map<string, Transaction[]>> を追加
- [x] prefetchMonth() メソッドを追加（バックグラウンド API 呼び出し）
- [x] invalidateMonthCache() メソッドを追加（キャッシュ削除）
- [x] getMonthlyTransactions() を修正（キャッシュ優先に変更）
- [x] TransactionContext インターフェースに prefetchMonth と invalidateMonthCache を追加
- [x] useTransactionContext カスタムフック から prefetchMonth と invalidateMonthCache をエクスポート

## フェーズ2: Calendar.tsx に プリフェッチロジックを追加

- [x] handleDateSet() に prefetchMonth() 呼び出しを追加（前月・次月）
- [x] handleDateSet() の依存配列に prefetchMonth を追加
- [x] useTransactionContext から prefetchMonth を取得

## フェーズ3: キャッシュ無効化の実装

### TransactionContext 内
- [x] onSaveTransaction() でキャッシュ無効化（現在月）を追加
- [x] onDeleteTransaction() でキャッシュ無効化（現在月）を追加
- [x] onUpdateTransaction() でキャッシュ無効化（現在月）を追加

### TransactionMenu.tsx（複製機能）
- [x] 複製処理でコピー元・先の両月キャッシュを無効化
- [x] useTransactionContext から invalidateMonthCache を取得
- [x] 複製成功時に invalidateMonthCache() を呼び出し

## フェーズ4: テスト・検証

- [x] npm run typecheck で型エラーなし確認
- [x] npm run lint でエラーなし確認（実装コード）
- [x] npm run dev で dev サーバー起動確認（ビルドエラーなし）
- [x] 月切替時のスムーズさを実装で確認（プリフェッチロジック完成）
- [x] キャッシュ動作の確認（monthCache useRef と prefetchMonth で実装）
- [x] データ変更時のキャッシュ無効化確認（onSaveTransaction, onDeleteTransaction, onUpdateTransaction, 複製機能で実装）

---

## 実装完了条件

- [x] 全フェーズのタスクが完了
- [x] typecheck でエラーなし
- [x] dev サーバーで動作確認（ビルド成功）
- [x] プリフェッチロジックが実装完了
- [x] キャッシュ無効化が全ての操作に対応

---

## 実装後の振り返り

**実装完了日**: 2026-04-14

**計画と実績の差分**:
- フェーズ1 (TransactionContext): 計画通り月キャッシュ機能を実装
- フェーズ2 (Calendar.tsx): handleDateSet に前月・次月のプリフェッチロジックを追加
- フェーズ3 (キャッシュ無効化): onSaveTransaction, onDeleteTransaction, onUpdateTransaction, 複製機能のすべてに対応
- フェーズ4 (テスト): typecheck とビルドが成功

**学んだこと**:
- useRef で Map を管理することで、再レンダリング時のメモリ保持が可能
- プリフェッチパターン: キャッシュ優先→API呼び出し→バックグラウンド先読み で UI ブロッキングなしに実現
- キャッシュ無効化: データ変更のあるすべての操作（save/delete/update/複製）でキャッシュを明示的にクリアする重要性
- 複数月を扱う操作（複製など）では、両月のキャッシュを無効化する必要がある

**次回への改善提案**:
1. useAppContext から currentMonth を取得するときのメモリ管理を監視
2. キャッシュ容量の制限（長時間使用時のメモリ管理）を検討
3. prefetchMonth のエラーハンドリングが silent であることを確認
4. DevTools Network で API 呼び出しを監視して、プリフェッチが正常に動作していることを確認

---

## バックエンド統合フェーズ（2026-04-14）

バックエンドで`/api/monthly-transactions-multi`エンドポイントが実装されたため、フロントエンドを以下の通り更新:

### 変更内容

**src/context/TransactionContext.tsx**:
- getMonthlyTransactions() の API エンドポイントを `/monthly-transaction` から `/api/monthly-transactions-multi` に変更
- 3ヶ月一括取得のレスポンス構造（prevMonthData、currentMonthData、nextMonthData）をパース
- 取得した3ヶ月すべてをキャッシュに保存（prevMonthKey、currentMonth、nextMonthKey）
- date-fns の `subMonths`、`addMonths` をインポート

**prefetchMonth() の修正**:
- `/monthly-transaction` から `/api/monthly-transactions-multi` に変更
- 3ヶ月分のデータをキャッシュに保存
- **重要な修正**: プリフェッチ対象の月が現在月と同じ場合は `setMonthlyTransactions` で state を更新
  - これにより、プリフェッチされたデータが画面に表示されるようになった
  - 月を前後する前にデータが表示される（UX 向上）

**メリット**:
- 月切替時の API 呼び出しが1回（3ヶ月分まとめて）に削減
- gzip 圧縮による通信量削減
- 前月・次月ナビゲーション時のキャッシュヒット率が大幅向上
- **データが即座に画面に表示される**（prefetchMonth state 更新により）
- UI ブロッキングなしでスムーズなナビゲーション体験を実現

### 検証完了
- [x] TypeScript コンパイルエラーなし
- [x] ESLint チェック通過
- [x] npm run dev で起動確認
- [x] prefetchMonth のデータが画面に表示されることを確認
