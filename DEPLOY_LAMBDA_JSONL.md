# Lambda関数のデプロイ手順（JSONL形式対応）

このドキュメントでは、修正したLambda関数をAWSにデプロイする手順を説明します。

## 概要

**変更内容:**
- 1問ごとに個別のJSONファイルを作成 → **1つのJSONLファイル（`qa_review_test.jsonl`）に集約**
- レビュー結果が追記される形式で保存
- レビューア名を含むデータ構造
- **APIキー認証の追加（セキュリティ対策）**

**JSONLファイルの例:**
```jsonl
{"review_id":"review_1729651234567_abc123","question_id":"tooltest001_q1","question_set":"tooltest001","question_index":0,"question_tag":"Data Visualization","question_text":"このグラフが示している主なトレンドは何ですか？","reviewer_name":"山田太郎","answer":0,"correct_answer":0,"is_correct":true,"timestamp":"2025-10-23T10:30:45.123Z","comment":"グラフの傾きから明確"}
{"review_id":"review_1729651256789_def456","question_id":"tooltest001_q2","question_set":"tooltest001","question_index":1,"question_tag":"Statistics","question_text":"この統計値の意味は？","reviewer_name":"山田太郎","answer":1,"correct_answer":0,"is_correct":false,"timestamp":"2025-10-23T10:31:12.456Z","comment":""}
```

## デプロイ手順

### ステップ1: Lambda関数コードの更新

1. AWS Lambda コンソールを開く
   - https://console.aws.amazon.com/lambda/

2. 既存のLambda関数を選択
   - 使用中の関数名を選択

3. コードを更新
   - 「コード」タブを選択
   - `lambda-function-jsonl.js` の内容をコピー
   - Lambda関数のコードエディタに貼り付け
   - **重要**: リージョンを確認（現在は `us-east-1`）
     ```javascript
     const s3Client = new S3Client({ region: 'us-east-1' });
     ```

4. 「Deploy」ボタンをクリック

### ステップ2: Lambda IAM ロールの権限確認

