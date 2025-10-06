# URL Redirect Chrome Extension

特定のURLにアクセスしたとき、自動的に別のURLにリダイレクトするChrome拡張機能です。

## 機能

- 特定のURLから別のURLへの自動リダイレクト
- 設定画面でリダイレクトルールを管理
- URL一致方法の選択（完全一致、部分一致、正規表現）
- 複数のリダイレクトルールを設定可能
- ルールの有効/無効の切り替え

## インストール方法

1. Chrome ブラウザで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `extension` フォルダを選択

## 使い方

### リダイレクトルールの追加

1. Chrome のツールバーにある拡張機能アイコンをクリック
2. 「リダイレクト元URL」にリダイレクト元のURLを入力
3. 「リダイレクト先URL」にリダイレクト先のURLを入力
4. 一致方法を選択:
   - **完全一致**: 入力したURLと完全に一致する場合のみリダイレクト
   - **部分一致**: URLに入力した文字列が含まれる場合にリダイレクト
   - **正規表現**: 正規表現パターンにマッチする場合にリダイレクト
5. 「ルールを追加」ボタンをクリック

### ルールの管理

- **有効/無効の切り替え**: ルールの左側にあるトグルスイッチで有効/無効を切り替え
- **削除**: ルールの右側にある「削除」ボタンでルールを削除

## 一致方法の詳細

### 完全一致
- 入力したURLと完全に一致する場合のみリダイレクト
- 例: `https://example.com` → `https://example.com` のみにマッチ

### 部分一致
- URLに入力した文字列が含まれる場合にリダイレクト
- 例: `example.com` → `https://example.com`, `https://www.example.com/page` などにマッチ

### 正規表現
- 正規表現パターンにマッチする場合にリダイレクト
- 例: `.*\\.example\\.com/.*` → `https://www.example.com/page`, `https://sub.example.com/test` などにマッチ

## プロジェクト構造

```
URL_redirect_direct/
├── CLAUDE.md           # プロジェクト概要
├── README.md           # このファイル
├── plan/
│   └── plan.md        # 実装計画
└── extension/         # Chrome拡張機能
    ├── manifest.json  # 拡張機能の設定
    ├── background.js  # バックグラウンド処理
    ├── popup.html     # ポップアップUI
    ├── popup.js       # ポップアップロジック
    └── styles.css     # スタイル
```

## 技術スタック

- Manifest V3
- JavaScript (Vanilla)
- HTML/CSS
- Chrome Extensions API
  - chrome.storage (設定の保存)
  - chrome.declarativeNetRequest (リダイレクト処理)

## 注意事項

- この拡張機能はすべてのURLへのアクセス権限が必要です
- リダイレクトルールは慎重に設定してください
- 正規表現を使用する場合は、正しいパターンを入力してください

## ライセンス

MIT License
