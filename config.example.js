// AWS API Gateway設定テンプレート
// このファイルをコピーして config.js として保存し、実際の値を入力してください

const AWS_CONFIG = {
    // S3保存機能を有効化するか（true: 有効, false: 無効）
    enabled: false,

    // API GatewayのエンドポイントURL（SETUP.mdのステップ4で取得）
    // 形式: https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/upload
    apiEndpoint: 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/upload'
};

// 設定をグローバルに公開
window.AWS_CONFIG = AWS_CONFIG;
