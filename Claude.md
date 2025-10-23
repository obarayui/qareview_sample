# レビューツールアプリケーション

## プロジェクト概要
4選択肢形式のレビュー問題を解答できるWebアプリケーション。ローカルまたはGitHub Pagesに保存された画像(PNG)と問題データ(JSON)を読み込み、レビューアが1人ずつレビューを行い、結果をローカルストレージに保存する。

**現在の実装状況**:
- ✅ 実装済み: 4人同時レビュー形式（レビューアA, B, C, D）
- 🔄 要修正: 1人ずつのレビュー形式に変更が必要

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

### 1. ホーム画面（index.html）
**目標仕様:**
- **レビューア名入力欄** (1つのみ)
  - 必須入力。入力されるまで開始できない
- **問題セット選択**
  - プリセット: tooltest001, tooltest002（カード形式で表示）
  - カスタムURL: GitHubリポジトリURLを直接入力可能
- **入力検証とエラー表示**
  - 未入力の場合はエラーメッセージ表示
- レビューア名と問題セットをlocalStorageに保存してreview.htmlに遷移

**現在の実装:** 4人のレビューア名入力欄（A, B, C, D）→ 1つに修正が必要

### 2. レビュー画面（review.html）
**目標仕様:**
- **ヘッダー**
  - 進捗表示（現在の問題番号/全問題数）
  - 問題セット名
  - レビューア名表示
- **画像表示エリア**
  - `dgpowerpoint_ja-fs8.png`を表示
  - レスポンシブ対応
- **問題表示エリア**
  - 問題タグ（badge形式）
  - 問題文
- **回答エリア（1人分）**
  - 4つの選択肢ボタン（qa_new_ja.jsonの"choice"配列から）
  - 1つだけ選択可能
  - コメント入力欄（オプション）
- **結果表示エリア**
  - 選択した選択肢、正誤判定、コメントを表示
  - 正解の選択肢を表示
  - 選択肢ボタンに色分け（正解: 緑、不正解: 赤）
- **アクションボタン**
  - 「回答を提出」: 回答選択後に有効化
  - 「次の問題へ」: 提出後に表示
  - 「レビュー完了」: 最後の問題で提出後に表示
  - 「ホームに戻る」: 確認ダイアログ付き

**現在の実装:** 4人分のグリッドレイアウト → 1人分のシンプルなレイアウトに修正が必要

### 3. データ保存（storage.js）
**目標仕様:**
- **レビュー結果の記録** (各問題提出時に自動保存)
  - レビューID（一意）
  - 問題ID、問題セット名、問題インデックス
  - 問題タグ、問題文
  - レビューア名（1人）
  - 選択した選択肢インデックス
  - 正誤判定（true/false）
  - 正解インデックス
  - タイムスタンプ（ISO 8601形式）
  - コメント（任意）
- **保存先**: ブラウザのlocalStorage
  - キー: `review_results`
  - 形式: JSON配列（追加形式）
- **エクスポート機能**
  - JSON形式でダウンロード
  - CSV形式でダウンロード（Excel対応、BOM付きUTF-8）
  - ファイル名: `review_results_YYYYMMDD_HHMMSS.json/csv`
- **統計機能**
  - 全体の統計情報取得
  - 問題セットごとの統計
  - レビューアごとの正解率計算
- **データ管理**
  - すべてのデータ削除（確認ダイアログ付き）
  - 問題セット別/レビューア別のフィルタリング

**現在の実装:** 4人分のデータ構造（reviewers: {A, B, C, D}）→ 1人分に修正が必要

## データフォーマット

### qa_new_ja.json (問題データ)
```json
{
    "questionID": "問題ID",
    "tag": "問題タグ",
    "question": "質問文",
    "choice": [
      "選択肢1(正解)",
      "選択肢2",
      "選択肢3",
      "選択肢4"
    ],
    "authored_by": "claude",
    "is_translated": false
  }
```

### image.json (画像概要)
```json
{
  "imageID": "問題画像ID",
  "title": "画像のタイトル",
  "tag": [],
  "features": "図の特徴",
...
}
```

### 結果保存形式 (localStorage)
**目標仕様（1人のレビューア）:**
```json
{
  "review_id": "review_1729651234567_abc123xyz",
  "question_id": "tooltest001_q1",
  "question_set": "tooltest001",
  "question_index": 0,
  "question_tag": "Data Visualization",
  "question_text": "このグラフが示している主なトレンドは何ですか？",
  "reviewer_name": "山田太郎",
  "answer": 0,
  "correct_answer": 0,
  "is_correct": true,
  "timestamp": "2025-10-23T10:30:45.123Z",
  "comment": "グラフの傾きから明確"
}
```

