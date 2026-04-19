# カレンダーヘッダー固定 - 初期要件（修正版）

## 概要

**一言説明**: カレンダー画面でスクロール時に、「2026年4月」の月表示を sticky 固定する機能。

**目的**: ユーザーがスクロール中でも現在表示中の月が常に視認できるようにし、ナビゲーションの利便性を向上させる。

---

## ChangeCalendarMonth の現状レイアウト理解（必読）

要件を正しく実装するには、現在の特殊なレイアウト構造を理解する必要がある。

### MobileDatePicker の絶対配置

`ChangeCalendarMonth.tsx` の `MobileDatePicker` は **`position: absolute`** で配置されており、
FullCalendar の `fc-toolbar-title`（「2026年4月」テキスト）に透明な input を重ねる構造になっている。

```
top: { xs: "183px", sm: "202px", md: "205px" }  ← ページ先頭からの距離
left: { xs: "0%", md: "235px" }
```

これらの値は以下の積み上げ計算で決定されている:

| ブレークポイント | Toolbar spacer | main padding-top | MonthlySummary | 計 |
|---|---|---|---|---|
| xs (mobile) | 56px | 16px | ~111px | **183px** |
| sm | 64px | 24px | ~114px | **202px** |
| md | 64px | 24px | ~117px | **205px** |

### モバイルのスクロール構造

```
AppBar (position: fixed, 56px)
Toolbar spacer (56px)
MonthlySummary (~111px)
Grid [ChangeCalendarMonth] (実効height: 0 ← MobileDatePickerがabsolute取り出し)
┌─────────────────────────────────────────────────────┐ ← 183px from page top
│ Calendar Box (position: absolute, height: 100vh,    │ ← スクロールコンテナ
│               overflowY: auto)                      │
│  fc-header-toolbar  ← ここをstickyにする           │
│  fc-col-header (日月火...)                          │
│  fc-daygrid-body (カレンダーグリッド)               │
│  ...                                                │
└─────────────────────────────────────────────────────┘

↑ MobileDatePicker (position: absolute, top: 183px) も同じ位置に重なっている
```

### なぜ元のrequirements.mdの方針が機能しないか

**問題1**: `ChangeCalendarMonth` の `position: absolute → relative` に変更すると、
MobileDatePicker が `top: 183px` から外れ、fc-toolbar-title の上に表示されなくなる。

**問題2**: `Home.tsx` で sticky コンテナをラップすると、MobileDatePicker の絶対配置基準点が
変わり（新たな positioned ancestor が挿入される）、位置がずれる。

**問題3**: `ChangeCalendarMonth` を sticky にしても、内部の `position: absolute` の
MobileDatePicker は sticky コンテナとは別の基準点（initial containing block）で計算されるため、
スクロール後に fc-toolbar-title と重ならなくなる。

---

## 要件（やること）

- モバイルスクロール時に「2026年4月」（fc-toolbar-title）が画面上部に固定表示される
- SP・PC 両方で動作確認
- スクロール時の視認性を確保（z-index 調整、背景色）
- 月切り替えクリック操作（MobileDatePicker）を壊さない

## 非要件（やらないこと）

- `ChangeCalendarMonth.tsx` の `position: absolute` を変更する
- `Home.tsx` の構造（Boxのラップ方法）を変更する
- `FullCalendar` の `headerToolbar` を `false` にする
- スクロール位置に応じた透明度変更
- ヘッダーの影（box-shadow）追加

---

## 設計方針（どうやるか）

### 実装方針

**修正対象**: `src/assets/css/calendar.css` のみ

`fc-header-toolbar` に CSS で sticky を付与するだけ。

```css
/* calendar.css に追記 */
.fc-header-toolbar.fc-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: white;
    /* 既存の margin-top: 10px はここで上書き */
    margin-top: 0;
    padding-top: 10px; /* margin の代わりに padding で見た目を維持 */
}
```

### なぜこれで機能するか

- **モバイル**: Calendar Box（`position: absolute, overflowY: auto`）がスクロールコンテナ
  - fc-header-toolbar は「このスクロールコンテナ内で」sticky になる
  - スクロールコンテナ（Calendar Box）の上端 = ページ先頭から約 183px
  - MobileDatePicker の `top: 183px` = ページ先頭から 183px = **同じ位置に重なる**
  - → sticky 後もクリック操作が機能する ✓

- **PC**: `overflow: hidden` の外側コンテナにより実質的にページがスクロールしない
  - sticky の効果は小さいが、副作用もない

### レイアウト変化なし

```
【スクロール前】          【スクロール後（sticky有効）】
 183px
  ├─ fc-header-toolbar   ├─ fc-header-toolbar ← 同じ位置に固定
  │   「2026年4月」       │   「2026年4月」
  └─ MobileDatePicker    └─ MobileDatePicker  ← 同じ位置にある
      (top: 183px)            (top: 183px)    → クリック継続可能
```

---

## 懸念事項・検討点

- **margin-top: 10px の扱い**: sticky 後にマージンが collapsed になる可能性あり。
  `margin-top: 0; padding-top: 10px;` で代替する。
- **PC での効果**: 実質スクロールなしのため、sticky の恩恵はほぼなし。副作用もなし。
- **Safari の `position: sticky` 互換性**: `position: -webkit-sticky` の追加を検討。

---

## 実装予定時期

Phase 1（最初の実装）

## 壁打ちの記録

**最終更新**: 2026-04-19

**合意内容**:
- 修正対象は `calendar.css` のみ（Home.tsx・ChangeCalendarMonth.tsx の変更不要）
- CSS sticky を `fc-header-toolbar.fc-toolbar` に適用
- MobileDatePicker の `position: absolute` は変更しない（変更するとUIが壊れる）
- sticky 後も MobileDatePicker と fc-toolbar-title の位置が合う理由:
  Calendar Box 上端 ≈ `top: 183px` のため
