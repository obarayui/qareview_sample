# レビューツールアプリケーション - セットアップ手順書

このドキュメントでは、レビューツールアプリケーションのセットアップ方法と使い方を説明します。

## 目次

1. [前提条件](#前提条件)
2. [ローカル環境でのセットアップ](#ローカル環境でのセットアップ)
3. [GitHub Pagesでの公開（推奨）](#github-pagesでの公開推奨)
4. [使い方](#使い方)
5. [データのエクスポート](#データのエクスポート)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

- Webブラウザ（Chrome, Firefox, Safari, Edge など）
- （オプション）GitHubアカウント（GitHub Pagesで公開する場合）

---

## ローカル環境でのセットアップ

### 方法1: ローカルサーバーを使用（推奨）

ブラウザのセキュリティ制限により、直接HTMLファイルを開くとファイル読み込みに失敗する可能性があります。ローカルサーバーを使用することを推奨します。

#### Python 3を使用する場合

```bash
# プロジェクトディレクトリに移動
cd /path/to/qareview_sample

# ローカルサーバーを起動
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` にアクセスしてください。

#### Node.jsを使用する場合

```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# プロジェクトディレクトリに移動
cd /path/to/qareview_sample

# ローカルサーバーを起動
http-server -p 8000
```

ブラウザで `http://localhost:8000` にアクセスしてください。

### 方法2: 直接HTMLファイルを開く

一部のブラウザではセキュリティ制限により、ローカルファイルの読み込みが制限される場合があります。

1. `index.html` をブラウザにドラッグ&ドロップ
2. または、ブラウザのメニューから「ファイルを開く」で `index.html` を選択

**注意**: この方法では、問題セットの画像やJSONファイルが読み込めない場合があります。

---

## GitHub Pagesでの公開（推奨）

GitHub Pagesで公開すると、インターネット経由でアクセスでき、セキュリティ制限の問題も回避できます。

### 手順

1. **GitHubリポジトリの設定**

   - GitHubで `qareview_sample` リポジトリを開く
   - `Settings` タブをクリック
   - 左サイドバーの `Pages` をクリック

2. **ソースの設定**

   - `Source` セクションで `Deploy from a branch` を選択
   - `Branch` で以下を選択：
     - **ブランチ**: `main` （メインのコードが保存されているブランチ）
     - **フォルダ**: `/ (root)` （リポジトリの最上位フォルダから公開）
   - `Save` をクリック

   **補足**:
   - `/ (root)` は、`index.html`がリポジトリの最上位にあるため選択します
   - もし`docs`フォルダ内にファイルを配置した場合は、`/docs` を選択します

3. **アクセス**

   数分後、以下のURLでアクセスできます：
   ```
   https://<あなたのGitHubユーザー名>.github.io/qareview_sample/
   ```

4. **確認**

   - URLにアクセスして、ホーム画面が表示されることを確認
   - 問題セットを選択して、レビュー画面が正常に動作することを確認

---

## 使い方

### 1. ホーム画面

1. **レビューア名の入力**
   - あなたの名前を入力します

2. **問題セットの選択**
   - `tooltest001` または `tooltest002` のいずれかを選択
   - 「この問題セットを開始」ボタンをクリック

3. **カスタムURL（オプション）**
   - 独自のGitHubリポジトリから問題セットを読み込む場合に使用
   - 例: `https://github.com/username/repo/tree/main/folder`

### 2. レビュー画面

1. **問題の確認**
   - 画面上部に問題画像が表示されます
   - 問題文と4つの選択肢を確認します

2. **回答の選択**
   - 選択肢ボタンをクリックして回答を選択
   - 選択後、コメント欄が表示されます（任意）

3. **回答の提出**
   - 回答を選択したら「回答を提出」ボタンをクリック
   - 正解/不正解が即座に表示されます

4. **次の問題へ**
   - 「次の問題へ」ボタンをクリックして続行
   - 最後の問題の場合は「レビュー完了」ボタンが表示されます

5. **レビュー完了**
   - すべての問題が終わったら「レビュー完了」をクリック
   - あなたの正解率が表示されます

### 3. データの保存

レビュー結果は以下の2つの方法で保存できます：

#### 方法1: ローカルストレージ（デフォルト）
- 自動的にブラウザのローカルストレージに保存されます
- インターネット接続不要
- ブラウザ内のみでデータが保存されます

#### 方法2: AWS S3（クラウド保存）
- レビュー完了後、S3バケットに自動アップロード
- 複数デバイス間でデータ共有可能
- 事前にAWS設定が必要（[AWS S3設定](#aws-s3への保存設定)を参照）

**保存されるデータ:**
- レビューID
- 問題セット名
- レビューア名と回答
- 正解/不正解の判定
- コメント（入力した場合）
- タイムスタンプ

---

## データのエクスポート

レビュー結果をエクスポートするには、ブラウザの開発者コンソールを使用します。

### 手順

1. **開発者コンソールを開く**
   - Chrome/Edge: `F12` または `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` または `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
   - Safari: `Cmd+Option+C` (Macのみ、開発者メニューを有効化する必要があります)

2. **コンソールタブを選択**

3. **エクスポートコマンドを実行**

   **JSON形式でエクスポート:**
   ```javascript
   StorageManager.exportToJSON()
   ```

   **CSV形式でエクスポート:**
   ```javascript
   StorageManager.exportToCSV()
   ```

4. **ファイルがダウンロードされます**
   - ファイル名: `review_results_YYYYMMDD_HHMMSS.json` または `.csv`

### データの確認

**すべての結果を表示:**
```javascript
StorageManager.getAllResults()
```

**統計情報を表示:**
```javascript
StorageManager.getStatistics()
```

**データをクリア:**
```javascript
StorageManager.clearAll()
```

---

## 問題セットの追加

新しい問題セットを追加する場合：

1. **フォルダを作成**
   ```
   qareview_sample/
   ├── tooltest003/         # 新しい問題セット
   │   ├── dgpowerpoint_ja-fs8.png
   │   ├── qa_new_ja.json
   │   └── image.json
   ```

2. **必要なファイル**
   - `dgpowerpoint_ja-fs8.png`: 問題用画像
   - `qa_new_ja.json`: 問題データ（配列形式）
   - `image.json`: 画像のメタデータ

3. **index.htmlを更新**

   `index.html` の問題セットカードセクションに新しいカードを追加：

   ```html
   <div class="problem-set-card" data-set="tooltest003">
       <h3>問題セット 3</h3>
       <p>tooltest003</p>
       <button class="btn-primary" onclick="startReview('tooltest003')">この問題セットを開始</button>
   </div>
   ```

4. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Add tooltest003 problem set"
   git push
   ```

---

## トラブルシューティング

### 問題: 画像が表示されない

**原因**: ファイルパスが正しくない、またはCORS制限

**解決策**:
- ローカルサーバーを使用しているか確認
- ファイル名が `dgpowerpoint_ja-fs8.png` と一致しているか確認
- GitHub Pagesで公開している場合は、リポジトリが公開設定になっているか確認

### 問題: 問題データが読み込めない

**原因**: JSONファイルの形式エラー、またはファイルパスが間違っている

**解決策**:
- `qa_new_ja.json` が正しいJSON配列形式か確認
- ブラウザの開発者コンソールでエラーメッセージを確認
- JSONファイルのパスが正しいか確認

### 問題: レビュー結果が保存されない

**原因**: ローカルストレージの容量制限、またはブラウザの設定

**解決策**:
- ブラウザのローカルストレージを確認（開発者ツール → Application → Local Storage）
- データが多すぎる場合は、エクスポートしてからクリア
- プライベートブラウジングモードを使用していないか確認

### 問題: GitHub APIからデータを取得できない

**原因**: APIレート制限、またはリポジトリがプライベート

**解決策**:
- リポジトリが公開されているか確認
- GitHub APIのレート制限（60リクエスト/時間）を超えていないか確認
- 認証トークンを使用する場合は、適切に設定されているか確認

---

## AWS S3への保存設定

レビュー結果をAWS S3バケットに保存する場合の設定手順です。

### 前提条件

- AWSアカウント
- 基本的なAWSの知識

### ステップ1: S3バケットの作成

1. **AWSコンソールにログイン**
   - https://console.aws.amazon.com/ にアクセス

2. **S3サービスを開く**
   - 検索バーで「S3」と入力し、S3サービスを選択

3. **バケットを作成**
   - 「バケットを作成」ボタンをクリック
   - **バケット名**: 例 `qareview-results-yourname`（グローバルに一意な名前が必要）
   - **リージョン**: 例 `ap-northeast-1`（東京リージョン）
   - **ブロックパブリックアクセス**: すべてのパブリックアクセスをブロック（チェックを入れる）
   - 「バケットを作成」をクリック

4. **フォルダ構造を作成（オプション）**
   - 作成したバケット内に `results/` フォルダを作成

### ステップ2: CORS設定

ブラウザからS3にアクセスできるようにCORS設定を行います。

1. **バケットを選択**
   - 作成したバケットをクリック

2. **アクセス許可タブを開く**
   - 「アクセス許可」タブをクリック

3. **CORS設定を編集**
   - 下にスクロールして「クロスオリジンリソース共有 (CORS)」セクションを見つける
   - 「編集」ボタンをクリック

4. **以下のJSON設定を貼り付け**

   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["PUT", "POST", "GET"],
           "AllowedOrigins": ["*"],
           "ExposeHeaders": ["ETag"]
       }
   ]
   ```

   **注意**: 本番環境では、`AllowedOrigins`を特定のドメイン（例: `https://yourusername.github.io`）に限定することを推奨します。

5. **変更を保存**

### ステップ3: Lambda関数の作成

バックエンドでS3へのアップロードを処理するLambda関数を作成します。

1. **Lambdaサービスを開く**
   - AWSコンソールの検索バーで「Lambda」と入力
   - 「Lambda」をクリック

2. **関数を作成**
   - 「関数の作成」ボタンをクリック
   - **一から作成**を選択
   - **関数名**: `QAReviewUploadFunction`
   - **ランタイム**: `Node.js 20.x`（または最新版）
   - **アーキテクチャ**: `x86_64`
   - 「関数の作成」をクリック

3. **Lambda関数のコードを追加**
   - コードエディタに以下をコピー&ペースト:

   ```javascript
   const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

   const s3Client = new S3Client({ region: process.env.AWS_REGION });

   exports.handler = async (event) => {
       console.log('受信したイベント:', JSON.stringify(event, null, 2));

       try {
           // CORSプリフライトリクエストの処理
           if (event.httpMethod === 'OPTIONS') {
               return {
                   statusCode: 200,
                   headers: {
                       'Access-Control-Allow-Origin': '*',
                       'Access-Control-Allow-Headers': 'Content-Type',
                       'Access-Control-Allow-Methods': 'POST, OPTIONS'
                   },
                   body: ''
               };
           }

           // リクエストボディを解析
           const body = JSON.parse(event.body);
           const reviewData = body.reviewData;

           if (!reviewData) {
               return {
                   statusCode: 400,
                   headers: {
                       'Access-Control-Allow-Origin': '*',
                       'Content-Type': 'application/json'
                   },
                   body: JSON.stringify({ error: 'reviewData is required' })
               };
           }

           // S3バケット名（環境変数から取得）
           const bucketName = process.env.S3_BUCKET_NAME;

           // ファイル名を生成
           const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
           const fileName = `results/review_${reviewData.review_id}_${timestamp}.json`;

           // S3にアップロード
           const command = new PutObjectCommand({
               Bucket: bucketName,
               Key: fileName,
               Body: JSON.stringify(reviewData, null, 2),
               ContentType: 'application/json',
               ServerSideEncryption: 'AES256'
           });

           await s3Client.send(command);

           return {
               statusCode: 200,
               headers: {
                   'Access-Control-Allow-Origin': '*',
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   message: 'アップロード成功',
                   fileName: fileName
               })
           };

       } catch (error) {
           console.error('エラー:', error);
           return {
               statusCode: 500,
               headers: {
                   'Access-Control-Allow-Origin': '*',
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   error: 'アップロードに失敗しました',
                   details: error.message
               })
           };
       }
   };
   ```

   - 「Deploy」ボタンをクリック

4. **環境変数を設定**
   - 「設定」タブをクリック
   - 左サイドバーの「環境変数」をクリック
   - 「編集」をクリック
   - 「環境変数を追加」をクリック
   - **キー**: `S3_BUCKET_NAME`
   - **値**: `qareview-results-yourname`（実際のバケット名）
   - 「保存」をクリック

5. **実行ロールにS3アクセス権限を追加**
   - 「設定」タブの「アクセス権限」をクリック
   - 「実行ロール」の下にあるロール名をクリック（新しいタブでIAMが開きます）
   - 「許可を追加」→「ポリシーをアタッチ」をクリック
   - 「ポリシーの作成」をクリック
   - 「JSON」タブをクリック
   - 以下を貼り付け（バケット名を実際の名前に置き換える）:

   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:PutObjectAcl"
               ],
               "Resource": "arn:aws:s3:::qareview-results-yourname/*"
           }
       ]
   }
   ```

   - 「次へ」をクリック
   - **ポリシー名**: `QAReviewS3WritePolicy`
   - 「ポリシーの作成」をクリック
   - ロールの画面に戻り、作成した`QAReviewS3WritePolicy`を検索して選択
   - 「許可を追加」をクリック

6. **タイムアウトを延長（オプション）**
   - Lambda関数の画面に戻る
   - 「設定」タブ→「一般設定」→「編集」
   - **タイムアウト**: `30秒`に変更
   - 「保存」をクリック

### ステップ4: API Gatewayの作成

Lambda関数をHTTPエンドポイントとして公開します。

1. **API Gatewayサービスを開く**
   - AWSコンソールの検索バーで「API Gateway」と入力
   - 「API Gateway」をクリック

2. **REST APIを作成**
   - 「APIを作成」ボタンをクリック
   - **REST API**（プライベートではない）の「構築」をクリック
   - **新しいAPI**を選択
   - **API名**: `QAReviewAPI`
   - **エンドポイントタイプ**: `リージョン`
   - 「APIの作成」をクリック

3. **リソースを作成**
   - 「アクション」→「リソースの作成」をクリック
   - **リソース名**: `upload`
   - **リソースパス**: `upload`
   - 「CORSを有効にする」にチェック
   - 「リソースの作成」をクリック

4. **POSTメソッドを作成**
   - `/upload`リソースを選択
   - 「アクション」→「メソッドの作成」をクリック
   - プルダウンから`POST`を選択→チェックマークをクリック
   - **統合タイプ**: `Lambda関数`
   - **Lambdaリージョン**: 関数を作成したリージョン（例: `ap-northeast-1`）
   - **Lambda関数**: `QAReviewUploadFunction`
   - 「保存」をクリック
   - 権限の追加確認が表示されたら「OK」をクリック

5. **CORSを有効化**

   CORSは、ブラウザから異なるドメインのAPIを呼び出すために必要な設定です。

   **手順**:
   - 左側のリソースツリーで `/upload` を選択（青く選択された状態にする）
   - 上部の「アクション」ボタンをクリック
   - ドロップダウンから「CORSの有効化」を選択
   - ポップアップが表示されたら、デフォルト設定のまま「CORSを有効にして既存のCORSヘッダーを置換」ボタンをクリック
   - 確認ダイアログで「はい、既存の値を置き換えます」をクリック

   **完了の確認**: `/upload`の下に`OPTIONS`メソッドが自動的に追加されます

6. **APIをデプロイ**
   - 「アクション」→「APIのデプロイ」をクリック
   - **デプロイされるステージ**: `[新しいステージ]`
   - **ステージ名**: `prod`
   - 「デプロイ」をクリック

7. **APIエンドポイントURLを取得**
   - デプロイ後、画面上部に**URLを呼び出す**が表示されます
   - このURLをコピー（例: `https://abcd1234.execute-api.ap-northeast-1.amazonaws.com/prod`）
   - **重要**: このURLは後で使用します