**現在の実装（4人のレビューア）:**
```json
{
  "review_id": "review_1729651234567_abc123xyz",
  "question_id": "tooltest001_q1",
  "question_set": "tooltest001",
  "question_index": 0,
  "question_tag": "Data Visualization",
  "question_text": "このグラフが示している主なトレンドは何ですか？",
  "reviewers": {
    "A": "山田太郎",
    "B": "佐藤花子",
    "C": "田中一郎",
    "D": "鈴木次郎"
  },
  "answers": {
    "A": 0,
    "B": 1,
    "C": 0,
    "D": 2
  },
  "correct_answer": 0,
  "is_correct": {
    "A": true,
    "B": false,
    "C": true,
    "D": false
  },
  "timestamp": "2025-10-23T10:30:45.123Z",
  "comments": {
    "A": "グラフの傾きから明確",
    "B": "",
    "C": "データポイントが示唆している",
    "D": ""
  }
}
```

**注**: 正解は常に`choice`配列の最初の要素（インデックス0）です。

## 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
  - index.html: ホーム画面
  - review.html: レビュー画面
- **CSS3**: レスポンシブデザイン、モダンなUI
  - css/style.css: 統合スタイルシート
  - カラースキーム: モダンで視認性の高い配色
  - グリッドレイアウト: 4人のレビューア回答を並列表示
  - ボタンの状態管理: selected, correct, incorrect
- **JavaScript (Vanilla ES6+)**:
  - js/app.js: メインロジック（問題表示、回答管理、ナビゲーション）
  - js/github.js: GitHub/ローカルファイル連携
  - js/storage.js: データ保存・エクスポート・統計
  - 非同期処理: async/await使用
  - モジュールパターン: 各JSファイルはグローバル名前空間を汚染しない

### データ取得（github.js）
**実装済み機能:**

1. **ローカルファイル取得** (デフォルト)
   - 相対パスで直接アクセス
   - `tooltest001/qa_new_ja.json`
   - `tooltest001/dgpowerpoint_ja-fs8.png`
   - GitHub Pagesまたはローカルサーバーで動作
   - 認証不要、最もシンプル

2. **GitHub API経由取得** (カスタムURL機能)
   - REST API v3使用
   - `GET /repos/{owner}/{repo}/contents/{path}`
   - URLをAPI URLに自動変換
   - パブリックリポジトリなら認証不要
   - 動的なリポジトリ参照が可能

**GitHubClient APIメソッド:**
- `loadProblemSet(problemSet)`: プリセット問題セット読み込み
- `loadFromCustomUrl(url)`: カスタムGitHub URL読み込み
- `fetchJSON(path)`: JSONファイル取得
- `convertToApiUrl(url)`: GitHub URL → API URL変換

### データ保存（storage.js）
**実装済み: ローカルストレージ + エクスポート機能**

- **localStorage API**
  - ブラウザ内で完結、追加設定不要
  - `review_results`キーに全データ保存
  - JSON配列形式で追加保存

- **エクスポート機能**
  - JSON形式ダウンロード
  - CSV形式ダウンロード（Excel対応）
  - タイムスタンプ付きファイル名

- **統計機能**
  - レビューアごとの正解率
  - 問題セットごとの統計
  - 全体サマリー

**将来の拡張オプション:**
- AWS S3連携（storage.jsにプレースホルダー実装済み）
- GitHub Gist保存
- データベース連携

## ディレクトリ構成

```
qareview_sample/
├── index.html              # ホーム画面（実装済み）
├── review.html             # レビュー画面（実装済み）
├── css/
│   └── style.css          # スタイルシート（実装済み）
├── js/
│   ├── app.js             # メインロジック（実装済み）
│   ├── github.js          # データ取得（実装済み）
│   └── storage.js         # データ保存・統計（実装済み）
├── tooltest001/           # 問題セット1
│   ├── qa_new_ja.json     # 問題データ
│   ├── image.json         # 画像メタデータ
│   └── dgpowerpoint_ja-fs8.png  # 問題画像
├── tooltest002/           # 問題セット2
│   ├── qa_new_ja.json
│   ├── image.json
│   └── dgpowerpoint_ja-fs8.png
├── Claude.md              # プロジェクト仕様書（このファイル）
├── README.md              # 使用方法説明
└── SETUP.md               # セットアップガイド（推奨）
```

## 開発ステップ（進捗状況）

### ✅ Phase 1: 基本機能（完了）
1. ✅ ホーム画面の作成（レビューア名入力、問題セット選択）
2. ✅ ローカル/GitHubからデータ取得
3. ✅ 画像と選択肢の表示
4. ✅ 4人のレビューアの回答選択と正誤判定
5. ✅ 進捗表示とナビゲーション

### ✅ Phase 2: データ保存（完了）
1. ✅ レビュー結果の構造化
2. ✅ ローカルストレージへの保存
3. ✅ エクスポート機能（JSON/CSV）
4. ✅ 統計機能
5. ⏳ S3連携（プレースホルダーのみ実装）

### ✅ Phase 3: UI改善（完了）
1. ✅ レスポンシブデザイン
2. ✅ 視覚的フィードバック（色分け、ボタン状態）
3. ✅ エラーハンドリング
4. ✅ ローディング表示
5. ✅ スムーズスクロール

