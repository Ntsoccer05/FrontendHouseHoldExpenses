# カレンダーヘッダー固定（Sticky Header）- 要件書

## 機能概要

カレンダー画面でスクロール時に「2026年3月」の月表示と「年月を選択」セクション（ChangeCalendarMonth）がヘッダーとして sticky 固定される機能を実装する。ユーザーがスクロール中でも現在表示中の月が常に視認できるようにする。

## 目的

- スクロール中もカレンダーヘッダー（月表示と年月選択）を常時表示
- ナビゲーション利便性の向上
- ユーザーが現在の月を常に認識できる環境を提供

## 要件（やること）

### 機能要件
- [ ] ChangeCalendarMonth コンポーネントを sticky 固定
- [ ] FullCalendar のヘッダーツールバーを含むヘッダー領域を sticky 固定
- [ ] スクロール時に視認性を確保（z-index 調整）
- [ ] SP・PC 両方で動作確認

### 非機能要件
- [ ] パフォーマンス: スクロール時のフレームレート低下なし
- [ ] アクセシビリティ: ナビゲーション操作は変わらないこと
- [ ] 互換性: Safari・Chrome・Firefox での動作確認

## 非要件（やらないこと）

- スクロール位置に応じた透明度変更
- ヘッダーのボックスシャドウ追加
- ダブルスティッキー（複数のヘッダーが並ぶ構造）

## 背景・コンテキスト

### 現在の問題点
- カレンダー画面をスクロール時に、「2026年3月」テキストと「年月を選択」コンポーネント（ChangeCalendarMonth）が流れてしまう
- ユーザーは月を把握するためにスクロール位置を戻す必要がある

### ユーザー体験の向上
- 月の視認性向上
- スクロール時の操作フローが改善
- PC・モバイル両方での利便性向上

## 設計方針（概要）

### 実装ファイル
1. `src/pages/Home.tsx` - sticky コンテナの追加
2. `src/components/ChangeCalendarMonth.tsx` - position: absolute → relative への変更

### 実装アプローチ
1. **Home.tsx**: ChangeCalendarMonth と Calendar のヘッダーを sticky コンテナでラップ
   - `position: sticky`, `top: 0`, `zIndex: 1200`, `bgcolor: background.paper`
   
2. **ChangeCalendarMonth.tsx**: 
   - `position: absolute` を `position: relative` に変更
   - `top`, `left` 絶対値を削除し通常フロー化

## 検証方法

### 検証項目
1. **視認性確認**
   - カレンダー画面でスクロール時、月表示が常に表示される
   - ChangeCalendarMonth の年月選択が常に使用可能

2. **UI/UX 確認**
   - PC（1200px以上）でのレイアウトが乱れていない
   - SP（600px以下）でのレイアウトが乱れていない
   - タッチ操作時の応答性に問題なし

3. **パフォーマンス確認**
   - スクロール時のフレームレート：60fps 以上
   - スクロール操作の遅延なし

4. **互換性確認**
   - Safari での sticky 動作
   - Chrome での sticky 動作
   - Firefox での sticky 動作