Lambda関数が以下の権限を持っていることを確認：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::あなたのバケット名/*"
        }
    ]
}
```

**権限確認手順:**
1. Lambda関数の「設定」タブ → 「アクセス権限」
2. 実行ロールをクリック
3. ポリシーを確認
4. `s3:GetObject` と `s3:PutObject` が含まれていることを確認

### ステップ3: 環境変数の設定

Lambda関数の環境変数を以下のように設定：

1. Lambda関数の「設定」タブ → 「環境変数」を選択

2. 以下の環境変数を追加:

   | キー | 値 |
   |------|-----|
   | `S3_BUCKET_NAME` | あなたのS3バケット名 |
   | `API_KEY` | `36cb0f1603f0c72e52ec3ab2cb4a01672ff2b456f39ebfb7b5f6fa2b72b5362b` |

   **重要**: `API_KEY`は`config.js`の値と完全に一致させてください。

3. 「保存」をクリック

### ステップ4: テスト実行

1. Lambda コンソールで「テスト」タブを選択

2. 新しいテストイベントを作成:
   ```json
   {
     "requestContext": {
       "http": {
         "method": "POST"
       }
     },
     "headers": {
       "X-API-Key": "36cb0f1603f0c72e52ec3ab2cb4a01672ff2b456f39ebfb7b5f6fa2b72b5362b"
     },
     "body": "{\"reviewData\":{\"review_id\":\"review_test_12345\",\"question_id\":\"tooltest001_q1\",\"question_set\":\"tooltest001\",\"question_index\":0,\"question_tag\":\"Test\",\"question_text\":\"テスト問題\",\"reviewer_name\":\"テスト太郎\",\"answer\":0,\"correct_answer\":0,\"is_correct\":true,\"timestamp\":\"2025-10-30T10:00:00.000Z\",\"comment\":\"テストコメント\"}}"
   }
   ```

3. 「テスト」ボタンをクリック

4. 実行結果を確認:
   ```json
   {
     "statusCode": 200,
     "body": "{\"message\":\"アップロード成功\",\"fileName\":\"qa_review_test.jsonl\",\"reviewId\":\"review_test_12345\",\"reviewerName\":\"テスト太郎\"}"
   }
   ```

5. S3バケットを確認:
   - `qa_review_test.jsonl` が作成されていることを確認

### ステップ5: API Gatewayの確認

既存のAPI Gateway設定はそのまま使用可能です。変更不要。

- エンドポイントURL: `https://l8krjw7e49.execute-api.us-east-1.amazonaws.com/prod/upload`

### ステップ6: フロントエンドのテスト

1. ローカルでHTTPサーバーを起動:
   ```bash
   cd /Users/obarayui/Git/qareview_sample
   python -m http.server 8000
   ```

2. ブラウザで http://localhost:8000 にアクセス

3. レビューを実行:
   - レビューア名を入力（例: 山田太郎）
   - 問題セットを選択
   - 問題に回答して「回答を提出」

4. S3バケットを確認:
   - `qa_review_test.jsonl` にデータが追記されていることを確認

5. 複数の問題を回答して、ファイルが追記されることを確認

## データの確認方法

### S3からJSONLファイルをダウンロード

1. AWS S3 コンソールを開く
2. バケットを選択
3. `qa_review_test.jsonl` を選択
4. 「ダウンロード」をクリック

### JSONLファイルの分析

各行が1つのJSON オブジェクトです。以下のツールで分析可能：

**コマンドラインツール（jq）:**
```bash
# 全レビューア名を一覧表示
cat qa_review_test.jsonl | jq -r '.reviewer_name' | sort | uniq

# 特定のレビューアの結果を抽出
cat qa_review_test.jsonl | jq 'select(.reviewer_name == "山田太郎")'

# 正解率を計算
cat qa_review_test.jsonl | jq -s 'map(select(.is_correct == true)) | length'
```

**Python:**
```python
import json

with open('qa_review_test.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        print(f"{data['reviewer_name']}: {data['question_id']} - {'正解' if data['is_correct'] else '不正解'}")
```

**JavaScript:**
```javascript
const fs = require('fs');

const lines = fs.readFileSync('qa_review_test.jsonl', 'utf8').split('\n');
lines.forEach(line => {
    if (line.trim()) {
        const data = JSON.parse(line);
        console.log(`${data.reviewer_name}: ${data.question_id} - ${data.is_correct ? '正解' : '不正解'}`);
    }
});
```

## トラブルシューティング

### エラー: "NoSuchKey"
**原因**: ファイルがまだ存在しない
**解決**: 正常な動作です。初回実行時にファイルが作成されます。

### エラー: "Access Denied"
**原因**: Lambda関数に `s3:GetObject` または `s3:PutObject` 権限がない
**解決**: ステップ2の権限を確認してください。

### エラー: "認証エラー: APIキーが必要です"
**原因**: config.jsが読み込まれていない、またはAPIキーが設定されていない
**解決**:
1. ブラウザのコンソールで `window.AWS_CONFIG` を確認
2. config.jsが正しく読み込まれているか確認
3. APIキーが設定されているか確認

### エラー: "認証エラー: 無効なAPIキーです"
**原因**: config.jsのAPIキーとLambda環境変数のAPI_KEYが一致していない
**解決**:
1. config.jsの`apiKey`値を確認
2. Lambda環境変数の`API_KEY`値を確認
3. 両者が完全に一致していることを確認

### データが追記されない
**原因**:
- Lambda関数が更新されていない
- S3バケット名が間違っている

**解決**:
1. Lambda関数のコードが最新か確認
2. 環境変数 `S3_BUCKET_NAME` を確認
3. CloudWatch Logs でエラーを確認

### JSONLファイルが壊れている
**原因**: 同時書き込みによる競合（稀）
**解決**: S3のバージョニング機能を有効化することを推奨

## 注意事項

1. **同時書き込み**: 複数のユーザーが同時に回答すると、ごく稀にデータ競合が発生する可能性があります。本番環境では DynamoDB の使用を推奨します。

2. **ファイルサイズ**: JSONLファイルは追記され続けるため、定期的なアーカイブを推奨します。

3. **バックアップ**: S3のバージョニング機能を有効化してください。

## 次のステップ（オプション）

### S3バージョニングの有効化

1. S3コンソールを開く
2. バケットを選択
3. 「プロパティ」タブ → 「バケットのバージョニング」
4. 「有効化」を選択

### CloudWatch アラームの設定

Lambda関数のエラーを監視:
1. CloudWatch コンソールを開く
2. 「アラーム」→「アラームの作成」
3. Lambda関数のエラーメトリクスを選択
4. 通知先（SNS トピック）を設定

### データ分析の自動化

- S3トリガーでAthenaやGlueを使用した自動分析
- QuickSightでダッシュボード作成
- EventBridgeで定期的な統計レポート生成

## 参考資料

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [AWS S3 API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/)
- [JSONL Format Specification](http://jsonlines.org/)
