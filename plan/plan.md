# URL Redirect Chrome Extension - 実装計画

## 目標
特定のURLにアクセスしたとき、自動的に別のURLにリダイレクトするChrome拡張機能を作成する。

## 要件
1. 特定のURLから別のURLへの自動リダイレクト
2. 設定画面でリダイレクトルールを管理
3. URL一致方法の選択（完全一致、部分一致、正規表現）
4. 複数のリダイレクトルールを設定可能

## 実装手順

### Phase 1: 基本構造の作成 ✓
- [x] CLAUDE.md作成
- [x] plan/plan.md作成
- [ ] tmpフォルダ作成

### Phase 2: 拡張機能ファイルの作成
- [ ] manifest.json (Manifest V3)
  - permissions: storage, declarativeNetRequest, declarativeNetRequestFeedback
  - action (popup UI)
  - background service worker

- [ ] background.js (リダイレクト処理)
  - chrome.storage からルール取得
  - chrome.declarativeNetRequest API でリダイレクト実行
  - ルールの動的更新機能

- [ ] popup.html (設定画面UI)
  - ルール一覧表示
  - ルール追加フォーム
  - ルール削除ボタン
  - 一致方法選択（完全一致、部分一致、正規表現）

- [ ] popup.js (設定画面ロジック)
  - ルールのCRUD操作
  - chrome.storage への保存/読み込み
  - background.js へのルール更新通知

- [ ] styles.css (スタイル)
  - シンプルで使いやすいUI

### Phase 3: テストと移動
- [ ] Chrome拡張機能として読み込んでテスト
- [ ] tmpフォルダから extension フォルダに移動
- [ ] 動作確認

## 技術詳細

### データ構造
```javascript
{
  rules: [
    {
      id: "unique-id",
      sourceUrl: "https://example.com",
      targetUrl: "https://newsite.com",
      matchType: "exact" | "partial" | "regex",
      enabled: true
    }
  ]
}
```

### API使用
- chrome.storage.local (ルールの永続化)
- chrome.declarativeNetRequest (リダイレクト実行)

## 進捗
- [x] CLAUDE.md作成
- [x] plan/plan.md作成
- [ ] 実装中...
