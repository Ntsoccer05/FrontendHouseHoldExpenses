# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際の Claude Code (claude.ai/code) へのガイダンスを提供します。

## 概要

これは React + TypeScript + Vite で構築された家計管理 Web アプリケーションです。取引追跡、カテゴリ分類、レポート作成、予算分析など、個人財務管理の機能を提供します。

## クイックコマンド

- **開発**: `npm run dev` - Vite 開発サーバーを http://localhost:5173 で起動
- **ビルド**: `npm run build` - サイトマップを生成し Vite でバンドル (`build/` ディレクトリに出力)
- **リント**: `npm run lint` - TypeScript/TSX ファイルに ESLint を実行
- **サイトマップ生成**: `npm run generate:sitemap` - SEO 用サイトマップをビルド

## テックスタック

- **フロントエンドフレームワーク**: React 18.3.1 + TypeScript 5.6.2
- **ビルドツール**: Vite 6.0.5 (高速トランスパイル用 SWC を使用)
- **スタイリング**: Material-UI (MUI) + Emotion
- **ルーティング**: React Router 7.1.1
- **状態管理**: React Context API (Redux は使用していません)
- **フォーム**: React Hook Form + Zod バリデーション
- **データ取得**: Axios + TanStack React Query
- **UI コンポーネント**: MUI、Font Awesome アイコン、React Modal、React Icons
- **カレンダー**: FullCalendar
- **チャート**: Chart.js
- **ドラッグ&ドロップ**: dnd-kit

## プロジェクトアーキテクチャ

### コア構造

```
src/
├── pages/              # ルートレベルページ (Home、Report、Category など)
├── components/         # 再利用可能な React コンポーネント
│   ├── layout/        # アプリレイアウトラッパーコンポーネント
│   ├── Auth/          # 認証関連コンポーネント
│   ├── common/        # 共通 UI コンポーネント (SideBar、SnackBar、Loading など)
│   ├── Caluculator/   # 計算機コンポーネント
│   └── [features]/    # 機能ごとにグループ化されたコンポーネント
├── context/           # グローバル状態用 React Context プロバイダー
│   ├── AuthContext    # ユーザー認証とセッション
│   ├── AppContext     # トランザクション、カテゴリ、UI 状態などの中央状態
│   ├── TransactionContext  # トランザクション固有の状態
│   └── CategoryContext # ユーザー定義のトランザクションカテゴリ
├── hooks/             # カスタム React フック
├── utils/             # ユーティリティ関数 (axios 設定、計算、フォーマット)
├── validations/       # フォームバリデーション用 Zod スキーマ
├── routes/            # ルーター設定とルートガード
├── config/            # 設定定数
├── theme/             # Material-UI テーマのカスタマイズ
└── types/             # TypeScript 型定義
```

### 状態管理パターン

複数のコンテキストを使用した React Context API:
- **AuthContext**: ユーザー認証状態とセッションを管理
- **AppContext**: トランザクション、読み込み状態、カテゴリ、UI (スナックバー) などの中央状態
- **TransactionContext**: トランザクション固有の操作
- **CategoryContext**: ユーザー定義の収入/支出カテゴリ

各コンテキストプロバイダーはルーターをラップし、状態へのアクセス/変更用フックを公開します。

### 認証フロー

1. **公開ルート** (OnlyPublicRoute): ログイン、登録、パスワードリセット
2. **保護されたルート** (PrivateRoute): ホーム、レポート、カテゴリ - 有効な認証トークンが必要
3. **OAuth 統合**: Google と GitHub のコールバックハンドラー
4. **セッション管理**: トークン永続化にクッキーとセッションストレージを使用

## キーとなるパターンと規約

### コンポーネント
- フック付きの関数型コンポーネント (クラスコンポーネントなし)
- コンポーネントはタイプ別ではなく、機能別に共配置
- フォームコンポーネントは React Hook Form + Zod でバリデーション
- すべてのフォームスキーマは `src/validations/` ディレクトリで定義

