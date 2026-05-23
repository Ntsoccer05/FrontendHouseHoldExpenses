# コード品質レビュアープロンプトテンプレート

コード品質レビュアーサブエージェントを起動するときにこのテンプレートを使用します。

**目的：** 実装が適切に構築されていることを確認する（クリーン、テスト済み、保守可能）

**起動タイミング：** 仕様適合レビューがパスした後のみ。

```
Task tool (general-purpose):
  Use template at requesting-code-review/code-reviewer.md

  DESCRIPTION: [task summary, from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
```

**標準的なコード品質の懸念に加えて、レビュアーは以下を確認すべきです：**
- 各ファイルが明確に定義されたインターフェースを持つ1つの明確な責務を持っているか？
- ユニットが独立して理解・テストできるよう分解されているか？
- 実装が計画のファイル構造に従っているか？
- この実装が既に大きな新しいファイルを作成したか、または既存ファイルを大幅に増大させたか？（既存のファイルサイズは指摘しない — この変更が貢献したものに集中する）

**コードレビュアーが返すもの：** 強み、問題（Critical/Important/Minor）、評価
