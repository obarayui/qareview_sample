# レビューツールアプリケーション

4選択肢形式のレビュー問題を解答できるWebアプリケーション。GitHubリポジトリに保存された画像(PNG)と問題データ(JSON)を読み込み、複数のレビューアがレビューを行い、結果を保存します。

![レビューツール](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Internal-green)

---

## 主な機能

- **画像ベースの問題表示**: PNG画像と4選択肢の問題を表示
- **1人ずつレビュー**: 1人のレビューアが問題に回答
- **即座なフィードバック**: 正解/不正解を即座に表示
- **結果の記録**: レビュー結果をローカルストレージに自動保存
- **AWS S3連携**: レビュー結果を自動的にS3バケットにアップロード（オプション）
- **データエクスポート**: JSON/CSV形式でデータをエクスポート可能
- **統計情報**: レビューアごとの正解率や問題セットごとの統計を表示
- **レスポンシブデザイン**: PC、タブレット、スマートフォンに対応

---

## 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **データソース**: GitHub リポジトリ（ローカルまたはGitHub Pages）
- **データ保存**:
  - ブラウザのローカルストレージ（デフォルト）
  - AWS S3（オプション）
- **AWS統合**: AWS SDK for JavaScript v2
- **ホスティング**: GitHub Pages（推奨）

---

## クイックスタート

### 1. ローカルで実行

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/qareview_sample.git
cd qareview_sample

# ローカルサーバーを起動（Python 3の場合）
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

### 2. GitHub Pagesで公開（推奨）

1. GitHubリポジトリの `Settings` → `Pages` に移動
2. `Source` で `main` ブランチと `/root` を選択
3. `Save` をクリック
4. 数分後、`https://yourusername.github.io/qareview_sample/` でアクセス可能

詳細なセットアップ手順は [SETUP.md](./SETUP.md) を参照してください。

---

## プロジェクト構成

```
qareview_sample/
├── index.html              # ホーム画面
├── review.html             # レビュー画面
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── app.js             # メインロジック
│   ├── github.js          # GitHub API連携
│   └── storage.js         # データ保存処理
├── tooltest001/           # 問題セット1
│   ├── dgpowerpoint_ja-fs8.png
│   ├── qa_new_ja.json
│   └── image.json
├── tooltest002/           # 問題セット2
│   ├── dgpowerpoint_ja-fs8.png
│   ├── qa_new_ja.json
│   └── image.json
├── Claude.md              # プロジェクト仕様書
├── SETUP.md               # セットアップ手順書
└── README.md              # このファイル
```

---

## 使い方

### ホーム画面

1. あなたの名前を入力
2. 問題セット（tooltest001 または tooltest002）を選択
3. 「この問題セットを開始」ボタンをクリック

### レビュー画面

1. 問題画像と4つの選択肢を確認
2. 回答を選択
3. （任意）コメントを入力
4. 「回答を提出」ボタンをクリック
5. 正解/不正解の結果を確認
6. 「次の問題へ」をクリックして続行

### AWS S3への保存（オプション）

1. `config.example.js` をコピーして `config.js` を作成
2. AWS認証情報を入力
3. レビュー結果が自動的にS3にアップロードされます

詳細は [SETUP.md](./SETUP.md) の「AWS S3への保存設定」を参照してください。

### データのエクスポート

ブラウザの開発者コンソール（F12）を開き、以下のコマンドを実行：

```javascript
// JSON形式でエクスポート
StorageManager.exportToJSON()

// CSV形式でエクスポート
StorageManager.exportToCSV()

// 統計情報を表示
StorageManager.getStatistics()

// すべてのデータをS3にアップロード（S3設定済みの場合）
StorageManager.uploadAllToS3()
```

---

## データフォーマット

### qa_new_ja.json（問題データ）

```json
[
  {
    "tag": "依存関係",
    "question": "質問文",
    "choice": [
      "選択肢1（正解）",
      "選択肢2",
      "選択肢3",
      "選択肢4"
    ],
    "authored_by": "claude",
    "is_translated": false
  }
]
```

**重要**: 正解は常に配列の最初の要素（インデックス0）です。

### image.json（画像メタデータ）

```json
{
  "title": "画像のタイトル",
  "tag": ["UML", "activity"],
  "features": "図の特徴",
  "elements": { ... }
}
```

### レビュー結果（保存形式）

```json
{
  "review_id": "review_1729680000000_abc123",
  "question_id": "tooltest001_q1",
  "question_set": "tooltest001",
  "question_index": 0,
  "question_tag": "依存関係",
  "question_text": "質問文",
  "reviewer_name": "山田太郎",
  "answer": 0,
  "correct_answer": 0,
  "is_correct": true,
  "timestamp": "2025-10-23T10:30:00Z",
  "comment": "コメント内容"
}
```

---

## 問題セットの追加

新しい問題セットを追加するには：

1. 新しいフォルダを作成（例: `tooltest003/`）
2. 以下のファイルを配置：
   - `dgpowerpoint_ja-fs8.png` - 問題画像
   - `qa_new_ja.json` - 問題データ
   - `image.json` - 画像メタデータ
3. `index.html` に新しい問題セットカードを追加

詳細は [SETUP.md](./SETUP.md) の「問題セットの追加」セクションを参照してください。

---

## カスタマイズ

### デザインのカスタマイズ

`css/style.css` を編集して、色やレイアウトを変更できます。

主な変更箇所：
- カラースキーム: `.container header` のグラデーション
- ボタンスタイル: `.btn-primary`, `.btn-secondary`
- レスポンシブブレークポイント: `@media` クエリ

### 機能の拡張

`js/app.js` を編集して、以下の機能を追加できます：
- 時間制限の追加
- ヒント機能
- 問題のシャッフル
- スコアボード

---

## トラブルシューティング

### よくある問題

**Q: 画像が表示されない**
- A: ローカルサーバーを使用しているか確認してください。直接HTMLファイルを開くとCORS制限により画像が読み込めない場合があります。

**Q: レビュー結果が保存されない**
- A: ブラウザのローカルストレージが有効か確認してください。プライベートブラウジングモードでは保存されません。

**Q: GitHub Pagesで公開したが404エラーが出る**
- A: リポジトリが公開設定になっているか、GitHub Pagesの設定が正しいか確認してください。

詳細なトラブルシューティングは [SETUP.md](./SETUP.md) を参照してください。

---

## ロードマップ

### Phase 1: 基本機能（完了）
- ✅ ホーム画面とレビュー画面
- ✅ 問題の表示と回答
- ✅ ローカルストレージへの保存

### Phase 2: データ管理（完了）
- ✅ JSON/CSVエクスポート
- ✅ 統計情報の表示
- ✅ データのクリア機能

### Phase 3: UI/UX改善（今後）
- ⬜ 履歴表示画面
- ⬜ グラフィカルな統計表示
- ⬜ ダークモード対応

### Phase 4: 拡張機能（一部完了）
- ✅ AWS S3への自動保存
- ⬜ 履歴表示画面
- ⬜ 問題セットの管理画面
- ⬜ APIバックエンドの実装（Cognito + API Gateway + Lambda）

---

## 貢献

このプロジェクトは内部使用を目的としています。改善提案やバグ報告は、GitHubのIssuesで受け付けています。

---

## ライセンス

このプロジェクトは内部使用を目的としています。

---

## お問い合わせ

質問や問題がある場合は、以下の方法でお問い合わせください：

- GitHubのIssuesを作成
- プロジェクト管理者に直接連絡

---

**作成日**: 2025-10-23
**バージョン**: 1.0.0
**最終更新**: 2025-10-23
