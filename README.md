# RE: STOCK（買い物・補充リスト）

- Hosting: AWS Amplify（GitHub `main` と接続）
- URL: https://main.dozq0z4lxl1p.amplifyapp.com/

## 概要
家庭内の「ストック補充」に特化したシンプルな買い物リスト。足りないものだけを一覧に出し、買い物中は在庫数を増減して管理できます。

## 技術構成
- React + Vite
- CI: GitHub Actions（build / test / lint）→ `.github/workflows/ci.yml`
- ローカル保存: `localStorage`（キー: `shopping-items-v2`）

## ディレクトリ
- `index.html`（Vite エントリ）
- `src/shopping/App.jsx`（メインUI/ロジック）
- `src/styles.css`（テーマ/レイアウト）

## 仕様
- アイテム項目
  - `name`（品名）
  - `targetStock`（目標在庫、既定 1）
  - `stockOnHand`（手持ち在庫、既定 1）
  - `tags`（複数可、カンマ区切り入力。既存タグピッカーで追加/削除可能）
  - `purchased`（購入済フラグ）
- 表示ロジック
  - 既定は「不足のみ表示」＝ `stockOnHand < targetStock`
  - トグルで「すべて表示」に切替可能
  - タグで絞り込み（既存タグチップからワンタップで切替）
- 操作
  - 追加フォーム: 品名 / 目標在庫 / 手持ち在庫 / タグ
  - 在庫操作: `-1`, `+1`, `0`（ゼロ）, `満タン`（目標まで）
  - 並び替え: 行のドラッグ＆ドロップで任意順序に変更
  - 一括削除: 二段階確認（確認→`CLEAR` 入力）

## UI/テーマ
- 無印良品風のライトテーマ（白基調・柔らかい枠線・落ち着いた配色）
- 見出し: `RE: STOCK` とサブタイトル「日々の補充を、かんたんに。」
- 右上に「要補充」バッジ（注意色）
- すべての入力/ボタンは統一高さ（CSS 変数 `--control-h`）

## 開発
```bash
npm run dev      # 開発サーバ
npm run build    # 本番ビルド
npm test         # Jest テスト
npm run lint     # ESLint
```

## デプロイ
- `main` に push すると Amplify が自動デプロイ

## 今後の拡張候補
- Amplify Data（GraphQL/REST）連携でデバイス間同期
- Amplify Auth でユーザーごとにリストを分離
- PWA 化（オフライン/ホーム追加）

Deployed by Amplify 🚀
