import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: 'ap-northeast-1' }); // S3バケットのリージョンに合わせる

// 固定のJSONLファイル名
const JSONL_FILE_NAME = 'qa_review_test.jsonl';

export const handler = async (event) => {
    console.log('受信したイベント:', JSON.stringify(event, null, 2));
    console.log('event.body の型:', typeof event.body);
    console.log('event.body の値:', event.body);

    try {
        // API Gateway v2 の場合は requestContext.http を使用
        const httpMethod = event.requestContext?.http?.method || event.httpMethod;

        // OPTIONSリクエスト（CORS プリフライト）の処理
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                body: ''
            };
        }

        // APIキー検証
        const expectedApiKey = process.env.API_KEY;
        if (expectedApiKey) {
            // ヘッダーからAPIキーを取得（大文字小文字を考慮）
            const headers = event.headers || {};
            console.log('受信したヘッダー:', JSON.stringify(headers, null, 2));
            const apiKey = headers['X-API-Key'] || headers['x-api-key'];

            if (!apiKey) {
                console.error('APIキーがヘッダーに含まれていません');
                return {
                    statusCode: 401,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: '認証エラー: APIキーが必要です'
                    })
                };
            }

            if (apiKey !== expectedApiKey) {
                console.error('無効なAPIキー:', apiKey);
                return {
                    statusCode: 403,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        error: '認証エラー: 無効なAPIキーです'
                    })
                };
            }

            console.log('APIキー検証成功');
        } else {
            console.warn('環境変数API_KEYが設定されていません。APIキー検証をスキップします。');
        }

        // event.body が undefined または null の場合のエラーハンドリング
        if (!event.body) {
            console.error('event.body が存在しません');
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: 'リクエストボディが存在しません',
                    receivedEvent: event
                })
            };
        }

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

        // レビューア名が含まれていることを確認
        if (!reviewData.reviewer_name) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'reviewer_name is required in reviewData' })
            };
        }

        const bucketName = process.env.S3_BUCKET_NAME;
        console.log('バケット名:', bucketName);
        console.log('環境変数一覧:', process.env);

        if (!bucketName) {
            throw new Error('S3_BUCKET_NAME環境変数が設定されていません');
        }

        // 既存のJSONLファイルを取得（存在しない場合は空文字列）
        let existingContent = '';
        try {
            const getCommand = new GetObjectCommand({
                Bucket: bucketName,
                Key: JSONL_FILE_NAME
            });
            const getResponse = await s3Client.send(getCommand);
            existingContent = await streamToString(getResponse.Body);
            console.log('既存ファイル取得成功。サイズ:', existingContent.length);
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                console.log('ファイルが存在しないため、新規作成します');
            } else {
                console.error('ファイル取得エラー:', error);
                throw error;
            }
        }

        // 新しいJSON行を作成（改行なしの1行JSON）
        const newLine = JSON.stringify(reviewData);

        // 既存コンテンツに追記（既存データがある場合は改行を追加）
        const updatedContent = existingContent
            ? existingContent + '\n' + newLine
            : newLine;

        // S3に保存
        const putCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: JSONL_FILE_NAME,
            Body: updatedContent,
            ContentType: 'application/x-ndjson', // JSONL の MIME タイプ
            ServerSideEncryption: 'AES256'
        });

        await s3Client.send(putCommand);

        console.log('JSONL ファイルに追記成功:', JSONL_FILE_NAME);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'アップロード成功',
                fileName: JSONL_FILE_NAME,
                reviewId: reviewData.review_id,
                reviewerName: reviewData.reviewer_name
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

/**
 * Stream を文字列に変換するヘルパー関数
 */
async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
