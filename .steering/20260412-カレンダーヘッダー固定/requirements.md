# 要件（requirements.md）

初期要件ファイルを参照してください：
`docs/ideas/pending/20260412-カレンダーヘッダー固定-initial-requirements.md`

## 概要
- スクロール時に「2026年3月」テキストと「年月を選択」セクションがヘッダーとして固定される
- SP・PC 両方で動作

## 修正対象
- `src/pages/Home.tsx` - sticky コンテナの追加
- `src/components/ChangeCalendarMonth.tsx` - position 変更

## 変更内容
1. Home.tsx：ChangeCalendarMonth を sticky Box でラップ
2. ChangeCalendarMonth.tsx：position: absolute → position: relative に変更