### スタイリング
- 一貫性のための Material-UI コンポーネント
- 必要に応じて Emotion を CSS-in-JS で使用
- `src/theme/theme.ts` に一元化されたテーマ
- MUI の `useMediaQuery` とブレークポイントを使用したレスポンシブデザイン

### データ型
- `src/types/index.ts` で定義されたコア型
- トランザクション型: "income" または "expense"
- カテゴリはユニオン型として定義 (ExpenseCategory、IncomeCategory)
- API レスポンスは通常インターフェイスで型付け (Transaction、LoginUser、BaseUserCategory など)

### API 統合
- `src/utils/axios.ts` で設定された Axios クライアント
- ベース URL とインターセプターはここで管理
- キャッシング と無効化に React Query を使用
- `src/utils/errorHandling.ts` のエラーハンドリングユーティリティ

### バリデーション
- `src/validations/` のすべてのフォーム入力を Zod スキーマで検証
- スキーマカバー: Login、Register、Category、PasswordForget、PasswordReset
- React Hook Form の `useForm` を `zodResolver` で使用

## 一般的な開発タスク

### 新しいページの追加
1. `src/pages/` にコンポーネントを作成
2. `src/routes/router.tsx` にルートを追加
3. 適切なルートガード (PrivateRoute または OnlyPublicRoute) でラップ
4. 必要に応じてコンテキストプロバイダーでラップ (ホームの TransactionProvider など)

### 新しいフォームの追加
1. `src/validations/` に Zod スキーマを作成
2. React Hook Form + Zod を使用してフォームコンポーネントを作成
3. axios 呼び出しでフォーム送信を処理
4. AppContext のスナックバーシステム経由でフィードバックを表示

### 新しいコンポーネントの追加
1. `src/components/` の適切なサブディレクトリに作成
2. 一貫性のために MUI コンポーネントを使用
3. 柔軟性のために props を受け入れる
4. 必要に応じてフック (useAuthContext、useAppContext) を使用してコンテキストにアクセス

### グローバル状態の使用
- 認証コンテキスト取得: `const { user } = useAuthContext()`
- アプリ状態取得: `const { transactions, showSnackBar } = useAppContext()`
- 通知表示: `showSnackBar({ title: "Success", bodyText: "..." })`

## 重要なファイル

- `src/main.tsx` - アプリケーションエントリーポイント
- `src/routes/router.tsx` - ルーター設定とルート定義
- `src/components/layout/AppLayout.tsx` - メインアプリレイアウトラッパー
- `src/context/AppContext.tsx` - グローバル状態プロバイダー (最も頻繁に使用)
- `src/utils/axios.ts` - API クライアント設定
- `src/theme/theme.ts` - Material-UI テーマ設定
- `vite.config.ts` - Vite 設定 (注: `dist/` ではなく `build/` に出力)

## 開発ワークフロー（重要）

**新機能を実装する際の標準的なフローを定義しています。複雑度に応じて 2 つのフロー を使い分けることで、効率的かつ高品質な開発を実現します。**

- [`docs/development-workflow.md`](docs/development-workflow.md) - 実装フロー、判定方法、コマンド集、チェックリスト
- [`docs/ideas/README.md`](docs/ideas/README.md) - アイデア管理、pending/done の分離、ファイル命名ルール

## TypeScript 設定

- **厳密モード**: 有効 - すべての値は適切に型付けする必要があります
- **未使用変数**: 未使用のローカル変数とパラメータはエラーになります
- **ターゲット**: ES2020
- **JSX モード**: react-jsx (JSX ファイルで React インポートは不要)

## ビルド出力

- **開発**: Vite 開発サーバーがメモリから提供
- **本番**: `build/` ディレクトリに出力 (vite.config.ts で設定)
- **サイトマップ**: ビルド中に `sitemap-builder.ts` 経由で自動生成

## 注意事項

- アプリケーションは絶対インポート (エイリアスパス) と相対インポートの両方を使用しています
- セッション永続化はクッキーとセッションストレージで処理
- モバイルレスポンシブはMUI のレスポンシブユーティリティを使用して組み込み
- ダッシュボード/カレンダービューは FullCalendar を使用してイベント管理
