# テストのアンチパターン

**このリファレンスを読む場面：** テストを書いたり変更したり、モックを追加したり、本番コードにテスト専用メソッドを追加しようとしているとき。

## 概要

テストは実際の動作を検証しなければなりません — モックの動作ではなく。モックは隔離するための手段であり、テストする対象ではありません。

**核心原則：** コードが何をするかをテストする — モックが何をするかではなく。

**厳格なTDDに従うことがこれらのアンチパターンを防ぐ。**

## 鉄則

```
1. モックの動作をテストしてはならない
2. 本番クラスにテスト専用メソッドを追加してはならない
3. 依存関係を理解せずにモックしてはならない
```

## アンチパターン1：モックの動作をテストする

**違反：**
```typescript
// ❌ BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

**なぜ間違いか：**
- モックが機能することを確認しているのであって、コンポーネントが機能することではない
- モックが存在するときにパスし、存在しないときに失敗する
- 実際の動作について何も教えてくれない

**修正：**
```typescript
// ✅ GOOD: Test real component or don't mock it
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

// OR if sidebar must be mocked for isolation:
// Don't assert on the mock - test Page's behavior with sidebar present
```

### ゲート関数

```
モック要素にアサーションを付ける前に：
  「実際のコンポーネントの動作をテストしているか、ただモックの存在をテストしているか？」と問いかける

  モックの存在をテストしている場合：
    停止 — アサーションを削除するかコンポーネントのモックを外す

  代わりに実際の動作をテストする
```

## アンチパターン2：本番コードにテスト専用メソッド

**違反：**
```typescript
// ❌ BAD: destroy() only used in tests
class Session {
  async destroy() {  // Looks like production API!
    await this._workspaceManager?.destroyWorkspace(this.id);
    // ... cleanup
  }
}

// In tests
afterEach(() => session.destroy());
```

**なぜ間違いか：**
- 本番クラスがテスト専用コードで汚染される
- 本番環境で誤って呼ばれると危険
- YAGNI と関心の分離に違反する
- オブジェクトのライフサイクルとエンティティのライフサイクルを混同する

**修正：**
```typescript
// ✅ GOOD: Test utilities handle test cleanup
// Session has no destroy() - it's stateless in production

// In test-utils/
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}

// In tests
afterEach(() => cleanupSession(session));
```

### ゲート関数

```
本番クラスにメソッドを追加する前に：
  「これはテストだけで使われるか？」と問いかける

  はいの場合：
    停止 — 追加しない
    代わりにテストユーティリティに置く

  「このクラスはこのリソースのライフサイクルを所有しているか？」と問いかける

  いいえの場合：
    停止 — このメソッドに間違ったクラス
```

## アンチパターン3：理解せずにモックする

**違反：**
```typescript
// ❌ BAD: Mock breaks test logic
test('detects duplicate server', () => {
  // Mock prevents config write that test depends on!
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // Should throw - but won't!
});
```

**なぜ間違いか：**
- モックしたメソッドがテストが依存していた副作用を持っていた（設定の書き込み）
- 「安全のために」過剰にモックすることで実際の動作を壊す
- テストが間違った理由でパスするか、不可解に失敗する

**修正：**
```typescript
// ✅ GOOD: Mock at correct level
test('detects duplicate server', () => {
  // Mock the slow part, preserve behavior test needs
  vi.mock('MCPServerManager'); // Just mock slow server startup

  await addServer(config);  // Config written
  await addServer(config);  // Duplicate detected ✓
});
```

### ゲート関数

```
メソッドをモックする前に：
  停止 — まだモックしない

  1. 「実際のメソッドにはどんな副作用があるか？」と問いかける
  2. 「このテストはその副作用のいずれかに依存しているか？」と問いかける
  3. 「このテストが必要とするものを完全に理解しているか？」と問いかける

  副作用に依存している場合：
    より低いレベルでモックする（実際の遅い/外部操作）
    または必要な動作を保持するテストダブルを使う
    テストが依存する高レベルのメソッドではなく

  テストが依存しているものが不明な場合：
    まず実際の実装でテストを実行する
    実際に何が起こる必要があるかを観察する
    それから適切なレベルで最小限のモックを追加する

  危険なサイン：
    - 「安全のためにこれをモックしよう」
    - 「遅いかもしれない、モックした方が良い」
    - 依存関係チェーンを理解せずにモックする