### ステップ5: アプリケーションの設定

1. **設定ファイルを作成**

   プロジェクトのルートに `config.js` ファイルを作成します。`config.example.js`をコピーして編集するのが簡単です:

   ```bash
   cp config.example.js config.js
   ```

   `config.js`を編集:

   ```javascript
   // AWS API Gateway設定
   const AWS_CONFIG = {
       // S3保存を有効化
       enabled: true,

       // ステップ4で取得したAPI GatewayのエンドポイントURL
       // 例: https://abcd1234.execute-api.ap-northeast-1.amazonaws.com/prod/upload
       apiEndpoint: 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/upload'
   };

   // 設定をグローバルに公開
   window.AWS_CONFIG = AWS_CONFIG;
   ```

   **重要**: `apiEndpoint`をステップ4で取得した実際のURLに置き換えてください。URLの末尾に`/upload`を忘れずに追加してください。

2. **config.jsをGitから除外**

   セキュリティのため、`config.js`をGitにコミットしないようにします:

   ```bash
   # .gitignoreに追加されていることを確認
   cat .gitignore
   ```

   `.gitignore`に`config.js`が含まれていない場合は追加:

   ```
   config.js
   ```

3. **動作確認**
   - アプリケーションをブラウザで開く
   - レビューを実行して完了
   - ブラウザのコンソールで確認:
     ```javascript
     console.log(window.AWS_CONFIG);
     ```
   - S3バケットの`results/`フォルダに結果ファイルが保存されていることを確認

