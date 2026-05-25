---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# コードレビューの依頼

問題が連鎖する前に捕捉するためにコードレビュアーサブエージェントを起動します。レビュアーは評価のために正確に構成されたコンテキストを受け取ります — 自分のセッション履歴は渡しません。これによりレビュアーは思考プロセスではなく成果物に集中でき、自分自身のコンテキストも継続作業のために保たれます。

**核心原則：** 早めに・頻繁にレビューする。

## レビューを依頼するタイミング

**必須：**
- サブエージェント駆動開発の各タスク後
- 主要機能の完了後
- mainへのマージ前

**任意だが価値がある：**
- 詰まったとき（新鮮な視点）
- リファクタリング前（ベースラインの確認）
- 複雑なバグ修正後

## 依頼方法

**1. git SHA を取得する：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # または origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. コードレビュアーサブエージェントを起動する：**

`general-purpose` タイプのTaskツールを使い、`code-reviewer.md` のテンプレートを入力する

**プレースホルダー：**
- `{DESCRIPTION}` — 作成したものの簡潔なサマリー
- `{PLAN_OR_REQUIREMENTS}` — 何をすべきか
- `{BASE_SHA}` — 開始コミット
- `{HEAD_SHA}` — 終了コミット

**3. フィードバックに対応する：**
- Critical の問題は即座に修正する
- Important の問題は進む前に修正する
- Minor の問題は後で修正するためにメモする
- レビュアーが間違っている場合は（理由を示して）反論する

## 例

```
[Task 2: 検証関数の追加が完了]

You: 進む前にコードレビューを依頼します。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[コードレビュアーサブエージェントを起動]
  DESCRIPTION: verifyIndex() と repairIndex() を4種類のissueタイプで追加
  PLAN_OR_REQUIREMENTS: .claude/plans/deployment-plan.md の Task 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[サブエージェントが返す]:
  Strengths: クリーンなアーキテクチャ、実際のテスト
  Issues:
    Important: 進捗インジケーターが不足
    Minor: レポート間隔のマジックナンバー（100）
  Assessment: 進行可能

You: [進捗インジケーターを修正]
[Task 3 に進む]
```

## ワークフローとの統合

**サブエージェント駆動開発：**
- 各タスクの後にレビュー
- 問題が積み重なる前に捕捉
- 次のタスクに移る前に修正

**executing-plans：**
- 各タスクまたは自然なチェックポイントでレビュー
- フィードバックを得て、適用して、続行

**アドホック開発：**
- マージ前にレビュー
- 詰まったときにレビュー

## 危険なサイン

**してはいけないこと：**
- 「シンプルだから」レビューをスキップする
- Critical の問題を無視する
- 修正していない Important の問題で進む
- 有効な技術的フィードバックに反論する

**レビュアーが間違っている場合：**
- 技術的な理由を示して反論する
- 動作することを証明するコード/テストを示す
- 明確化を求める

テンプレートは：requesting-code-review/code-reviewer.md を参照
