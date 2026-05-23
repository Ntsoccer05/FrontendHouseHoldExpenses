---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
---

# Git Worktree の使い方

## 概要

作業が隔離されたワークスペースで行われるようにします。プラットフォームのネイティブな worktree ツールを優先し、利用できない場合のみ git worktree にフォールバックします。

**核心原則:** まず既存の隔離を検出。次にネイティブツール。次に git。ハーネスと戦わない。

**開始時に宣言してください:** 「using-git-worktrees スキルを使って隔離されたワークスペースをセットアップします。」

## ステップ0: 既存の隔離を検出

**何かを作成する前に、既に隔離されたワークスペースにいるか確認してください。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**サブモジュールガード:** `GIT_DIR != GIT_COMMON` は git サブモジュール内でも true になります。「既に worktree にいる」と判断する前に、サブモジュールでないことを確認：

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**`GIT_DIR != GIT_COMMON`（かつサブモジュールでない）の場合:** 既にリンク worktree にいます。ステップ3（プロジェクトセットアップ）にスキップしてください。新しい worktree を作らないこと。

**`GIT_DIR == GIT_COMMON`（またはサブモジュール内）の場合:** 通常のリポジトリにいます。

worktree を作成する前にユーザーの同意を確認：

> 「隔離された worktree をセットアップしましょうか？現在のブランチを変更から保護します。」

ユーザーが断った場合は、その場で作業してステップ3に進んでください。

## ステップ1: 隔離されたワークスペースを作成

**2つのメカニズムがあります。この順番で試してください。**

### 1a. ネイティブ worktree ツール（推奨）

`EnterWorktree`、`WorktreeCreate`、`/worktree` コマンド、`--worktree` フラグなどのツールが利用できる場合はそれを使い、ステップ3にスキップしてください。

ネイティブツールはディレクトリの配置、ブランチの作成、クリーンアップを自動的に処理します。

### 1b. Git Worktree フォールバック

**ステップ1a が適用されない場合のみ** — ネイティブ worktree ツールが利用できない場合に git を使って手動で worktree を作成します。

#### ディレクトリの選択

この優先順位に従ってください：

1. **指示に宣言された worktree ディレクトリの設定があればそれを使う**
2. **既存のプロジェクトローカル worktree ディレクトリを確認:**
   ```bash
   ls -d .worktrees 2>/dev/null
   ls -d worktrees 2>/dev/null
   ```
   見つかった場合はそれを使う（両方ある場合は `.worktrees` が優先）
3. **既存のグローバルディレクトリを確認:**
   ```bash
   project=$(basename "$(git rev-parse --show-toplevel)")
   ls -d ~/.config/superpowers/worktrees/$project 2>/dev/null
   ```
4. **他にガイダンスがない場合:** プロジェクトルートの `.worktrees/` をデフォルトとする

#### 安全確認（プロジェクトローカルのみ）

**worktree を作成する前に、ディレクトリが .gitignore に含まれていることを確認してください：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**含まれていない場合:** .gitignore に追加してコミットしてから進んでください。

#### Worktree を作成する

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**サンドボックスフォールバック:** `git worktree add` がパーミッションエラーで失敗した場合、現在のディレクトリでそのまま作業してください。

## ステップ3: プロジェクトセットアップ

適切なセットアップを自動検出して実行：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## ステップ4: クリーンなベースラインを確認

ワークスペースがクリーンな状態で始まることを確認するためにテストを実行：

```bash
npm test / cargo test / pytest / go test ./... / php artisan test
```

**テストが失敗した場合:** 失敗を報告し、続行するか調査するかを確認。

**テストがパスした場合:** 準備完了を報告。

## クイックリファレンス

| 状況 | 操作 |
|-----------|--------|
| 既にリンク worktree にいる | 作成をスキップ（ステップ0） |
| サブモジュール内 | 通常のリポジトリとして扱う |
| ネイティブ worktree ツールが利用可能 | それを使う（ステップ1a） |
| ネイティブツールがない | Git worktree フォールバック（ステップ1b） |
| `.worktrees/` が存在 | それを使う（.gitignore を確認） |
| どちらも存在しない | `.worktrees/` をデフォルト |
| ディレクトリが .gitignore にない | .gitignore に追加してコミット |
| 作成でパーミッションエラー | サンドボックスフォールバック |
| ベースラインでテスト失敗 | 失敗を報告して確認 |

## よくあるミス

**ハーネスと戦う**
- **問題:** プラットフォームが既に隔離を提供しているのに `git worktree add` を使う
- **修正:** ステップ0が既存の隔離を検出。ステップ1aはネイティブツールに委ねる

**検出をスキップする**
- **問題:** 既存の worktree の中に入れ子の worktree を作成する
- **修正:** 何かを作る前に必ずステップ0を実行

**失敗したテストで続行する**
- **問題:** 新しいバグと既存の問題を区別できない
- **修正:** 失敗を報告し、明示的な許可を得てから進む

## 危険なサイン

**してはいけないこと:**
- ステップ0が既存の隔離を検出しているのに worktree を作成する
- ネイティブ worktree ツール（例: `EnterWorktree`）があるのに `git worktree add` を使う
- .gitignore の確認なしに worktree を作成する（プロジェクトローカル）
- ベースラインテストの確認をスキップする
- 失敗したテストで確認なしに進む

**すべきこと:**
- まずステップ0の検出を実行する
- ネイティブツールを git フォールバックより優先する
- プロジェクトローカルのディレクトリが .gitignore に含まれていることを確認する
- 自動検出でプロジェクトセットアップを実行する
- クリーンなテストベースラインを確認する