4. **他のチームメンバーへの共有**

   他のメンバーも使用できるようにするには:
   - `config.example.js`をコピーして`config.js`を作成
   - 同じAPI Gateway URLを設定
   - IAMユーザーを個別に作成する必要はありません

### ステップ6: セキュリティのベストプラクティス

1. **認証情報の保護**
   - `config.js`を`.gitignore`に追加してGitにコミットしない
   - 環境変数や AWS Secrets Manager を使用する

2. **本番環境での推奨構成**
   - フロントエンド → API Gateway → Lambda → S3
   - AWS Cognito で認証・認可
   - IAM ロールでアクセス制御

3. **バケットポリシーの最適化**
   - 必要最小限のアクセス権限のみを付与
   - IP制限やVPC制限を検討

### CORSとは？（補足説明）

**CORS (Cross-Origin Resource Sharing)** は、ブラウザのセキュリティ機能です。

#### なぜCORSが必要？

ブラウザには「同一オリジンポリシー」というセキュリティ制限があります：

- **OK**: 同じドメイン内での通信
  - 例: `https://example.com` から `https://example.com/api` へ

- **NG（デフォルトでブロック）**: 異なるドメイン間での通信
  - 例: `https://yourusername.github.io` から `https://abcd1234.execute-api.amazonaws.com` へ

