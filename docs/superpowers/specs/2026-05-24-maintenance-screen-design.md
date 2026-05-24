# メンテナンス画面 設計書

## 概要

JST 毎日 1:00〜9:00 はサーバーを停止しているため、その時間帯はアプリ全画面をメンテナンス画面に差し替える。メンテナンス時間帯は設定ファイル1箇所で変更できる設計とする。

## 実装ファイル一覧

| ファイル | 役割 |
|---|---|
| `src/config/maintenance.ts` | メンテナンス時間の設定（変更箇所はここのみ） |
| `src/components/common/MaintenanceScreen.tsx` | メンテナンス画面 UI |
| `src/components/common/MaintenanceGuard.tsx` | 時刻チェックと画面切り替えロジック |
| `src/routes/router.tsx` | MaintenanceGuard を追加（2行のみ変更） |

## 詳細設計

### 1. `src/config/maintenance.ts`

```typescript
export const MAINTENANCE_SCHEDULE = {
  startHour: 1,  // メンテナンス開始時刻 (JST)
  endHour: 9,    // メンテナンス終了時刻 (JST)
} as const;
```

- `startHour` / `endHour` を変えるだけで時間帯変更が完結する
- JST 変換は MaintenanceGuard 側で行うため、ここは純粋な数値のみ

### 2. `src/components/common/MaintenanceGuard.tsx`

**責務**: 現在の JST 時刻を確認し、メンテナンス時間帯なら `MaintenanceScreen` を返す。それ以外は `children` をそのまま返す。

**JST 時刻の計算方法**:
```
JST時 = (UTC時 + 9) % 24
```
`new Date().getUTCHours()` に +9 して 24 で剰余を取ることで JST の「時」を求める。

**自動復帰**: `setInterval` で1分ごとに時刻を再チェックし、メンテナンス終了時刻になったら自動で通常画面に切り替わる。

**判定ロジック**:
```
startHour <= currentJstHour < endHour の場合 → メンテナンス画面
それ以外 → children をレンダリング
```

**Props**:
```typescript
{ children: React.ReactNode }
```

### 3. `src/components/common/MaintenanceScreen.tsx`

**デザイン**:
- 画面全体を `grey[100]` 背景で覆う (`min-height: 100vh`)
- 中央に MUI `Card` を配置
- MUI の `BuildIcon`（または `EngineeringIcon`）をアクセントカラーで表示
- `primary.main`（MUI デフォルト青）でアイコン・タイトルをアクセント

**表示内容**:
```
🔧  (アイコン)

サーバーメンテナンス中

現在、サーバーのメンテナンスを実施しています。

【メンテナンス時間】
毎日 1:00 〜 9:00 (JST)

ご不便をおかけして申し訳ありません。
```

**メンテナンス時間の表示**: `MAINTENANCE_SCHEDULE` から `startHour` / `endHour` を読み込んで表示するため、設定変更時に UI も自動で更新される。

### 4. `src/routes/router.tsx` の変更

`ThemeProvider` の直下、`Router` の外側に `MaintenanceGuard` を追加する。

```tsx
<ThemeProvider theme={theme}>
  <CssBaseline />
  <MaintenanceGuard>        {/* 追加 */}
    <Router>
      <AuthProvider>
        <AppProvider>
          {/* ... 既存のルート定義（変更なし） */}
        </AppProvider>
      </AuthProvider>
    </Router>
  </MaintenanceGuard>       {/* 追加 */}
</ThemeProvider>
```

この位置に置くことで：
- MUI テーマが当たった状態で `MaintenanceScreen` を描画できる
- ログイン・登録・全ルートが対象になる
- 既存のルート定義に一切手を加えない

## 非機能要件

- メンテナンス終了時に自動復帰（リロード不要）
- 時間帯変更は `src/config/maintenance.ts` の2つの数値を書き換えるだけ
- 新しいルートを追加しても自動的にメンテナンス対象になる
