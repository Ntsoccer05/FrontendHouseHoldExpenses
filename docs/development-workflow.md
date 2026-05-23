# 開発ワークフロー（Superpowers）

このプロジェクトは **Superpowers スキル** を使って機能開発を進めます。
スキルは `.claude/skills/` に配置されており、Claude Code が会話の流れに応じて自動的に適用します。

---

## 全体フロー

```
アイデア
  ↓
[brainstorming] 設計・要件整理 → docs/superpowers/specs/
  ↓
[writing-plans] 実装計画作成 → docs/superpowers/plans/
  ↓
[subagent-driven-development] タスク実行（推奨）
  または
[executing-plans] タスク実行（同一セッション）
  ↓
マージ / PR / ブランチ保持（ご自身で判断）
```

---

## フェーズ1：設計（brainstorming）

### いつ使う
新機能・改善案を思いついたとき。コードを書く前に**必ず**このフェーズを通します。

### 始め方
Claude Code のチャットでやりたいことを話しかけるだけです。

```
「支出の月次グラフに前月比を表示したい」
「ダークモードに対応したい」
「カテゴリフィルターを複数選択できるようにしたい」
```

### Claude がすること
1. `src/` のコード・`docs/` のドキュメント・最近のコミットを確認
2. 一問ずつ質問して要件を明確化
3. 2〜3 のアプローチを提案（トレードオフ付き）
4. 設計をセクションごとに提示して承認を得る
5. 設計書を `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` に保存・コミット

### アイデアの事前メモ
設計フェーズより先にアイデアをメモしておきたい場合は `docs/ideas/pending/` を使えます。
命名規則: `feature-<機能名>.md` / `improvement-<改善名>.md` / `bugfix-<バグ名>.md`

詳細は [`docs/ideas/README.md`](ideas/README.md) を参照してください。
完了後は `docs/ideas/done/` に移動してください。

---

## フェーズ2：実装計画（writing-plans）

### いつ使う
設計が承認された直後。`brainstorming` スキルが自動的に移行します。

### Claude がすること
1. 設計書を読み込み、影響ファイルを洗い出す
2. TDD サイクル付きのタスクに分解（各タスク 2〜5 分の粒度）
3. 計画を `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` に保存
4. 実行方法の選択肢を提示

### 計画のタスク例（React コンポーネント追加の場合）

```markdown
### Task 1: MonthlyComparisonChart コンポーネント

**Files:**
- Create: `src/components/Report/MonthlyComparisonChart.tsx`
- Modify: `src/pages/Report.tsx`

- [ ] Step 1: テストを書く（失敗することを確認）
- [ ] Step 2: npm test でテストが失敗することを確認
- [ ] Step 3: 最小限のコンポーネントを実装
- [ ] Step 4: npm test でテストが通ることを確認
- [ ] Step 5: コミット
```

---

## フェーズ3：実装（subagent-driven-development）

### 推奨: subagent-driven-development

タスクごとに専用サブエージェントを起動し、2 段階レビューを自動実行します。

```
各タスク:
  実装サブエージェント → 仕様準拠レビュー → コード品質レビュー → 完了
```

**特徴**:
- 文脈汚染なし（各タスクが独立）
- 2 段階の自動品質チェック
- 中断不要で全タスク連続実行

### 代替: executing-plans

同一セッションでチェックポイントを設けながら実行します。

```
[blocker 発生] → 即停止 → ユーザーに確認 → 再開
```

### 実装時の品質チェックコマンド

```bash
# TypeScript 型チェック（必須）
npm run typecheck

# ESLint（必須）
npm run lint

# 両方まとめて
npm run check

# ビルド確認
npm run build

# 開発サーバー
npm run dev    # http://localhost:5173
```

### このプロジェクトのコーディング規約

- **コンポーネント**: 関数型のみ（クラスコンポーネント禁止）
- **スタイリング**: MUI コンポーネントを使用、テーマは `src/theme/theme.ts`
- **フォーム**: React Hook Form + Zod（スキーマは `src/validations/` に配置）
- **状態管理**: React Context API（`src/context/` 参照）
- **API 呼び出し**: `src/utils/axios.ts` のクライアントを使用
- **型定義**: `src/types/index.ts` に集約

### 新しいページを追加する場合

```
1. src/pages/ にコンポーネントを作成
2. src/routes/router.tsx にルートを追加
3. PrivateRoute または OnlyPublicRoute でラップ
4. 必要に応じてコンテキストプロバイダーでラップ
```

