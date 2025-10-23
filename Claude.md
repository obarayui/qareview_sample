# レビューツールアプリケーション

## プロジェクト概要
4選択肢形式のレビュー問題を解答できるWebアプリケーション。GitHubリポジトリに保存された画像(PNG)と問題データ(JSON)を読み込み、ユーザーがレビューを行い、結果を保存する。

## 目的
- 画像を見ながら4選択肢の問題に回答
- 正解/不正解の即座なフィードバック
- レビュー結果の記録と分析

## システム構成

### データソース
- **GitHub リポジトリ**: `qareview_sample`
  - フォルダ構成:
    - `tooltest001/`, `tooltest002/`, ... (問題セットごと)
      - `dgpowerpoint_ja-fe8.png`: 問題用画像
      - `qa_new_ja.json`: 4選択肢問題データ
      - `image.json`: 画像の概要情報

### アーキテクチャ
1. **フロントエンド**: HTML/CSS/JavaScript (静的サイト)
2. **データ取得**: GitHub API または GitHub Pages経由
3. **結果保存**: S3バケット または ローカルJSONファイル

## 主要機能

### 1. ホーム画面
- レビュー対象の選択
  - URL1入力欄 (tooltest001)
  - URL2入力欄 (tooltest002)
- 選択したURLに基づいて問題をロード

### 2. レビュー画面
- 画像表示エリア
  - `dgpowerpoint_ja-fe8.png`を表示
  - `tooltest001/qa_new_ja.json`から"choice"キーを表示
- 選択肢表示
  - レビューA, B, C, Dの名前入力欄(何か/誰かの名前を表示させる)
  - 4つの選択肢ボタン
  - 各選択肢にはコメントやコンテキストを追加可能
- 正解/不正解の即時フィードバック
  - 選択後、正解を表示
  - 次の問題について「ホーム画面」に戻る

### 3. データ保存
- レビュー結果の記録
  - レビューA, B, C, Dの回答
  - 評価ID、問題ID、選択した回答、正誤
  - コメント(あれば)
- 保存先: S3バケットのJSONファイル または ローカルストレージ
- ファイル形式: `{バケット名}/json/ファイル名` (データ追加形式)

## データフォーマット

### qa_new_ja.json (問題データ)
```json
{
  "question": "問題文",
  "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "correct_answer": 0,
  "explanation": "解説文(オプション)"
}
```

### image.json (画像概要)
```json
{
  "title": "画像タイトル",
  "description": "画像の説明"
}
```

### 結果保存形式 (S3/ローカル)
```json
{
  "review_id": "unique_id",
  "question_set": "tooltest001",
  "reviewers": {
    "A": "レビューアA名",
    "B": "レビューアB名",
    "C": "レビューアC名",
    "D": "レビューアD名"
  },
  "answers": {
    "A": 0,
    "B": 1,
    "C": 2,
    "D": 0
  },
  "correct_answer": 0,
  "timestamp": "2025-10-23T10:30:00Z",
  "comments": {
    "A": "コメント内容(オプション)"
  }
}
```

## 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: レスポンシブデザイン、モダンなUI
- **JavaScript (Vanilla)**: 
  - GitHub API呼び出し
  - DOM操作
  - ローカルストレージ/S3への保存

### GitHub連携
- **方法1**: GitHub Pages (推奨)
  - リポジトリをGitHub Pagesで公開
  - 直接ファイルパスでアクセス
  - 認証不要、シンプル
  
- **方法2**: GitHub API
  - REST API v3を使用
  - `GET /repos/{owner}/{repo}/contents/{path}`
  - パブリックリポジトリなら認証不要

### データ保存オプション
- **オプション1**: AWS S3 (スケーラブル)
  - AWS SDK for JavaScript
  - CORS設定が必要
  - 認証情報の管理
  
- **オプション2**: ローカルストレージ (シンプル)
  - `localStorage` API
  - ブラウザ内で完結
  - エクスポート機能を追加

- **オプション3**: GitHub Issues/Gist
  - GitHub APIで保存
  - バージョン管理が自動
  - 無料で利用可能

## ディレクトリ構成

```
review-tool/
├── index.html              # ホーム画面
├── review.html             # レビュー画面
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── app.js             # メインロジック
│   ├── github.js          # GitHub API連携
│   └── storage.js         # データ保存処理
└── README.md              # プロジェクト説明
```

## 開発ステップ

### Phase 1: 基本機能
1. ホーム画面の作成（URL入力）
2. GitHubからデータ取得
3. 画像と選択肢の表示
4. 回答選択と正誤判定

### Phase 2: データ保存
1. レビュー結果の構造化
2. ローカルストレージへの保存
3. (オプション) S3連携

### Phase 3: UI改善
1. レスポンシブデザイン
2. アニメーション・フィードバック
3. エラーハンドリング

### Phase 4: 追加機能
1. 履歴表示
2. 統計情報
3. エクスポート機能

## 注意事項

### セキュリティ
- GitHub Personal Access Tokenは環境変数で管理
- S3認証情報は適切に保護
- CORS設定を正しく構成

### パフォーマンス
- 画像の遅延読み込み
- APIリクエストのキャッシング
- ローディング状態の表示

### ユーザビリティ
- 直感的なUI/UX
- モバイル対応
- アクセシビリティ考慮

## 今後の拡張案
- 複数問題のバッチ処理
- レビューアごとの統計分析
- 問題セットの管理画面
- コメント機能の強化
- チーム機能（複数人でレビュー）

## 参考リソース
- [GitHub REST API](https://docs.github.com/en/rest)
- [AWS S3 JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
- [localStorage API](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)
