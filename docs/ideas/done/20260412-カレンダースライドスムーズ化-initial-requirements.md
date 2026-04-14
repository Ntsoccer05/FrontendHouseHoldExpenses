# カレンダースライドスムーズ化 - 初期要件

## 概要

**一言説明**: 月を切り替える時に API データ取得の遅延でカクつく現象を改善し、スムーズなスライド操作を実現する機能。

**目的**: ユーザーが前月・次月ボタンで月を切り替える際、ストレスのないスムーズな UX を提供する。

## 要件（やること）

- 月データのキャッシング機能を実装（Map で管理）
- 月切り替え時に前後月データを先読み（プリフェッチ）
- プリフェッチ中は UI をブロックしない
- キャッシュされたデータがある場合は即座に表示
- 初回訪問・新規タブ開放時もスムーズに動作
- **データ変更時（作成・更新・削除・複製）に関連月のキャッシュを自動削除**

## 非要件（やらないこと）

- 永続的なキャッシュ（セッション中のメモリキャッシュのみ）
- キャッシュの手動クリア UI
- IndexedDB などの複雑なストレージ機構

## 設計方針（どうやるか）

### 実装方針

- **TransactionContext に monthCache (useRef) を追加**: Map<string, Transaction[]> 型で月データを管理
- **prefetchMonth() 関数を追加**: バックグラウンドで前後月をダウンロード
- **getMonthlyTransactions() を修正**: キャッシュ優先で返す
- **Calendar.tsx handleDateSet() 内で prefetch() を呼び出し**: 前月・次月を先読み
- **date-fns ユーティリティを活用**: format(), addMonths(), subMonths()

### キャッシュ無効化戦略

**問題**: データが作成・更新・削除・複製されると、キャッシュが古いままになる

**解決**: TransactionContext の各操作後にキャッシュを自動削除

```typescript
// invalidateMonthCache() 関数を追加
const invalidateMonthCache = useCallback((yearMonth: string) => {
  monthCacheRef.current.delete(yearMonth);
}, []);

// 各操作時にキャッシュクリア
const onSaveTransaction = async (transaction: TransactionData) => {
  // ... API 呼び出し ...
  invalidateMonthCache(format(new Date(), "yyyyMM"));  // 現在月クリア
};

const onDeleteTransaction = async (transactionIds: string | readonly string[]) => {
  // ... API 呼び出し ...
  invalidateMonthCache(format(new Date(), "yyyyMM"));  // 現在月クリア
};

const onUpdateTransaction = async (transaction: TransactionData, transactionId: string) => {
  // ... API 呼び出し ...
  invalidateMonthCache(format(new Date(), "yyyyMM"));  // 現在月クリア
};
```

**複製機能時**: コピー元・先の両月キャッシュをクリア
```typescript
// TransactionMenu.tsx の複製処理後
invalidateMonthCache(currentDay);      // コピー元月
invalidateMonthCache(destinationDate); // コピー先月
```

### データフロー

```
1. ユーザーが次月ボタンをクリック
   ↓
2. handleDateSet() が呼ばれる
   ↓
3. setCurrentMonth() で画面更新（キャッシュから即座に取得）
   ↓
4. prefetchMonth(前月), prefetchMonth(次月) を非同期で実行
   ↓
5. バックグラウンドで API リクエスト
   ↓
6. キャッシュに保存
   ↓
7. 次回月切り替え時は API 待ぎなし
```

## 懸念事項・検討点

- **メモリ管理**: 長時間使用で何ヶ月分までキャッシュするか → 当面無制限（セッション中）
- **API 負荷**: プリフェッチで API リクエスト数が増加 → 受動的待機ではなく積極的プリフェッチが目的
- **エラーハンドリング**: プリフェッチ失敗時も UI には影響しない設計
- **キャッシュ無効化の漏れ**: すべてのデータ変更箇所で対応する必要あり
  - onSaveTransaction()
  - onDeleteTransaction()
  - onUpdateTransaction()
  - 複製機能（TransactionMenu）
  - その他の API 呼び出し
- **複数月に関わる操作**: 複製機能など複数月を更新する場合は両月のキャッシュをクリア

## 実装予定時期

Phase 1（最初の実装）

## 壁打ちの記録

**最終更新**: 2026-04-12
**合意内容**:
- TransactionContext に monthCache useRef を追加
- prefetchMonth() で前後月を非同期で取得
- getMonthlyTransactions() はキャッシュ優先
- Calendar.tsx handleDateSet() 内で prefetch() を呼び出し
- セッション中のメモリキャッシュのみ（永続化なし）
- **重要**: データ変更時（作成・更新・削除・複製）に invalidateMonthCache() を呼び出してキャッシュクリア
- 複製など複数月を更新する場合は両月のキャッシュをクリア
