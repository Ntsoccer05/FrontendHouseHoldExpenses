# 家計簿管理アプリ (FrontendHouseHoldExpenses)

React + TypeScript + Vite で構築された、個人・家族向けの家計管理 Web アプリケーションです。
収支の記録、カテゴリ管理、固定費管理、レポート・グラフによる分析、家計共有（グループ分割）機能などを提供します。

## 主な機能

- **収支管理**: 収入・支出の登録、編集、削除。カレンダー（FullCalendar）表示による日次・月次の確認
- **カテゴリ管理**: 収入・支出カテゴリのカスタム作成、編集、並び替え（dnd-kit によるドラッグ&ドロップ）
- **固定費管理**: 毎月発生する固定費の登録・管理
- **レポート／分析**: 月次・年次サマリー、カテゴリ別グラフ（Chart.js）、期間比較ビュー
- **家計共有 (SplitGroup)**: 複数人でのグループを作成し、家計を共有・比較
- **電卓機能**: 金額入力を補助する簡易電卓 UI
- **認証機能**:
  - メールアドレス + パスワードでの会員登録・ログイン
  - Google / GitHub による OAuth ソーシャルログイン
  - メールアドレス確認、パスワード再設定（忘れた場合のリセットフロー）
- **メンテナンスモード**: 保守作業中にアプリ全体をメンテナンス画面へ切り替える仕組み

## 技術スタック

| 分類 | 使用技術 |
|---|---|
| フレームワーク | React 18.3 + TypeScript 5.6 |
| ビルドツール | Vite 6（SWC による高速トランスパイル） |
| UI コンポーネント | Material-UI (MUI) + Emotion |
| ルーティング | React Router 7 |
| 状態管理 | React Context API（Redux は不使用） |
| フォーム | React Hook Form + Zod（バリデーション） |
| データ取得 | Axios + TanStack React Query |
| カレンダー | FullCalendar |
| グラフ | Chart.js（react-chartjs-2） |
| ドラッグ&ドロップ | dnd-kit |
| その他 | Font Awesome、React Icons、React Modal など |

## ディレクトリ構成

```
src/
├── pages/              # ルートレベルのページ（Home、Report、Category、FixedExpense、SplitGroup など）
├── components/         # 再利用可能なコンポーネント（機能ごとに分類）
│   ├── layout/          # アプリ全体のレイアウト
│   ├── Auth/            # ログイン・登録・OAuth・メール確認など認証関連
│   ├── common/          # サイドバー、スナックバー、ローディング、メンテナンス画面など共通 UI
│   ├── Caluculator/     # 金額入力用の電卓 UI
│   ├── ComparitionSummary/ # 期間比較ビュー
│   └── Dialog/          # ダイアログ関連の共通部品
├── context/             # グローバル状態管理（Auth／App／Transaction／Category／FixedExpense／SplitGroup）
├── hooks/               # カスタムフック（月次・年次データ取得、デバウンスなど）
├── api/                 # 固定費・家計共有グループ向け API クライアント
├── utils/               # Axios 設定、金額計算、フォーマット、Cookie/セッション管理など
├── validations/         # フォーム入力用の Zod バリデーションスキーマ
├── routes/              # ルーター設定とルートガード（PrivateRoute／OnlyPublicRoute）
├── config/              # 各種設定定数
├── theme/               # MUI テーマ設定
└── types/               # TypeScript の型定義
```

## セットアップ

### 必要環境

- Node.js `v22.12.0`（`.nvmrc` 参照。nvm を使用している場合は `nvm use` で切り替え可能）

### インストール

```bash
npm install
```

### 環境変数

`.env.example` を参考に `.env` ファイルを作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

## 開発コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバーを起動（http://localhost:5173 ） |
| `npm run build` | サイトマップ生成 + 本番ビルド（出力先: `build/`） |
| `npm run preview` | ビルド済みアプリのプレビュー |
| `npm run lint` | ESLint によるコードチェック |
| `npm run typecheck` | TypeScript の型チェック |
| `npm run check` | lint + typecheck をまとめて実行 |
| `npm run format` | Prettier によるコード整形 |
| `npm run generate:sitemap` | SEO 用サイトマップの生成 |

## 認証フロー

1. **公開ルート (OnlyPublicRoute)**: ログイン、会員登録、パスワード再設定など、未ログインユーザー向けのページ
2. **保護されたルート (PrivateRoute)**: ホーム、レポート、カテゴリ、固定費、家計共有など、ログインが必要なページ
3. **OAuth 連携**: Google / GitHub のコールバック処理に対応
4. **セッション管理**: Cookie とセッションストレージによりログイン状態を保持

## 開発ワークフロー

このプロジェクトは **Superpowers スキル**（`.claude/skills/`）を利用して機能開発を進めます。詳細は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

| ステップ | スキル | 出力先 |
|---|---|---|
| 1. 設計・要件整理 | `brainstorming` | `docs/superpowers/specs/` |
| 2. 実装計画作成 | `writing-plans` | `docs/superpowers/plans/` |
| 3. 計画を実行 | `subagent-driven-development` など | コード・テスト・コミット |
| 4. 完了処理 | 各自判断 | `git merge` / `git push` / PR 作成 |

新機能のアイデアは `docs/ideas/pending/` にメモを残すことができます。詳細は [`docs/ideas/README.md`](docs/ideas/README.md) を参照してください。

## 注意事項

- 現時点で自動テスト（Vitest / Jest など）は未整備です。新機能の実装時は `test-driven-development` スキルの利用を推奨します。
- ビルド成果物の出力先は `dist/` ではなく `build/` です（`vite.config.ts` にて設定）。
- モバイル対応は MUI のレスポンシブユーティリティ（`useMediaQuery` など）で実装されています。
