// AWS S3設定テンプレート
// このファイルをコピーして config.js として保存し、実際の値を入力してください

const AWS_CONFIG = {
    // S3保存機能を有効化するか（true: 有効, false: 無効）
    enabled: false,

    // AWSリージョン（例: 'ap-northeast-1' は東京リージョン）
    region: 'ap-northeast-1',

    // S3バケット名（グローバルに一意な名前）
    bucketName: 'your-bucket-name-here',

    // IAMユーザーのアクセスキーID（SETUP.mdのステップ3で取得）
    accessKeyId: 'YOUR_ACCESS_KEY_ID',

    // IAMユーザーのシークレットアクセスキー（SETUP.mdのステップ3で取得）
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',

    // バケット内のフォルダパス（オプション、空文字列も可）
    folderPrefix: 'results/'
};

// 設定をグローバルに公開
window.AWS_CONFIG = AWS_CONFIG;