### ⏳ Phase 4: 追加機能（一部完了）
1. ⏳ 履歴表示画面（未実装、StorageManager APIは準備済み）
2. ✅ 統計情報（StorageManager.getStatistics()実装済み）
3. ✅ エクスポート機能（JSON/CSV実装済み）
4. ⏳ 結果の可視化（グラフ表示など、未実装）

## 重要な実装詳細

### データの扱い
**目標仕様:**
- **正解の位置**: 正解は常に`choice`配列の**最初の要素（インデックス0）**
- **回答インデックス**: 選択肢は0-3のインデックスで管理
- **レビューア**: 1人ずつレビュー
- **問題ID形式**: `{問題セット名}_q{問題番号}` (例: `tooltest001_q1`)
- **レビューID形式**: `review_{タイムスタンプ}_{ランダム文字列}`

**現在の実装:** レビューアID A, B, C, Dの固定4人制 → 修正が必要

### ワークフロー
**目標仕様:**
1. ユーザーがホーム画面でレビューア名を入力（1人）
2. 問題セットを選択
3. レビュー画面で回答を選択
4. 回答選択後に提出ボタンが有効化
5. 提出すると正誤判定と結果表示
6. 自動的にlocalStorageに保存
7. 次の問題へ、または完了

**現在の実装:** 4人分の回答を同時に入力 → 修正が必要

### ブラウザ要件
- モダンブラウザ（ES6+対応）
- localStorage有効
- JavaScript有効
- Fetch API対応

### ローカル開発
- HTTPサーバーが必要（file://プロトコルではFetch APIが動作しない）
- 推奨: `python -m http.server 8000` または Live Server拡張機能
- CORS制約なし（同一オリジン）

## 今後の拡張案

### 優先度: 高
1. **履歴表示画面**
   - 過去のレビュー結果を一覧表示
   - フィルタリング機能（問題セット別、レビューア別、日付範囲）
   - StorageManager APIは実装済み、UIの実装が必要

2. **統計ダッシュボード**
   - レビューアごとの正解率グラフ
   - 問題セットごとの難易度分析
   - 時系列での成績推移

3. **データのインポート機能**
   - 以前エクスポートしたJSONファイルを読み込み
   - 複数デバイス間でのデータ同期

### 優先度: 中
4. **問題セット管理画面**
   - 利用可能な問題セットの一覧表示
   - 問題セットのプレビュー機能

5. **レビューモードの拡張**
   - タイマー機能（制限時間設定）
   - 複数問題の一括レビュー
   - ランダム出題順序

6. **UI/UX改善**
   - ダークモード対応
   - キーボードショートカット
   - 進捗の永続化（中断・再開機能）

### 優先度: 低
7. **クラウド連携**
   - AWS S3への自動バックアップ
   - GitHub Gistでのデータ共有
   - リアルタイムコラボレーション

8. **高度な分析**
   - 問題ごとの正解率統計
   - レビューア間の一致率分析
   - コメント内容の傾向分析（自然言語処理）

## 使用方法

### 初回セットアップ
1. リポジトリをクローンまたはダウンロード
2. HTTPサーバーを起動:
   ```bash
   python -m http.server 8000
   # または
   npx http-server -p 8000
   ```
3. ブラウザで `http://localhost:8000` にアクセス

### GitHub Pagesでの公開
1. GitHubリポジトリの Settings → Pages
2. Source: `main`ブランチ、`/ (root)`
3. 公開URLにアクセス（例: `https://username.github.io/qareview_sample/`）

### レビューの実行
**目標仕様（1人ずつレビュー）:**
1. ホーム画面でレビューア名を入力（1人）
2. 問題セット（tooltest001 または tooltest002）を選択
3. レビュー画面で回答を選択
4. 必要に応じてコメントを追加
5. 「回答を提出」をクリックして結果確認
6. 「次の問題へ」で続行、または「レビュー完了」で終了

**現在の実装:** 4人のレビューア名を同時入力 → 修正が必要

### データのエクスポート
ブラウザのコンソールで以下を実行:
```javascript
// JSON形式でエクスポート
StorageManager.exportToJSON();

// CSV形式でエクスポート
StorageManager.exportToCSV();

// 統計情報を取得
const stats = StorageManager.getStatistics();
console.log(stats);

// すべてのデータを削除
StorageManager.clearAll();
```

## トラブルシューティング

### 問題: 画像やJSONが読み込めない
**原因**: file://プロトコルを使用している
**解決**: HTTPサーバーを起動してアクセス

### 問題: データが保存されない
**原因**: localStorageが無効化されている
**解決**: ブラウザの設定でlocalStorageを有効化、またはシークレットモードを解除

### 問題: カスタムURLが動作しない
**原因**: プライベートリポジトリ、またはURL形式が不正
**解決**: パブリックリポジトリであること、URL形式が `https://github.com/user/repo/tree/branch/path` であることを確認

## 参考リソース
- [GitHub REST API](https://docs.github.com/en/rest)
- [localStorage API](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)
- [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [AWS S3 JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/) (将来の拡張用)
