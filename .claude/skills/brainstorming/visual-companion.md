# Visual Companion ガイド

モックアップ、図、オプションを表示するためのブラウザベースのビジュアルブレインストーミングコンパニオン。

## 使うタイミング

セッションごとではなく、質問ごとに判断する。判断基準：**ユーザーはそれを読むより見た方が理解しやすいか？**

**ブラウザを使う場合（コンテンツ自体がビジュアルなとき）：**

- **UIモックアップ** — ワイヤーフレーム、レイアウト、ナビゲーション構造、コンポーネントデザイン
- **アーキテクチャ図** — システムコンポーネント、データフロー、関係マップ
- **サイドバイサイドのビジュアル比較** — 2つのレイアウト、2つの配色、2つのデザイン方向の比較
- **デザインポリッシュ** — 見た目と感触、スペーシング、ビジュアル階層に関する質問
- **空間的関係** — ステートマシン、フローチャート、図としてレンダリングされたエンティティ関係

**ターミナルを使う場合（コンテンツがテキストや表形式のとき）：**

- **要件とスコープの質問** — 「Xは何を意味するか？」、「どの機能がスコープに含まれるか？」
- **概念的なA/B/Cの選択** — 言葉で説明されたアプローチ間の選択
- **トレードオフリスト** — 長所/短所、比較表
- **技術的な決定** — APIデザイン、データモデリング、アーキテクチャアプローチの選択
- **確認質問** — 答えがビジュアルな好みではなく言葉の質問すべて

UIトピックに関する質問が自動的にビジュアル質問になるわけではない。「どんなウィザードが欲しいですか？」は概念的 — ターミナルを使う。「これらのウィザードレイアウトのどれが良いですか？」はビジュアル — ブラウザを使う。

## 仕組み

サーバーがHTMLファイルのディレクトリを監視し、最新のものをブラウザに提供します。`screen_dir` にHTMLコンテンツを書き込むと、ユーザーはブラウザで見てオプションをクリックして選択できます。選択は次のターンで読む `state_dir/events` に記録されます。

**コンテンツフラグメント vs フルドキュメント：** HTMLファイルが `<!DOCTYPE` または `<html` で始まる場合、サーバーはそのまま提供します（ヘルパースクリプトのみ注入）。それ以外の場合、サーバーはコンテンツをフレームテンプレートで自動的にラップします（ヘッダー、CSSテーマ、選択インジケーター、インタラクティブインフラストラクチャを追加）。**デフォルトでコンテンツフラグメントを書く。** ページを完全にコントロールする必要がある場合のみフルドキュメントを書く。

## セッションの開始

```bash
# Start server with persistence (mockups saved to project)
scripts/start-server.sh --project-dir /path/to/project

# Returns: {"type":"server-started","port":52341,"url":"http://localhost:52341",
#           "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

レスポンスから `screen_dir` と `state_dir` を保存する。URLを開くようユーザーに伝える。

**接続情報の見つけ方：** サーバーは起動JSONを `$STATE_DIR/server-info` に書き込みます。バックグラウンドでサーバーを起動してstdoutをキャプチャしなかった場合は、そのファイルを読んでURLとポートを取得します。`--project-dir` を使った場合は、セッションディレクトリのために `<project>/.superpowers/brainstorm/` を確認してください。

**注意：** モックアップを `.superpowers/brainstorm/` に保持してサーバー再起動後も残すために、プロジェクトのルートを `--project-dir` として渡してください。なしの場合、ファイルは `/tmp` に行きクリーンアップされます。まだなければ `.superpowers/` を `.gitignore` に追加するようユーザーに思い出させてください。

**プラットフォームごとのサーバー起動：**

**Claude Code (macOS / Linux):**
```bash
# Default mode works — the script backgrounds the server itself
scripts/start-server.sh --project-dir /path/to/project
```

**Claude Code (Windows):**
```bash
# Windows auto-detects and uses foreground mode, which blocks the tool call.
# Use run_in_background: true on the Bash tool call so the server survives
# across conversation turns.
scripts/start-server.sh --project-dir /path/to/project
```
Bashツール経由で呼び出す場合は、`run_in_background: true` を設定します。次のターンで `$STATE_DIR/server-info` を読んでURLとポートを取得します。

ブラウザからURLに到達できない場合（リモート/コンテナ化されたセットアップでよくある）は、非ループバックホストをバインドする：

```bash
scripts/start-server.sh \
  --project-dir /path/to/project \
  --host 0.0.0.0 \
  --url-host localhost