### 新しいフォームを追加する場合

```
1. src/validations/ に Zod スキーマを作成
2. React Hook Form + zodResolver でフォームを構築
3. AppContext の showSnackBar でフィードバック表示
```

### テストの書き方（未整備→整備推奨）

現在自動テストは未整備です。`test-driven-development` スキルに従って新機能から順次追加してください。

```bash
# 将来的に使用するコマンド（Vitest を推奨）
npm test
```

---

## フェーズ4：完了処理（ご自身で判断）

全タスク完了後、以下を確認してからブランチを処理してください。

**完了前に必ず確認**:
- `npm run typecheck` がエラーなし
- `npm run lint` がエラーなし
- `npm run build` が成功

**完了方法（任意で選択）**:
```bash
# ローカルマージ
git checkout main && git merge <branch>

# PR 作成
git push -u origin <branch>
gh pr create

# ブランチをそのまま保持
git push -u origin <branch>
```

---

## 補助スキル

### バグが出たとき → systematic-debugging

```
「このコンポーネントがレンダリングされない」
「TypeScript のエラーが消えない」
「API のレスポンスが正しく表示されない」
```

**4 フェーズ**: 根本原因調査 → パターン分析 → 仮説とテスト → 実装
**禁止**: 「とりあえず直してみる」「`as any` で黙らせる」

### 新機能実装前 → test-driven-development

```
RED（失敗テストを書く） → GREEN（最小限の実装） → REFACTOR（整理）
```

### 完了を宣言する前 → verification-before-completion

「動いてると思います」は禁止。必ずコマンドを実行して出力を確認してから報告。

```bash
npm run typecheck   # エラー 0 件を確認
npm run lint        # エラー 0 件を確認
npm run build       # exit 0 を確認
```

### コードレビュー → requesting-code-review / receiving-code-review

PR 作成前・主要機能完了後にレビューサブエージェントを起動してチェック。

### 複数バグ同時発生 → dispatching-parallel-agents

独立した問題（例: コンポーネント A のバグ と コンポーネント B のバグ）を並列エージェントで同時調査。

### 機能ブランチを切る → using-git-worktrees

main ブランチを汚さずに安全な作業環境を確保。

---

## ドキュメント管理

| 種別 | 場所 | 管理スキル |
|------|------|-----------|
| 設計書（仕様） | `docs/superpowers/specs/` | `brainstorming` |
| 実装計画 | `docs/superpowers/plans/` | `writing-plans` |
| アイデアメモ | `docs/ideas/pending/` → `docs/ideas/done/` | 手動 |
| 要件定義 | （HouseHoldExpenses 側で管理） | — |

---

## よくあるシナリオ

### シナリオ 1: 新しいページ（画面）を追加する

```
1. brainstorming で画面仕様・データフロー・ルートを設計
2. writing-plans で以下に分解:
   - ページコンポーネント作成
   - ルート追加
   - API フック作成
   - コンテキスト更新（必要な場合）
3. subagent-driven-development で実装
4. npm run typecheck && npm run build で確認
5. `git push` して PR 作成
```

### シナリオ 2: バグを発見した

```
1. systematic-debugging で根本原因を特定
2. test-driven-development で失敗テストを先に書く
3. 修正を実装
4. npm run typecheck でエラーなしを確認
5. verification-before-completion で完了宣言
```

### シナリオ 3: 複数コンポーネントの独立したバグ

```
1. 各バグが独立しているか判断
2. 独立していれば dispatching-parallel-agents で並列調査
3. 各エージェントが根本原因を特定・修正
4. npm run typecheck で全体確認
```

### シナリオ 4: 既存コンポーネントをリファクタリング

```
1. brainstorming でリファクタリング範囲と目標を設計
2. writing-plans で影響ファイルと順序を計画
   （壊れたら気付けるよう、先にテストを書く）
3. subagent-driven-development で実装
4. npm run check で品質確認
```

---

## バックエンド API との連携

このプロジェクトは `HouseHoldExpenses`（Laravel）の API を利用します。

| 項目 | 値 |
|------|-----|
| API ベース URL（開発） | `http://localhost:9000/api` |
| 認証 | Laravel Sanctum（Cookie ベース） |
| API クライアント | `src/utils/axios.ts` |
| API 仕様書 | `HouseHoldExpenses/api/openapi.yaml` |

新しい API エンドポイントが必要な場合は、先に `HouseHoldExpenses` 側で実装してから、このプロジェクトのフロントエンドを実装してください。
