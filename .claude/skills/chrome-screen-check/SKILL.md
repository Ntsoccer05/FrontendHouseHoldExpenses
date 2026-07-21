---
name: chrome-screen-check
description: Use when you need to visually verify this React frontend (http://localhost:5173) after implementing or changing a feature - drives real Chrome via chrome-devtools-mcp, logs in with the seeded test account, and checks screenshots/console/network for regressions before claiming a UI change works
---

# Chromeでの画面確認フロー

## 概要

コードの変更を「動くはず」で終わらせず、実際にブラウザで動かして確認する。`chrome-devtools-mcp`（`.mcp.json` に登録済み）を使い、実ブラウザでログイン→対象画面への遷移→スクリーンショット・コンソール・ネットワークの確認までを行う。

**核心原則:** UI変更を完了と主張する前に、必ず実ブラウザで見る。型チェック・lint・ビルド成功はUIが正しく動く証拠にならない。

## 使うタイミング

- ページ・コンポーネントを追加/修正した後
- APIレスポンスの形が変わり、画面表示への影響を確認したいとき
- 「画面で確認して」「動作確認して」とユーザーに言われたとき
- バグ修正後、実際に直ったか目視確認したいとき

## 前提条件

このリポジトリはフロントエンド単体で、`../HouseHoldExpenses` リポジトリのLaravel APIに依存している（`.env` の `VITE_API_URL=http://localhost:8000`）。

1. バックエンド（`C:\WorkSpace\HouseHoldExpenses`）のDockerコンテナが起動していること
   ```bash
   cd /c/WorkSpace/HouseHoldExpenses && docker-compose ps
   # 動いていなければ
   docker-compose up -d
   ```
2. このリポジトリのVite dev serverが `http://localhost:5173` で起動していること
   ```bash
   npm run dev
   ```
   すでに起動しているかは `Invoke-WebRequest http://localhost:5173/` 等で200が返るか確認できる。
3. `.mcp.json`（このリポジトリのルート）に `chrome-devtools` サーバーが登録済みであること。未登録なら以下を追加する:
   ```json
   {
     "mcpServers": {
       "chrome-devtools": {
         "command": "npx",
         "args": ["-y", "chrome-devtools-mcp@latest"]
       }
     }
   }
   ```
   新規追加した場合や初回利用時は、Claude Codeの再起動とMCPサーバーの信頼承認が必要。

## テスト用ログインアカウント

バックエンド側（`HouseHoldExpenses/src/database/seeders/TestAccountSeeder.php`）で作成される、画面確認専用のアカウント。同じMySQLを共有しているため、このフロントエンドからもそのままログインできる。

| 項目 | 値 |
|---|---|
| ログインページ | `/login`（例: `http://localhost:5173/login`） |
| メール | `test-kakep@example.com` |
| パスワード | `kakepassword` |
| 家計簿データ | 約10,000件（収入1,200件・支出8,800件、直近24ヶ月に分散） |

データが壊れた/リセットしたい場合はバックエンドリポジトリ側で再実行する（冪等・カテゴリとデータを作り直す）:
```bash
cd /c/WorkSpace/HouseHoldExpenses
docker exec householdexpenses-app-1 php artisan db:seed --class=TestAccountSeeder
```

## 手順

### 1. chrome-devtools-mcpのツールを確認する

deferred tool一覧に `mcp__chrome-devtools__*` が見えているはず。まだ具体スキーマを読み込んでいなければ `ToolSearch` で該当ツール（ページ遷移・スナップショット・クリック・入力・スクリーンショット・コンソール取得・ネットワーク取得系）を読み込む。

```
ToolSearch(query: "chrome-devtools", max_results: 20)
```

ツール名はバージョンで変わりうるので、事前にこの手順で実際の名前を確認してから使うこと（決め打ちしない）。

### 2. ログインページへ遷移してログインする

1. `http://localhost:5173/login` へナビゲート（未ログインなら `PrivateRoute` により自動でここへリダイレクトされる）
2. スナップショットを取得し、email/password入力欄とログインボタンの要素を特定
3. email欄に `test-kakep@example.com`、password欄に `kakepassword` を入力
4. ログインボタンをクリック
5. ホーム画面（カレンダー等）へ遷移するまで待機
6. スナップショットかスクリーンショットでログイン成功を確認（ログインフォームが消えている、カレンダーやユーザー情報が表示されている等）

ログインに失敗した場合は、まずバックエンド側のテストアカウント状態（`email_verified_at`・パスワード）や、バックエンドDockerコンテナ・API疎通を確認してから原因調査する。フロントの実装問題か、バックエンド/データの問題かを切り分けること。

### 3. 確認したい画面へ遷移し、証拠を集める

- 対象画面（カレンダー、支出一覧、予算、レポート/チャートなど）へナビゲートまたはUI操作で遷移
- スクリーンショットを取得し、レイアウト崩れや意図した表示になっているか確認
- コンソールメッセージを取得し、JSエラー・Reactの警告が出ていないか確認
- ネットワークリクエストを取得し、`localhost:8000` へのAPI呼び出しが失敗（4xx/5xx）していないか確認
- 1万件データが入っているアカウントなので、一覧・カレンダーのページング/パフォーマンス確認にも使える

### 4. 結果を報告する

- 何を確認し、何が見えたか（スクリーンショットの内容、コンソール/ネットワークの状態）を簡潔に報告する
- 問題を見つけた場合は、そのまま「直りました」と言わず、`systematic-debugging` スキルに従って原因を特定してから修正する
- 修正後は同じ画面を再度確認し、直ったことをスクリーンショット等の新しい証拠で確認する（`verification-before-completion` の原則: 新しい証拠なしに完了を主張しない）

## よくある失敗

**❌ ビルド・lint・typecheckが通ったから完了と報告する** — それらはUIの見た目や挙動を保証しない
**✅ 実際にブラウザで開いて確認する**

**❌ スクリーンショットを撮って中身を見ずに「確認しました」と報告する**
**✅ スクリーンショットの内容を実際に読み、意図通りか判断してから報告する**

**❌ コンソールエラーを見ずにスクリーンショットだけで判断する**
**✅ 見た目が正常でも、コンソール・ネットワークのエラーは別途確認する**

**❌ バックエンドDockerが起動しているか確認せずナビゲートしていきなり失敗する**
**✅ 前提条件（バックエンド・Vite両方の起動状況）を先に確認する**
