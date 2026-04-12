# CLAUDE-full.md

CLAUDE.md の詳細版です。アーキテクチャ設計パターン、開発タスク例、詳細な認証フローなどを説明しています。

詳細な情報が必要な場合に参照してください。

---

## 詳細なプロジェクトアーキテクチャ

### コンポーネント設計パターン

#### 関数型コンポーネント + フック
- すべてのコンポーネントは関数型コンポーネント
- クラスコンポーネントは使用しない
- React フック（useState、useEffect、useContext など）を活用

#### 機能別共配置
```
src/components/
├── Auth/                    # 認証関連機能
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ...
├── layout/                  # レイアウト
│   ├── AppLayout.tsx
│   └── AppTitle.tsx
├── common/                  # 共通コンポーネント
│   ├── SideBar.tsx
│   ├── SnackBar.tsx
│   └── Loading.tsx
└── [feature]/              # 各機能
    ├── TransactionForm.tsx
    ├── TransactionTable.tsx
    └── ...
```

コンポーネントはタイプ（ボタン、入力など）ではなく、**機能ごとにグループ化**。

#### フォームコンポーネント + バリデーション

すべてのフォームは以下のパターンで実装：

```typescript
// 1. src/validations/ に Zod スキーマを定義
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// 2. フォームコンポーネントで使用
function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  return <form>{/* フォーム要素 */}</form>;
}
```

### 状態管理パターン

#### 4 つの Context の役割分担

**AuthContext**
- ユーザー認証状態（ログイン中か、ログインユーザーは誰か）
- セッション管理（トークン、クッキー）

**AppContext**
- グローバル UI 状態（ローディング、スナックバー）
- トランザクション一覧（すべてのページで共有）
- カテゴリ一覧（すべてのページで共有）

**TransactionContext**
- トランザクション固有の操作（追加、削除、更新）

**CategoryContext**
- カテゴリ固有の操作

#### Context の使用例

```typescript
// AppContext から状態を取得
const { transactions, showSnackBar } = useAppContext();

// AuthContext から認証情報を取得
const { user } = useAuthContext();

// 通知を表示
showSnackBar({
  title: "成功",
  bodyText: "トランザクションを作成しました",
});
```

### スタイリング

#### Material-UI コンポーネント
すべての UI は MUI コンポーネントで構成。直接 HTML 要素（`<div>`, `<button>` など）は最小限に。

#### テーマカスタマイズ
`src/theme/theme.ts` で全グローバルテーマを定義：
- カラーパレット
- タイポグラフィ
- コンポーネント規約

#### Emotion（CSS-in-JS）
複雑なスタイルが必要な場合のみ Emotion を使用。通常は MUI で十分。

### 認証フロー

#### 3 段階の保護

1. **公開ルート**（OnlyPublicRoute）
   - ログイン、登録、パスワードリセット
   - ログイン中ユーザーはアクセス不可（ホームにリダイレクト）

2. **保護ルート**（PrivateRoute）
   - ホーム、レポート、カテゴリ管理
   - 有効な認証トークンが必須

3. **OAuth 統合**
   - Google、GitHub でのソーシャルログイン
   - コールバックハンドラーで認証トークン取得

#### セッション永続化

```typescript
// クッキー
document.cookie = `authToken=${token}`;

// セッションストレージ
sessionStorage.setItem('user', JSON.stringify(user));
```

ページリロード後も状態が保持される。

### データ型

#### コア型（src/types/index.ts）

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = '食費' | '日用品' | /* ... */;
export type IncomeCategory = '給与' | '副収入' | /* ... */;
```

#### API レスポンスの型付け

```typescript
// API が返すデータ型
interface ApiResponse {
  data: Transaction[];
  status: number;
}

// コンポーネント内で型安全に使用
const data: Transaction[] = await fetchTransactions();
```

### API 統合

#### Axios クライアント（src/utils/axios.ts）

```typescript
// ベース URL 設定
axios.defaults.baseURL = process.env.VITE_API_URL;

// インターセプター（リクエスト前にトークン自動添付）
axios.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  return config;
});
```

#### React Query でのキャッシング

```typescript
// クエリキャッシング
const { data: transactions } = useQuery({
  queryKey: ['transactions'],
  queryFn: fetchTransactions,
  staleTime: 5 * 60 * 1000, // 5 分
});
```

### バリデーション

#### Zod スキーマの例

```typescript
// src/validations/Login.ts
export const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, '8 文字以上必須'),
});

// src/validations/Category.ts
export const categorySchema = z.object({
  label: z.string().min(1, 'カテゴリ名を入力してください'),
  icon: z.string(),
});
```

---

## 一般的な開発タスク

### 新しいページの追加

```typescript
// 1. src/pages/NewPage.tsx を作成
export default function NewPage() {
  return <div>新しいページ</div>;
}