```

返されたURLのJSONに表示するホスト名を制御するには `--url-host` を使う。

## ループ

1. **サーバーが動いていることを確認**し、`screen_dir` の新しいファイルに **HTMLを書き込む**：
   - 書き込みの前に `$STATE_DIR/server-info` が存在することを確認する。存在しない場合（または `$STATE_DIR/server-stopped` が存在する場合）、サーバーが停止している — 続行前に `start-server.sh` で再起動する。サーバーは30分間操作がないと自動終了する。
   - セマンティックなファイル名を使う：`platform.html`、`visual-style.html`、`layout.html`
   - **ファイル名を再利用しない** — 各スクリーンは新しいファイルを取得する
   - Write ツールを使う — **cat/heredoc は絶対に使わない**（ターミナルにノイズを出力する）
   - サーバーが自動的に最新ファイルを提供する

2. **ユーザーに何が表示されるかを伝え、ターンを終了する：**
   - URLを思い出させる（最初だけでなくすべてのステップで）
   - 画面に表示されているものの簡潔なテキストサマリーを提供する（例：「ホームページの3つのレイアウトオプションを表示しています」）
   - ターミナルで返信するよう依頼する：「確認してください。お気に入りのオプションをクリックして選択できます。」

3. **次のターンで** — ユーザーがターミナルで返信した後：
   - `$STATE_DIR/events` が存在する場合は読む — これにはユーザーのブラウザ操作（クリック、選択）がJSONラインとして含まれる
   - ユーザーのターミナルテキストとマージして全体像を把握する
   - ターミナルメッセージが主要なフィードバック；`state_dir/events` は構造化されたインタラクションデータを提供する

4. **イテレートするか進む** — フィードバックが現在の画面を変更する場合、新しいファイルを書き込む（例：`layout-v2.html`）。現在のステップが検証されたときのみ次の質問に進む。

5. **ターミナルに戻る際はアンロードする** — 次のステップがブラウザを必要としない場合（例：確認質問、トレードオフの議論）、古いコンテンツをクリアするために待機スクリーンをプッシュする：

   ```html
   <!-- filename: waiting.html (or waiting-2.html, etc.) -->
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">Continuing in terminal...</p>
   </div>
   ```

   これにより、会話が次に進んでいる間にユーザーが解決済みの選択を見続けることを防ぐ。次のビジュアル質問が来たら、通常通り新しいコンテンツファイルをプッシュする。

6. 完了するまで繰り返す。

## コンテンツフラグメントの書き方

ページ内に入るコンテンツだけを書く。サーバーが自動的にフレームテンプレートでラップする（ヘッダー、テーマCSS、選択インジケーター、インタラクティブインフラストラクチャ）。

**最小限の例：**

```html
<h2>Which layout works better?</h2>
<p class="subtitle">Consider readability and visual hierarchy</p>

<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Single Column</h3>
      <p>Clean, focused reading experience</p>
    </div>
  </div>
  <div class="option" data-choice="b" onclick="toggleSelect(this)">
    <div class="letter">B</div>
    <div class="content">
      <h3>Two Column</h3>
      <p>Sidebar navigation with main content</p>
    </div>
  </div>
</div>
```

以上。`<html>`、CSS、`<script>` タグは不要。サーバーがすべてを提供する。

## 利用可能なCSSクラス

フレームテンプレートはコンテンツ用にこれらのCSSクラスを提供する：

### オプション（A/B/Cの選択）

```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content">
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

**複数選択：** コンテナに `data-multiselect` を追加するとユーザーが複数のオプションを選択できる。各クリックでアイテムをトグル。インジケーターバーが件数を表示。

```html
<div class="options" data-multiselect>
  <!-- same option markup — users can select/deselect multiple -->
</div>
```

### カード（ビジュアルデザイン）

