// AWS API Gateway設定
const AWS_CONFIG = {
    // S3保存を有効化
    enabled: true,

    // ステップ4で取得したAPI GatewayのエンドポイントURL
    // 例: https://abcd1234.execute-api.ap-northeast-1.amazonaws.com/prod/upload
    apiEndpoint: 'https://l8krjw7e49.execute-api.us-east-1.amazonaws.com/prod/upload',

    // API認証キー（セキュリティ対策）
    apiKey: '36cb0f1603f0c72e52ec3ab2cb4a01672ff2b456f39ebfb7b5f6fa2b72b5362b'
};

// 設定をグローバルに公開
window.AWS_CONFIG = AWS_CONFIG;