このアプリケーションでは：
- **フロントエンド**: GitHub Pages（例: `https://yourusername.github.io`）
- **バックエンドAPI**: API Gateway（例: `https://abcd1234.execute-api.amazonaws.com`）

この2つは**異なるドメイン**なので、CORSを有効化しないとブラウザがAPIコールをブロックします。

#### CORS設定で何が起こる？

API GatewayでCORSを有効化すると、以下のHTTPヘッダーが自動的に返されます：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

これにより、ブラウザが「このAPIは他のドメインからの呼び出しを許可している」と認識し、通信を許可します。

#### もしCORSを設定しないと？

ブラウザのコンソールに以下のようなエラーが表示されます：

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### トラブルシューティング

#### エラー: Access Denied

**原因**: IAMポリシーまたはバケットポリシーが正しくない

**解決策**:
- バケット名が正しいか確認
- IAMポリシーのARNが正しいか確認
- CORS設定が正しいか確認

#### エラー: CORS policy

**原因**: CORS設定が不足または間違っている

**解決策**:
- CORS設定を再確認
- `AllowedOrigins`にアプリケーションのドメインが含まれているか確認

#### ファイルがアップロードされない

**原因**: アクセスキーが無効または期限切れ

**解決策**:
- アクセスキーIDとシークレットキーを再確認
- ブラウザのコンソールでエラーメッセージを確認

---

## サポート

問題が発生した場合や質問がある場合は、以下の方法でお問い合わせください：

- GitHubのIssuesを作成
- プロジェクト管理者に連絡

---

## ライセンス

このプロジェクトは内部使用を目的としています。

---

**最終更新**: 2025-10-23