```html
<div class="cards">
  <div class="card" data-choice="design1" onclick="toggleSelect(this)">
    <div class="card-image"><!-- mockup content --></div>
    <div class="card-body">
      <h3>Name</h3>
      <p>Description</p>
    </div>
  </div>
</div>
```

### モックアップコンテナ

```html
<div class="mockup">
  <div class="mockup-header">Preview: Dashboard Layout</div>
  <div class="mockup-body"><!-- your mockup HTML --></div>
</div>
```

### スプリットビュー（サイドバイサイド）

```html
<div class="split">
  <div class="mockup"><!-- left --></div>
  <div class="mockup"><!-- right --></div>
</div>
```

### 長所/短所

```html
<div class="pros-cons">
  <div class="pros"><h4>Pros</h4><ul><li>Benefit</li></ul></div>
  <div class="cons"><h4>Cons</h4><ul><li>Drawback</li></ul></div>
</div>
```

### モック要素（ワイヤーフレームビルディングブロック）

```html
<div class="mock-nav">Logo | Home | About | Contact</div>
<div style="display: flex;">
  <div class="mock-sidebar">Navigation</div>
  <div class="mock-content">Main content area</div>
</div>
<button class="mock-button">Action Button</button>
<input class="mock-input" placeholder="Input field">
<div class="placeholder">Placeholder area</div>
```

### タイポグラフィとセクション

- `h2` — ページタイトル
- `h3` — セクション見出し
- `.subtitle` — タイトル下のサブテキスト
- `.section` — ボトムマージン付きのコンテンツブロック
- `.label` — 小さな大文字のラベルテキスト

## ブラウザイベントフォーマット

ユーザーがブラウザでオプションをクリックすると、操作が `$STATE_DIR/events`（1行に1つのJSONオブジェクト）に記録される。新しいスクリーンをプッシュするとファイルが自動的にクリアされる。

```jsonl
{"type":"click","choice":"a","text":"Option A - Simple Layout","timestamp":1706000101}
{"type":"click","choice":"c","text":"Option C - Complex Grid","timestamp":1706000108}
{"type":"click","choice":"b","text":"Option B - Hybrid","timestamp":1706000115}
```

完全なイベントストリームがユーザーの探索パスを示す — 落ち着く前に複数のオプションをクリックするかもしれない。最後の `choice` イベントが通常最終選択だが、クリックのパターンが迷いや質問する価値のある好みを明らかにすることがある。

`$STATE_DIR/events` が存在しない場合、ユーザーはブラウザと操作しなかった — ターミナルテキストのみを使用する。

## デザインのヒント

- **質問に合わせて忠実度をスケールする** — レイアウトにはワイヤーフレーム、ポリッシュの質問にはポリッシュ
- **各ページで質問を説明する** — 「選んでください」だけでなく「どのレイアウトがより専門的に見えますか？」
- **進む前にイテレートする** — フィードバックが現在の画面を変更する場合は新しいバージョンを書く
- **1画面あたり2〜4オプション**
- **重要なときは実際のコンテンツを使う** — フォトグラフィーポートフォリオには実際の画像（Unsplash）を使う。プレースホルダーコンテンツはデザインの問題を隠す。
- **モックアップをシンプルに保つ** — ピクセルパーフェクトなデザインではなくレイアウトと構造に集中する

## ファイルの命名

- セマンティックな名前を使う：`platform.html`、`visual-style.html`、`layout.html`
- ファイル名を再利用しない — 各スクリーンは新しいファイルでなければならない
- イテレーションには：`layout-v2.html`、`layout-v3.html` のようにバージョンサフィックスを追加
- サーバーは変更時刻で最新ファイルを提供する

## クリーンアップ

```bash
scripts/stop-server.sh $SESSION_DIR
```

セッションが `--project-dir` を使った場合、モックアップファイルは後で参照するために `.superpowers/brainstorm/` に保持されます。`/tmp` セッションのみ停止時に削除されます。

## リファレンス

- フレームテンプレート（CSSリファレンス）：`scripts/frame-template.html`
- ヘルパースクリプト（クライアントサイド）：`scripts/helper.js`
