# 多層防御バリデーション

## 概要

無効なデータが原因のバグを修正するとき、一か所にバリデーションを追加するだけで十分だと感じます。しかし、その単一のチェックは異なるコードパス、リファクタリング、またはモックによってバイパスされる可能性があります。

**核心原則：** データが通過するすべてのレイヤーでバリデーションを行う。バグを構造的に不可能にする。

## 複数レイヤーが必要な理由

単一のバリデーション：「バグを修正した」
複数のレイヤー：「バグを不可能にした」

異なるレイヤーが異なるケースを捕捉する：
- エントリバリデーションがほとんどのバグを捕捉する
- ビジネスロジックがエッジケースを捕捉する
- 環境ガードがコンテキスト固有の危険を防ぐ
- デバッグログが他のレイヤーが失敗したときに役立つ

## 4つのレイヤー

### レイヤー1：エントリポイントのバリデーション
**目的：** API境界で明らかに無効な入力を拒否する

```typescript
function createProject(name: string, workingDirectory: string) {
  if (!workingDirectory || workingDirectory.trim() === '') {
    throw new Error('workingDirectory cannot be empty');
  }
  if (!existsSync(workingDirectory)) {
    throw new Error(`workingDirectory does not exist: ${workingDirectory}`);
  }
  if (!statSync(workingDirectory).isDirectory()) {
    throw new Error(`workingDirectory is not a directory: ${workingDirectory}`);
  }
  // ... proceed
}
```

### レイヤー2：ビジネスロジックのバリデーション
**目的：** データがこの操作に対して意味をなすことを確保する

```typescript
function initializeWorkspace(projectDir: string, sessionId: string) {
  if (!projectDir) {
    throw new Error('projectDir required for workspace initialization');
  }
  // ... proceed
}
```

### レイヤー3：環境ガード
**目的：** 特定のコンテキストでの危険な操作を防ぐ

```typescript
async function gitInit(directory: string) {
  // In tests, refuse git init outside temp directories
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(directory));
    const tmpDir = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmpDir)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${directory}`
      );
    }
  }
  // ... proceed
}
```

### レイヤー4：デバッグ計装
**目的：** フォレンジックのためのコンテキストをキャプチャする

```typescript
async function gitInit(directory: string) {
  const stack = new Error().stack;
  logger.debug('About to git init', {
    directory,
    cwd: process.cwd(),
    stack,
  });
  // ... proceed
}
```

## パターンの適用方法

バグを見つけたとき：

1. **データフローをトレースする** — 不正な値の発生源はどこか？どこで使われるか？
2. **すべてのチェックポイントをマップする** — データが通過するすべてのポイントをリストアップする
3. **各レイヤーにバリデーションを追加する** — エントリ、ビジネス、環境、デバッグ
4. **各レイヤーをテストする** — レイヤー1をバイパスしてみて、レイヤー2が捕捉することを確認する

## セッションからの例

バグ：空の `projectDir` がソースコードでの `git init` を引き起こした

**データフロー：**
1. テストセットアップ → 空文字列
2. `Project.create(name, '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` が `process.cwd()` で実行される

**追加された4つのレイヤー：**
- レイヤー1：`Project.create()` が空でない/存在する/書き込み可能を検証
- レイヤー2：`WorkspaceManager` が projectDir が空でないことを検証
- レイヤー3：`WorktreeManager` がテスト中に tmpdir 外での git init を拒否
- レイヤー4：git init の前にスタックトレースのログを記録

**結果：** 1847のテストがすべてパス、バグを再現不可能

## 重要な洞察

テスト中、4つのレイヤーはすべて必要だった。各レイヤーが他のレイヤーが見落としたバグを捕捉した：
- 異なるコードパスがエントリバリデーションをバイパスした
- モックがビジネスロジックチェックをバイパスした
- 異なるプラットフォームのエッジケースに環境ガードが必要だった
- デバッグログが構造的な誤用を特定した

**一つのバリデーションポイントで止まらない。** すべてのレイヤーにチェックを追加する。