// 2. src/routes/router.tsx にルートを追加
<Route
  path="/new-page"
  element={<PrivateRoute><NewPage /></PrivateRoute>}
/>

// 3. 必要に応じてコンテキストでラップ
<Route
  path="/new-page"
  element={
    <PrivateRoute>
      <SomeProvider>
        <NewPage />
      </SomeProvider>
    </PrivateRoute>
  }
/>
```

### 新しいフォームの追加

```typescript
// 1. src/validations/NewForm.ts にスキーマを定義
export const newFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// 2. フォームコンポーネントを作成
function NewForm() {
  const form = useForm({ resolver: zodResolver(newFormSchema) });
  const { showSnackBar } = useAppContext();

  async function onSubmit(data) {
    try {
      await apiClient.post('/api/new', data);
      showSnackBar({ title: '成功', bodyText: '保存しました' });
    } catch (error) {
      showSnackBar({ title: 'エラー', bodyText: error.message });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* フォーム要素 */}
    </form>
  );
}
```

### 新しいコンポーネントの追加

```typescript
// 1. 適切なディレクトリに作成：src/components/[Feature]/NewComponent.tsx

// 2. MUI コンポーネントを使用
import { Button, Card, TextField } from '@mui/material';

export function NewComponent({ onSubmit }) {
  return (
    <Card>
      <TextField label="入力" />
      <Button onClick={onSubmit}>送信</Button>
    </Card>
  );
}

// 3. 必要に応じて Context を使用
const { showSnackBar } = useAppContext();
```

---

## TypeScript の厳密性

### 設定

```json
{
  "compilerOptions": {
    "strict": true,           // 厳密モード有効
    "noUnusedLocals": true,   // 未使用変数はエラー
    "noUnusedParameters": true, // 未使用パラメータはエラー
    "noImplicitAny": true,    // any 型を明示的に指定
    "target": "ES2020"        // ES2020 機能を使用可
  }
}
```

### 型安全の実装例

```typescript
// ✅ 良い例
interface User {
  id: number;
  name: string;
}

function printUser(user: User): void {
  console.log(user.name);
}

// ❌ 悪い例
function printUser(user: any): void {
  console.log(user.name); // 型安全性なし
}
```

---

## ビルド・デプロイ

### ビルドプロセス

```bash
# 1. サイトマップ生成
npm run generate:sitemap

# 2. Vite でバンドル
npm run build

# 3. build/ ディレクトリに成果物が出力される
```

### ビルド出力

```
build/
├── index.html
├── assets/
│   ├── [hash].js
│   ├── [hash].css
│   └── ...
└── sitemap.xml（SEO 用）
```

### 開発サーバー

```bash
npm run dev

# http://localhost:5173 で起動
# HMR（Hot Module Replacement）対応
```

---

## トラブルシューティング

### よくあるエラー

#### 「Cannot find module」

```typescript
// ❌ 相対パスが長い
import { User } from '../../../types/index';

// ✅ 絶対パス（必要に応じて）
import { User } from '@/types/index';
```

#### 「Type '...' is not assignable to type '...'」

TypeScript の型エラー。以下を確認：
- インターフェイスが正しく定義されているか
- API レスポンスの型が正確か
- ジェネリック型が正しく指定されているか

---

## パフォーマンス最適化

### React Query でのキャッシング

```typescript
// 不要な再フェッチを防ぐ
const { data } = useQuery({
  queryKey: ['transactions'],
  queryFn: fetchTransactions,
  staleTime: 5 * 60 * 1000,  // 5 分間キャッシュ
  cacheTime: 10 * 60 * 1000, // 10 分間保持
});
```

### メモ化でのパフォーマンス向上

```typescript
// useMemo で計算結果をキャッシュ
const total = useMemo(
  () => transactions.reduce((sum, t) => sum + t.amount, 0),
  [transactions]
);

// useCallback で関数をキャッシュ
const handleClick = useCallback(() => {
  // 処理
}, [dependencies]);
```

---

## セキュリティ

### 入力検証

```typescript
// Zod で入力を検証
const schema = z.object({
  email: z.string().email(),
});

// API 送信前に必ず検証
const result = schema.safeParse(input);
if (!result.success) {
  // エラー処理
}
```

### トークン管理

```typescript
// トークンは環境変数から取得（ハードコード禁止）
const token = process.env.VITE_AUTH_TOKEN;

// クッキーに保存するときは httpOnly フラグを使用
// （サーバーサイド実装の場合）
```

### CORS 対応

API クライアントの `axios.ts` で CORS ヘッダーを管理。
