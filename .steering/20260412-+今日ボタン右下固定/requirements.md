# 要件（requirements.md）

初期要件ファイルを参照してください：
`docs/ideas/pending/20260412-+今日ボタン右下固定-initial-requirements.md`

## 概要
- スマートフォンでは正常に右下固定されるが、PC の大画面では位置がズレる
- 画面幅に応じた動的配置を実装する

## 修正対象
- `src/pages/Home.tsx` の Fab コンポーネント

## 変更内容
- `bottom: isMobile ? 10 : 274` → `bottom: { xs: 10, lg: 24 }`
- `right: isMobile ? 20 : 344` → `right: { xs: 20, lg: 24 }`
- MUI sx ブレークポイントで responsive に
