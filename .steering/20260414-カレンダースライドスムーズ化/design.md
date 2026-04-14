# 設計書（design.md）

## カレンダースライドスムーズ化 - 技術設計

### 実装方針

#### 1. TransactionContext に monthCache を追加

```typescript
// useRef で Map<string, Transaction[]> を管理
const monthCacheRef = useRef<Map<string, Transaction[]>>(new Map());
```

**理由**: useRef を使用することで、再レンダリング時にキャッシュがリセットされないようにする

#### 2. prefetchMonth() メソッドを追加

```typescript
const prefetchMonth = useCallback(async (yearMonth: string) => {
  // キャッシュに存在すれば何もしない
  if (monthCacheRef.current.has(yearMonth)) return;
  
  // バックグラウンドで API リクエスト（エラー時も無視）
  try {
    const response = await apiClient.get("/monthly-transaction", {
      params: { currentMonth: yearMonth, user_id: loginUser?.id },
    });
    monthCacheRef.current.set(yearMonth, response.data.monthlyTransactionData);
  } catch (err) {
    // プリフェッチ失敗時も UI には影響しない
    console.warn(`Failed to prefetch month ${yearMonth}:`, err);
  }
}, [loginUser?.id]);
```

#### 3. invalidateMonthCache() メソッドを追加

```typescript
const invalidateMonthCache = useCallback((yearMonth: string) => {
  monthCacheRef.current.delete(yearMonth);
}, []);
```

**呼び出し箇所**:
- onSaveTransaction() - 現在月をクリア
- onDeleteTransaction() - 現在月をクリア
- onUpdateTransaction() - 現在月をクリア
- 複製機能 - コピー元・先の両月をクリア

#### 4. getMonthlyTransactions() を修正

```typescript
const getMonthlyTransactions = useCallback(async (currentMonth: string) => {
  // キャッシュ優先
  if (monthCacheRef.current.has(currentMonth)) {
    const cachedData = monthCacheRef.current.get(currentMonth)!;
    setMonthlyTransactions(cachedData);
    // 後ろでフレッシュデータの取得も実行（必要に応じて更新）
    // fetchInBackground(currentMonth);
    return cachedData;
  }
  
  // キャッシュがなければ API リクエスト
  try {
    const response = await apiClient.get("/monthly-transaction", {
      params: { currentMonth, user_id: loginUser?.id },
    });
    const data = response.data.monthlyTransactionData;
    monthCacheRef.current.set(currentMonth, data);
    setMonthlyTransactions(data);
    return data;
  } catch (err) {
    console.error("Error fetching monthly transactions:", err);
    return [];
  }
}, [loginUser?.id]);
```

#### 5. Calendar.tsx handleDateSet() にプリフェッチロジックを追加

```typescript
const handleDateSet = useCallback(
  (datesetInfo: DatesSetArg) => {
    const newMonth = datesetInfo.view.currentStart;
    const newFormattedDate = format(newMonth, "yyyyMM");
    
    // ... 既存のロジック ...
    
    // プリフェッチ処理を追加
    const prevMonth = format(subMonths(newMonth, 1), "yyyyMM");
    const nextMonth = format(addMonths(newMonth, 1), "yyyyMM");
    
    getMonthlyTransactions(newFormattedDate);  // 現在月を取得
    prefetchMonth(prevMonth);  // 前月を先読み
    prefetchMonth(nextMonth);  // 次月を先読み
  },
  [getMonthlyTransactions, prefetchMonth, /* ... */]
);
```

### キャッシュ無効化戦略

**問題**: データが作成・更新・削除・複製されると、キャッシュが古いままになる

**解決**: TransactionContext の各操作後にキャッシュを自動削除

#### 対象操作

1. **onSaveTransaction** - 現在月のキャッシュをクリア
2. **onDeleteTransaction** - 現在月のキャッシュをクリア
3. **onUpdateTransaction** - 現在月のキャッシュをクリア
4. **複製機能（TransactionMenu）** - コピー元・先の両月をクリア

### データフロー図

```
1. ユーザーが次月ボタンをクリック
   ↓
2. handleDateSet() が呼ばれる
   ↓
3. getMonthlyTransactions(newMonth) で即座にデータ表示（キャッシュから）
   ↓
4. prefetchMonth(prevMonth), prefetchMonth(nextMonth) を非同期で実行
   ↓
5. バックグラウンドで API リクエスト（UI ブロッキングなし）
   ↓
6. キャッシュに保存
   ↓
7. 次回月切り替え時は API 待ちなし → スムーズ！
```

### エラーハンドリング

- **プリフェッチ失敗**: console.warn で記録、UI 影響なし
- **getMonthlyTransactions 失敗**: キャッシュなければ API 実行、失敗時は空配列返却
- **キャッシュ無効化の漏れ**: すべてのデータ変更操作をチェック

### パフォーマンス考慮

- **メモリ使用量**: セッション中のメモリキャッシュのみ（永続化なし）
- **API リクエスト数**: プリフェッチにより増加するが、ユーザー体感は改善
- **キャッシュヒット率**: 前月・次月操作が多い場合に高い効果
