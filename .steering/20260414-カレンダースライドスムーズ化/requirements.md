# 要件書（requirements.md）

## カレンダースライドスムーズ化

### 概要

**一言説明**: 月を切り替える時に API データ取得の遅延でカクつく現象を改善し、スムーズなスライド操作を実現する機能。

**目的**: ユーザーが前月・次月ボタンで月を切り替える際、ストレスのないスムーズな UX を提供する。

### 要件（やること）

- 月データのキャッシング機能を実装（Map で管理）
- 月切り替え時に前後月データを先読み（プリフェッチ）
- プリフェッチ中は UI をブロックしない
- キャッシュされたデータがある場合は即座に表示
- 初回訪問・新規タブ開放時もスムーズに動作
- **データ変更時（作成・更新・削除・複製）に関連月のキャッシュを自動削除**

### 非要件（やらないこと）

- 永続的なキャッシュ（セッション中のメモリキャッシュのみ）
- キャッシュの手動クリア UI
- IndexedDB などの複雑なストレージ機構

### 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| [src/context/TransactionContext.tsx](src/context/TransactionContext.tsx) | monthCache useRef, prefetchMonth, invalidateMonthCache, getMonthlyTransactions修正 |
| [src/components/Calendar.tsx](src/components/Calendar.tsx) | handleDateSet にプリフェッチロジック追加 |
| [src/components/TransactionMenu.tsx](src/components/TransactionMenu.tsx) | 複製機能時にキャッシュ無効化 |
