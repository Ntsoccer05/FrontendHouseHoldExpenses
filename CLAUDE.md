# CLAUDE.md

家計管理 Web アプリケーション（React + TypeScript + Vite）の開発ガイド。

## テックスタック

- **フロントエンド**: React 18.3.1 + TypeScript 5.6.2
- **ビルド**: Vite 6.0.5（SWC ベース）、出力は `build/` ディレクトリ
- **UI**: Material-UI (MUI) + Emotion
- **ルーティング**: React Router 7.1.1
- **状態管理**: React Context API（AuthContext、AppContext、TransactionContext、CategoryContext）
- **フォーム**: React Hook Form + Zod バリデーション
- **API**: Axios + TanStack React Query
- **その他**: FullCalendar、Chart.js、dnd-kit

## クイックコマンド

```bash
npm run dev              # 開発サーバー起動
npm run build            # ビルド（build/ に出力）
npm run lint             # ESLint 実行
npm run format           # Prettier でコード整形
npm run typecheck        # TypeScript 型チェック
npm run check            # lint + typecheck を一度に実行
```

## スタートガイド

### 複雑な新機能を追加する場合

1. [`docs/development-workflow.md`](docs/development-workflow.md) を読む（フロー A）
2. このチャット画面で壁打ち
3. `docs/ideas/pending/` にアイデアメモを保存
4. `/prd-writing`, `/functional-design`, `/architecture-design` で永続ドキュメント作成
5. `/add-feature [機能名]` で実装開始

### シンプルな修正を行う場合

1. 指示を出す
2. `/add-feature [機能名]` で実装開始

詳細は [`docs/development-workflow.md`](docs/development-workflow.md) を参照。

## 重要なファイル

- `src/main.tsx` - エントリーポイント
- `src/routes/router.tsx` - ルーティング設定
- `src/context/AppContext.tsx` - グローバル状態
- `src/types/index.ts` - 型定義
- `vite.config.ts` - ビルド設定

## 行動原則

1. **複雑な機能は必ず壁打ち後に実装**
   - 要件が曖昧なまま実装しない
   - [`docs/development-workflow.md`](docs/development-workflow.md) のフロー A に従う

2. **tasklist.md の全タスク完了まで継続**
   - 「時間の都合により」などの理由で中断しない
   - 完了後に振り返りを記録

3. **npm run check でビルド確認**
   - コミット前に必ず実行
   - lint + typecheck が通ることを確認

4. **ドキュメント第一**
   - 実装より `docs/` の正確性を優先
   - ideas ファイルも含め、壁打ち内容は必ず記録

5. **進捗管理の徹底**
   - tasklist.md をリアルタイムで更新
   - Claude が進捗更新の責任を持つ

## アーキテクチャ概要

### ディレクトリ構造

```
src/
├── pages/           # ページコンポーネント
├── components/      # UI コンポーネント（機能別に共配置）
├── context/         # React Context（状態管理）
├── hooks/           # カスタムフック
├── utils/           # ユーティリティ関数
├── validations/     # Zod バリデーションスキーマ
├── routes/          # ルーター設定
├── types/           # TypeScript 型定義
├── config/          # 設定定数
└── theme/           # MUI テーマ
```

### 状態管理

4 つの独立した Context で状態を管理：
- **AuthContext**: ユーザー認証・セッション
- **AppContext**: グローバル UI 状態（トランザクション、カテゴリ、スナックバー）
- **TransactionContext**: トランザクション操作
- **CategoryContext**: カテゴリ管理

## 詳細情報

詳細なアーキテクチャ、設計パターン、開発タスク例は [`CLAUDE-full.md`](CLAUDE-full.md) を参照。
