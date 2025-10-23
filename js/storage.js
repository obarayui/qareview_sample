/**
 * データ保存モジュール
 * レビュー結果のローカルストレージへの保存とエクスポート機能
 */

const StorageManager = {
    STORAGE_KEY: 'review_results',

    /**
     * レビュー結果を保存
     * @param {Object} result - レビュー結果データ
     */
    saveResult(result) {
        try {
            const allResults = this.getAllResults();
            allResults.push(result);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
            console.log('レビュー結果を保存しました:', result.review_id);
            return true;
        } catch (error) {
            console.error('レビュー結果の保存に失敗:', error);
            return false;
        }
    },

    /**
     * すべてのレビュー結果を取得
     * @returns {Array} - すべてのレビュー結果
     */
    getAllResults() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('レビュー結果の取得に失敗:', error);
            return [];
        }
    },

    /**
     * 特定の問題セットの結果を取得
     * @param {string} problemSet - 問題セット名
     * @returns {Array} - 該当する結果
     */
    getResultsByProblemSet(problemSet) {
        const allResults = this.getAllResults();
        return allResults.filter(r => r.question_set === problemSet);
    },

    /**
     * 特定のレビューアの結果を取得
     * @param {string} reviewerName - レビューア名
     * @returns {Array} - 該当する結果
     */
    getResultsByReviewer(reviewerName) {
        const allResults = this.getAllResults();
        return allResults.filter(r => r.reviewer_name === reviewerName);
    },

    /**
     * レビュー結果をJSONファイルとしてエクスポート
     */
    exportToJSON() {
        try {
            const allResults = this.getAllResults();
            const dataStr = JSON.stringify(allResults, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `review_results_${this.getCurrentTimestamp()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('レビュー結果をエクスポートしました');
            return true;
        } catch (error) {
            console.error('エクスポートに失敗:', error);
            return false;
        }
    },

    /**
     * レビュー結果をCSVファイルとしてエクスポート
     */
    exportToCSV() {
        try {
            const allResults = this.getAllResults();

            if (allResults.length === 0) {
                alert('エクスポートするデータがありません');
                return false;
            }

            // CSVヘッダー
            const headers = [
                'レビューID',
                '問題ID',
                '問題セット',
                '問題インデックス',
                'タグ',
                '問題文',
                'レビューア名',
                '回答',
                '正誤',
                'コメント',
                '正解インデックス',
                'タイムスタンプ'
            ];

            // CSVデータ
            const rows = allResults.map(result => {
                const question = result.question_text || '';
                const comment = result.comment || '';
                return [
                    result.review_id,
                    result.question_id,
                    result.question_set,
                    result.question_index,
                    result.question_tag,
                    `"${question.replace(/"/g, '""')}"`,
                    result.reviewer_name,
                    result.answer,
                    result.is_correct ? '正解' : '不正解',
                    `"${comment.replace(/"/g, '""')}"`,
                    result.correct_answer,
                    result.timestamp
                ].join(',');
            });

            // CSV文字列を作成（BOM付きUTF-8）
            const csvContent = '\ufeff' + [headers.join(','), ...rows].join('\n');
            const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(csvBlob);
            link.download = `review_results_${this.getCurrentTimestamp()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('レビュー結果をCSVエクスポートしました');
            return true;
        } catch (error) {
            console.error('CSVエクスポートに失敗:', error);
            return false;
        }
    },

    /**
     * 統計情報を取得
     * @returns {Object} - 統計データ
     */
    getStatistics() {
        const allResults = this.getAllResults();

        if (allResults.length === 0) {
            return null;
        }

        // ユニークなレビューア名を取得
        const reviewerNames = [...new Set(allResults.map(r => r.reviewer_name))];

        const stats = {
            totalReviews: allResults.length,
            problemSets: [...new Set(allResults.map(r => r.question_set))],
            reviewers: {},
            byProblemSet: {}
        };

        // レビューアごとの統計
        reviewerNames.forEach(name => {
            stats.reviewers[name] = this.getReviewerStats(allResults, name);
        });

        // 問題セットごとの統計
        stats.problemSets.forEach(set => {
            const setResults = allResults.filter(r => r.question_set === set);
            stats.byProblemSet[set] = {
                totalQuestions: setResults.length,
                averageCorrectRate: this.calculateAverageCorrectRate(setResults)
            };
        });

        return stats;
    },

    /**
     * レビューアごとの統計を取得
     * @param {Array} results - レビュー結果
     * @param {string} reviewerName - レビューア名
     * @returns {Object} - レビューア統計
     */
    getReviewerStats(results, reviewerName) {
        const reviewerResults = results.filter(r => r.reviewer_name === reviewerName);
        const total = reviewerResults.length;
        const correct = reviewerResults.filter(r => r.is_correct).length;
        const correctRate = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;

        return {
            name: reviewerName,
            total: total,
            correct: correct,
            incorrect: total - correct,
            correctRate: parseFloat(correctRate)
        };
    },

    /**
     * 平均正解率を計算
     * @param {Array} results - レビュー結果
     * @returns {number} - 平均正解率
     */
    calculateAverageCorrectRate(results) {
        if (results.length === 0) return 0;

        const totalCorrect = results.filter(r => r.is_correct).length;

        return ((totalCorrect / results.length) * 100).toFixed(1);
    },

    /**
     * すべてのデータをクリア
     */
    clearAll() {
        if (confirm('すべてのレビュー結果を削除しますか？この操作は元に戻せません。')) {
            try {
                localStorage.removeItem(this.STORAGE_KEY);
                console.log('すべてのレビュー結果を削除しました');
                return true;
            } catch (error) {
                console.error('削除に失敗:', error);
                return false;
            }
        }
        return false;
    },

    /**
     * 現在のタイムスタンプを取得（ファイル名用）
     * @returns {string} - タイムスタンプ
     */
    getCurrentTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    },

    /**
     * S3へのアップロード
     * @param {Object} result - レビュー結果
     * @returns {Promise<boolean>} - 成功したかどうか
     */
    async uploadToS3(result) {
        // AWS設定の確認
        if (!window.AWS_CONFIG || !window.AWS_CONFIG.enabled) {
            console.log('S3アップロードは無効化されています');
            return false;
        }

        // AWS SDKの確認
        if (typeof AWS === 'undefined') {
            console.error('AWS SDK が読み込まれていません');
            alert('AWS SDK が読み込まれていません。HTMLファイルにAWS SDKを追加してください。');
            return false;
        }

        try {
            // AWS設定
            AWS.config.update({
                region: window.AWS_CONFIG.region,
                credentials: new AWS.Credentials({
                    accessKeyId: window.AWS_CONFIG.accessKeyId,
                    secretAccessKey: window.AWS_CONFIG.secretAccessKey
                })
            });

            // S3クライアントを作成
            const s3 = new AWS.S3();

            // ファイル名を生成
            const timestamp = this.getCurrentTimestamp();
            const fileName = `${window.AWS_CONFIG.folderPrefix}review_${result.review_id}_${timestamp}.json`;

            // S3にアップロード
            const params = {
                Bucket: window.AWS_CONFIG.bucketName,
                Key: fileName,
                Body: JSON.stringify(result, null, 2),
                ContentType: 'application/json',
                ServerSideEncryption: 'AES256'
            };

            await s3.putObject(params).promise();

            console.log(`S3にアップロード成功: ${fileName}`);
            return true;

        } catch (error) {
            console.error('S3アップロードエラー:', error);
            alert(`S3へのアップロードに失敗しました: ${error.message}\n\nローカルストレージには保存されています。`);
            return false;
        }
    },

    /**
     * すべての結果をS3にバッチアップロード
     * @returns {Promise<boolean>} - 成功したかどうか
     */
    async uploadAllToS3() {
        if (!window.AWS_CONFIG || !window.AWS_CONFIG.enabled) {
            alert('S3アップロードが有効化されていません。config.jsを確認してください。');
            return false;
        }

        const allResults = this.getAllResults();

        if (allResults.length === 0) {
            alert('アップロードするデータがありません');
            return false;
        }

        try {
            const timestamp = this.getCurrentTimestamp();
            const fileName = `${window.AWS_CONFIG.folderPrefix}all_results_${timestamp}.json`;

            // AWS設定
            AWS.config.update({
                region: window.AWS_CONFIG.region,
                credentials: new AWS.Credentials({
                    accessKeyId: window.AWS_CONFIG.accessKeyId,
                    secretAccessKey: window.AWS_CONFIG.secretAccessKey
                })
            });

            const s3 = new AWS.S3();

            const params = {
                Bucket: window.AWS_CONFIG.bucketName,
                Key: fileName,
                Body: JSON.stringify(allResults, null, 2),
                ContentType: 'application/json',
                ServerSideEncryption: 'AES256'
            };

            await s3.putObject(params).promise();

            console.log(`全データをS3にアップロード成功: ${fileName}`);
            alert(`${allResults.length}件のレビュー結果をS3にアップロードしました`);
            return true;

        } catch (error) {
            console.error('S3バッチアップロードエラー:', error);
            alert(`S3へのアップロードに失敗しました: ${error.message}`);
            return false;
        }
    }
};

// グローバルに公開
window.StorageManager = StorageManager;
