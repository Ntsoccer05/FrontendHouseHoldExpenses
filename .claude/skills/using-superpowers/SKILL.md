---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<SUBAGENT-STOP>
サブエージェントとして特定タスクを実行するために起動された場合は、このスキルをスキップしてください。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
スキルが適用される可能性が1%でもあると思ったら、絶対にそのスキルを起動してください。

スキルが適用される場合、選択の余地はありません。必ず使ってください。

これは交渉の余地がありません。任意ではありません。どんな理由をつけても回避できません。
</EXTREMELY-IMPORTANT>

## 指示の優先順位

Superpowers のスキルはデフォルトのシステムプロンプトより優先されますが、**ユーザーの指示が常に最優先です**：

1. **ユーザーの明示的な指示**（CLAUDE.md、直接のリクエスト） — 最高優先度
2. **Superpowers スキル** — デフォルト動作に競合する場合はオーバーライド
3. **デフォルトシステムプロンプト** — 最低優先度

CLAUDE.md に「TDD を使わない」と書かれ、スキルに「常に TDD を使う」と書かれていれば、ユーザーの指示に従います。ユーザーが主導権を持っています。

## スキルへのアクセス方法

**Claude Code:** `Skill` ツールを使います。スキルを起動するとその内容が読み込まれて提示されます—そのまま従ってください。スキルファイルに Read ツールを使わないでください。

**その他の環境:** プラットフォームのドキュメントを参照してください。

## Platform Adaptation

スキルは Claude Code のツール名を使用しています。非 CC プラットフォームの場合は `references/` 内の対応表を参照してください。

# スキルの使い方

## ルール

**関連するスキルまたは要求されたスキルを、どんな応答・行動よりも前に起動してください。** 1% でも適用の可能性があれば起動して確認します。起動したスキルが状況に合わなくても、使わなければ問題ありません。

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "About to EnterPlanMode?" -> "Already brainstormed?";
    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "User message received" -> "Might any skill apply?";
    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

## 危険なサイン（合理化していたら STOP）

| 考えていること | 現実 |
|---------|---------|
| 「これは単純な質問だ」 | 質問もタスクです。スキルを確認してください。 |
| 「まずコンテキストが必要だ」 | スキル確認は質問より先です。 |
| 「コードベースを先に探索しよう」 | スキルは探索の仕方を教えます。先に確認。 |
| 「git/ファイルをすぐ確認できる」 | ファイルには会話のコンテキストがありません。 |
| 「情報を先に集めよう」 | スキルは情報収集の方法を教えます。 |
| 「正式なスキルは不要だ」 | スキルがあれば使います。 |
| 「このスキルは覚えている」 | スキルは進化します。現在のバージョンを読む。 |
| 「これはタスクに当たらない」 | 行動＝タスク。スキルを確認。 |
| 「スキルは大げさだ」 | 単純なものが複雑になります。使ってください。 |
| 「これだけ先にやろう」 | 何かする前に確認してください。 |
| 「生産的に感じる」 | 無規律な行動は時間の無駄。スキルが防いでくれます。 |
| 「意味はわかっている」 | 概念を知っている≠スキルを使う。起動してください。 |

## スキルの優先順位

複数のスキルが適用できる場合、この順番で使います：

1. **プロセス系スキルを先に**（brainstorming、debugging） — タスクへのアプローチ方法を決定
2. **実装系スキルを次に** — 実行をガイド

「X を作ろう」→ brainstorming を先に。
「バグを直して」→ debugging を先に。

## スキルの種類

**厳格型**（TDD、debugging）: 正確に従ってください。規律から外れないこと。

**柔軟型**（パターン）: 原則をコンテキストに合わせて適用。

スキル自体がどちらかを示しています。

## ユーザーの指示について

指示は「何を」であり、「どのように」ではありません。「X を追加して」や「Y を直して」は、ワークフローをスキップする意味ではありません。