```

## アンチパターン4：不完全なモック

**違反：**
```typescript
// ❌ BAD: Partial mock - only fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // Missing: metadata that downstream code uses
};

// Later: breaks when code accesses response.metadata.requestId
```

**なぜ間違いか：**
- **部分的なモックが構造的な前提を隠す** — 知っているフィールドだけをモックした
- **下流のコードが含めなかったフィールドに依存するかもしれない** — サイレントな失敗
- **テストはパスするが統合で失敗する** — モックは不完全、実際のAPIは完全
- **誤った信頼** — テストは実際の動作について何も証明しない

**鉄則：** 直近のテストが使うフィールドだけでなく、現実に存在する完全なデータ構造をモックする。

**修正：**
```typescript
// ✅ GOOD: Mirror real API completeness
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
  // All fields real API returns
};
```

### ゲート関数

```
モックレスポンスを作成する前に：
  確認：「実際のAPIレスポンスにはどんなフィールドがあるか？」

  アクション：
    1. ドキュメント/例から実際のAPIレスポンスを確認する
    2. システムが下流で消費するかもしれないすべてのフィールドを含める
    3. モックが実際のレスポンススキーマと完全に一致することを確認する

  重要：
    モックを作成する場合、構造全体を理解しなければならない
    部分的なモックはコードが省略したフィールドに依存するときにサイレントに失敗する

  不確かな場合：すべてのドキュメント化されたフィールドを含める
```

## アンチパターン5：後付けの統合テスト

**違反：**
```
✅ Implementation complete
❌ No tests written
"Ready for testing"
```

**なぜ間違いか：**
- テストは実装の一部であり、任意の後続作業ではない
- TDDがこれを防いだはず
- テストなしに完了と主張できない

**修正：**
```
TDDサイクル：
1. 失敗するテストを書く
2. パスさせるために実装する
3. リファクタリングする
4. それから完了と主張する
```

## モックが複雑になりすぎる場合

**警告サイン：**
- モックのセットアップがテストロジックより長い
- テストをパスさせるためにすべてをモックしている
- モックに実際のコンポーネントが持つメソッドがない
- モックが変更されるとテストが壊れる

**考慮すべきこと：** 実際のコンポーネントを使った統合テストが複雑なモックより単純なことが多い

## TDDがこれらのアンチパターンを防ぐ

**TDDが有効な理由：**
1. **まずテストを書く** → 実際に何をテストしているかを考えることを強制する
2. **失敗するのを見る** → テストがモックではなく実際の動作をテストすることを確認する
3. **最小限の実装** → テスト専用メソッドが忍び込まない
4. **実際の依存関係** → モックする前にテストが実際に何を必要とするかがわかる

**モックの動作をテストしているなら、TDDに違反した** — 実際のコードに対してテストが失敗するのを見ずにモックを追加した。

## クイックリファレンス

| アンチパターン | 修正 |
|--------------|-----|
| モック要素にアサーション | 実際のコンポーネントをテストするかモックを外す |
| 本番コードにテスト専用メソッド | テストユーティリティに移動 |
| 理解せずにモック | まず依存関係を理解し、最小限にモックする |
| 不完全なモック | 実際のAPIを完全にミラーする |
| 後付けのテスト | TDD — まずテスト |
| 複雑すぎるモック | 統合テストを検討する |

## 危険なサイン

- `*-mock` テストIDを確認するアサーション
- テストファイルのみで呼ばれるメソッド
- モックのセットアップがテストの50%以上
- モックを削除するとテストが失敗する
- モックが必要な理由を説明できない
- 「安全のためにモックする」

## まとめ

**モックは隔離するためのツールであり、テストする対象ではない。**

TDDがモックの動作をテストしていることを明らかにした場合、間違いがある。

修正：実際の動作をテストするか、なぜモックしているのかを問い直す。
