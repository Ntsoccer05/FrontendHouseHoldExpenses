---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# 実装計画の作成

## 概要

コードベースにまったく馴染みのない開発者が見ても迷わないよう、包括的な実装計画を作成します。各タスクで触るファイル、コード、確認が必要なドキュメント、テスト方法まで、必要なものをすべて文書化します。全体の計画を一口サイズのタスクに分割して提供します。DRY。YAGNI。TDD。実装完了後にリポジトリごとにまとめてコミット。

担当者はスキルのある開発者と想定しますが、ツールセットや問題ドメインについてはほとんど知らないと仮定します。また、適切なテスト設計についての知識は不足していると仮定します。

**開始時に宣言してください：** 「writing-plans スキルを使って実装計画を作成します。」

**コンテキスト：** 隔離されたワークツリーで作業している場合は、実行時に `superpowers:using-git-worktrees` スキルで作成されたものであるべきです。

**計画の保存先：** `.claude/plans/YYYY-MM-DD-<feature-name>.md`
- （ユーザーの計画ファイル配置の設定があればそちらが優先）

## スコープ確認

仕様が複数の独立したサブシステムをカバーしている場合、ブレインストーミング中にサブプロジェクト仕様に分解されているべきです。されていない場合は、サブシステムごとに別の計画に分けることを提案してください。各計画は独立して動作し、テスト可能なソフトウェアを生成すべきです。

## ファイル構造

タスクを定義する前に、作成または変更されるファイルとそれぞれの責務をマップします。ここで分割の決定を確定します。

- 明確な境界と明確に定義されたインターフェースを持つユニットを設計する。各ファイルは1つの明確な責務を持つべき。
- コンテキストに収まるコードの方が推論しやすく、ファイルが集中していれば編集がより信頼できる。やりすぎの大きなファイルより小さく集中したファイルを優先する。
- 一緒に変更されるファイルは一緒に置く。技術的なレイヤーではなく、責務で分割する。
- 既存のコードベースでは確立されたパターンに従う。コードベースが大きなファイルを使っている場合は一方的に再構成しない — ただし、修正するファイルが扱いにくい大きさになっている場合、計画に分割を含めることは合理的。

この構造がタスク分解を決定します。各タスクは独立して意味をなす自己完結した変更を生成すべきです。

## タスクの粒度

**各ステップは1つのアクション（2〜5分）：**
- 「失敗するテストを書く」— ステップ
- 「失敗することを確認するために実行する」— ステップ
- 「テストをパスさせる最小限のコードを実装する」— ステップ
- 「テストを実行してパスすることを確認する」— ステップ

## 計画ドキュメントのヘッダー

**すべての計画はこのヘッダーで始めなければなりません：**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## タスク構造

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS
````

## プレースホルダー禁止

すべてのステップには開発者が必要とする実際のコンテンツが含まれていなければなりません。以下は**計画の失敗例** — 絶対に書かないでください：
- "TBD"、"TODO"、"後で実装"、"詳細を埋める"
- 「適切なエラーハンドリングを追加する」/「バリデーションを追加する」/「エッジケースを処理する」
- 「上記のテストを書く」（実際のテストコードなし）
- 「Task N と同様」（コードを繰り返す — 開発者はタスクを順不同で読む可能性がある）
- 何をするかを説明するだけでどうするかを示さないステップ（コードステップにはコードブロックが必須）
- 任意のタスクで定義されていないタイプ、関数、メソッドへの参照

## 注意事項
- 常に正確なファイルパスを記載
- すべてのステップで完全なコード — コードを変更するステップにはコードを示す
- 期待される出力を含む正確なコマンド
- DRY、YAGNI、TDD、最後にまとめてコミット

## 最終コミット

タスク内での個別コミットは行わない。すべてのタスク完了後、計画の末尾に最終コミットのステップを追加する。

複数リポジトリにまたがる場合はリポジトリごとに個別にコミットする：

```bash
cd <リポジトリA>
git add -A
git commit -m "fix: <バックエンドの変更内容>"

cd <リポジトリB>
git add -A
git commit -m "feat: <フロントエンドの変更内容>"
```

単一リポジトリの場合：

```bash
git add -A
git commit -m "feat: <実装内容を一言で>"
```

## 自己レビュー

完全な計画を書いた後、仕様を新鮮な目で見て計画を確認する。これは自分で実行するチェックリスト — サブエージェントへの委任ではない。

**1. 仕様カバレッジ：** 仕様の各セクション/要件をざっと確認する。それを実装するタスクを指摘できるか？ギャップをリストアップする。

**2. プレースホルダースキャン：** 計画の中に危険なパターンがないか検索 — 「プレースホルダー禁止」セクションのパターンのいずれか。修正する。

**3. 型の整合性：** 後のタスクで使用した型、メソッドシグネチャ、プロパティ名は、前のタスクで定義したものと一致しているか？Task 3 の `clearLayers()` が Task 7 で `clearFullLayers()` になっていたらバグ。

問題が見つかれば、インラインで修正する。再レビューは不要 — 修正して次に進む。仕様要件にタスクがない場合はタスクを追加する。

## 実行への引き渡し

計画を保存したら、実行方法を選択肢として提示する：

**「計画が完成して `.claude/plans/<filename>.md` に保存しました。2つの実行オプションがあります：**

**1. サブエージェント駆動（推奨）** — タスクごとに新しいサブエージェントを起動し、タスク間でレビュー、高速イテレーション

**2. インライン実行** — executing-plans を使用してこのセッションでタスクを実行、チェックポイント付きの一括実行

**どちらのアプローチを選択しますか？」**

**サブエージェント駆動が選ばれた場合：**
- **必須サブスキル：** superpowers:subagent-driven-development を使用
- タスクごとに新しいサブエージェント + 2段階レビュー

**インライン実行が選ばれた場合：**
- **必須サブスキル：** superpowers:executing-plans を使用
- チェックポイント付きの一括実行
