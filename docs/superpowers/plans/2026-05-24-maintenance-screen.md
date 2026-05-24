# Maintenance Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JST 毎日 1:00〜9:00 の間、全画面をメンテナンス画面に切り替え、設定ファイル1箇所で時間帯を変更できるようにする。

**Architecture:** `src/config/maintenance.ts` に開始・終了時刻を定数として定義し、`MaintenanceGuard` コンポーネントが JST 時刻を1分ごとにチェックしてメンテナンス時間帯であれば `MaintenanceScreen` を表示する。`router.tsx` の `ThemeProvider` 直下に `MaintenanceGuard` を配置することで全ルートを対象とする。

**Tech Stack:** React 18, TypeScript, MUI v5 (`@mui/material`, `@mui/icons-material`)

---

### Task 1: メンテナンス設定ファイルを作成する

**Files:**
- Create: `src/config/maintenance.ts`

- [ ] **Step 1: ファイルを作成する**

`src/config/maintenance.ts` を以下の内容で作成する。

```typescript
export const MAINTENANCE_SCHEDULE = {
  startHour: 1, // メンテナンス開始時刻 (JST)
  endHour: 9,   // メンテナンス終了時刻 (JST)
} as const;
```

- [ ] **Step 2: 型チェックを通す**

```bash
npm run typecheck
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/config/maintenance.ts
git commit -m "feat: メンテナンス時間設定ファイルを追加"
```

---

### Task 2: MaintenanceScreen コンポーネントを作成する

**Files:**
- Create: `src/components/common/MaintenanceScreen.tsx`

- [ ] **Step 1: ファイルを作成する**

`src/components/common/MaintenanceScreen.tsx` を以下の内容で作成する。

```tsx
import { Box, Card, CardContent, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { MAINTENANCE_SCHEDULE } from "../../config/maintenance";

export default function MaintenanceScreen() {
  const { startHour, endHour } = MAINTENANCE_SCHEDULE;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: "100%", textAlign: "center", p: 2 }}>
        <CardContent>
          <BuildIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            サーバーメンテナンス中
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            現在、サーバーのメンテナンスを実施しています。
          </Typography>
          <Box
            sx={{
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: 1,
              p: 2,
              mb: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              メンテナンス時間
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              毎日 {startHour}:00 〜 {endHour}:00 (JST)
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            ご不便をおかけして申し訳ありません。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
```

- [ ] **Step 2: 型チェックを通す**

```bash
npm run typecheck
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/common/MaintenanceScreen.tsx
git commit -m "feat: メンテナンス画面UIコンポーネントを追加"
```

---

### Task 3: MaintenanceGuard コンポーネントを作成する

**Files:**
- Create: `src/components/common/MaintenanceGuard.tsx`

- [ ] **Step 1: ファイルを作成する**

`src/components/common/MaintenanceGuard.tsx` を以下の内容で作成する。

```tsx
import { useState, useEffect } from "react";
import { MAINTENANCE_SCHEDULE } from "../../config/maintenance";
import MaintenanceScreen from "./MaintenanceScreen";

function isMaintenanceTime(): boolean {
  const utcHour = new Date().getUTCHours();
  const jstHour = (utcHour + 9) % 24;
  const { startHour, endHour } = MAINTENANCE_SCHEDULE;
  return jstHour >= startHour && jstHour < endHour;
}

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(isMaintenanceTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsMaintenance(isMaintenanceTime());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isMaintenance) return <MaintenanceScreen />;
  return <>{children}</>;
}
```

**ポイント:**
- `useState(isMaintenanceTime)` は関数を渡す lazy initialization。初回レンダリング時に1回だけ実行される。
- `setInterval` で1分ごとに再チェックするため、メンテナンス終了時刻になるとリロードなしで自動的に通常画面に戻る。
- JST = UTC + 9。`getUTCHours()` に +9 して 24 の剰余を取ることで JST の「時」を求める。

- [ ] **Step 2: 型チェックを通す**

```bash
npm run typecheck
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/common/MaintenanceGuard.tsx
git commit -m "feat: メンテナンス時間帯ガードコンポーネントを追加"
```

---

### Task 4: router.tsx に MaintenanceGuard を組み込む

**Files:**
- Modify: `src/routes/router.tsx`

- [ ] **Step 1: import を追加する**

`src/routes/router.tsx` の既存 import 群の末尾に以下を追加する。

```tsx
import MaintenanceGuard from "../components/common/MaintenanceGuard";
```

- [ ] **Step 2: MaintenanceGuard で Router をラップする**

`<CssBaseline />` の直後に `<MaintenanceGuard>` を追加し、`<Router>...</Router>` 全体を囲む。変更後の構造：

```tsx
function DefineRouter() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MaintenanceGuard>
          <Router>
            <AuthProvider>
              <AppProvider>
                <Routes>
                  {/* ... 既存のルート定義（変更なし） */}
                </Routes>
              </AppProvider>
            </AuthProvider>
          </Router>
        </MaintenanceGuard>
      </ThemeProvider>
    </HelmetProvider>
  );
}
```

- [ ] **Step 3: 型チェックとリントを通す**

```bash
npm run check
```

Expected: エラーなし

- [ ] **Step 4: コミット**

```bash
git add src/routes/router.tsx
git commit -m "feat: router に MaintenanceGuard を組み込む"
```

---

### Task 5: 動作確認する

- [ ] **Step 1: 開発サーバーを起動する**

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

- [ ] **Step 2: 通常時の動作を確認する**

現在時刻が JST 9:00〜翌 1:00 の範囲であれば通常のアプリ画面が表示されることを確認する。

- [ ] **Step 3: メンテナンス画面を強制表示して確認する**

`src/config/maintenance.ts` を以下のように一時的に変更して、現在時刻がメンテナンス時間内になるように調整する（例: 現在が JST 10:00 なら）：

```typescript
export const MAINTENANCE_SCHEDULE = {
  startHour: 9,  // 一時的に変更
  endHour: 23,   // 一時的に変更
} as const;
```

ブラウザをリロードして以下を確認する：
- メンテナンス画面が全画面に表示される
- カード内に「サーバーメンテナンス中」と表示される
- 「毎日 9:00 〜 23:00 (JST)」と設定値が反映されている
- ログイン・レポートなど他のURLにアクセスしてもメンテナンス画面になる

- [ ] **Step 4: 設定を元に戻す**

`src/config/maintenance.ts` を本番値に戻す：

```typescript
export const MAINTENANCE_SCHEDULE = {
  startHour: 1,
  endHour: 9,
} as const;
```

ブラウザをリロードして通常画面が表示されることを確認する。

- [ ] **Step 5: 最終コミット**

```bash
git add src/config/maintenance.ts
git commit -m "chore: メンテナンス設定を本番値に戻す"
```
