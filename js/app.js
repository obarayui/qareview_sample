/**
 * メインアプリケーションロジック
 * レビュー画面の制御と問題の管理
 */

// グローバル状態
let currentProblemSet = null;
let currentQuestionIndex = 0;
let questions = [];
let reviewerName = '';
let answers = {};

/**
 * ページ読み込み時の初期化
 */
document.addEventListener('DOMContentLoaded', async function() {
    // review.htmlの場合のみ初期化
    if (window.location.pathname.includes('review.html')) {
        await initReviewPage();
    }
});

/**
 * レビュー画面の初期化
 */
async function initReviewPage() {
    try {
        // URLパラメータから問題セットを取得
        const urlParams = new URLSearchParams(window.location.search);
        const problemSet = urlParams.get('set');
        const customUrl = urlParams.get('custom');

        // レビューア情報を取得
        const storedReviewerName = localStorage.getItem('reviewerName');
        if (!storedReviewerName) {
            alert('レビューア情報が見つかりません。ホーム画面に戻ります。');
            window.location.href = 'index.html';
            return;
        }

        reviewerName = storedReviewerName;

        // レビューア名を表示
        document.getElementById('reviewerName').textContent = reviewerName;

        // 問題セットを読み込み
        let data;
        if (customUrl) {
            data = await GitHubClient.loadFromCustomUrl(decodeURIComponent(customUrl));
        } else if (problemSet) {
            data = await GitHubClient.loadProblemSet(problemSet);
            document.getElementById('problemSetName').textContent = `問題セット: ${problemSet}`;
        } else {
            throw new Error('問題セットが指定されていません');
        }

        currentProblemSet = data;
        questions = data.questions;

        // 進捗情報を表示
        document.getElementById('totalQuestions').textContent = questions.length;

        // 選択肢ボタンにイベントリスナーを追加
        setupChoiceButtons();

        // 最初の問題を表示
        displayQuestion(0);

        // ローディング画面を非表示、コンテンツを表示
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('reviewContent').style.display = 'block';

    } catch (error) {
        console.error('初期化エラー:', error);
        alert(`エラーが発生しました: ${error.message}`);
        window.location.href = 'index.html';
    }
}

/**
 * 選択肢ボタンのイベントリスナーを設定
 */
function setupChoiceButtons() {
    const container = document.querySelector('.choices');
    const buttons = container.querySelectorAll('.choice-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const choiceIndex = parseInt(this.getAttribute('data-choice'));
            selectChoice(choiceIndex);
        });
    });
}

/**
 * 選択肢を選択
 */
function selectChoice(choiceIndex) {
    // 既に選択されているボタンの選択を解除
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));

    // 新しいボタンを選択
    buttons[choiceIndex].classList.add('selected');

    // 回答を記録
    answers[currentQuestionIndex] = choiceIndex;

    // コメント欄を表示
    const commentArea = document.querySelector('.comment-area');
    if (commentArea) {
        commentArea.style.display = 'block';
    }
}

/**
 * 問題を表示
 */
function displayQuestion(index) {
    currentQuestionIndex = index;
    const question = questions[index];

    // 進捗を更新
    document.getElementById('currentQuestion').textContent = index + 1;

    // 問題情報を表示
    document.getElementById('questionTag').textContent = question.tag || '問題';
    document.getElementById('questionText').textContent = question.question;

    // 画像を表示
    const imagePath = currentProblemSet.imagePath;
    document.getElementById('questionImage').src = imagePath;

    // 選択肢を表示
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((button, i) => {
        button.textContent = question.choice[i];
        button.disabled = false;
        button.classList.remove('selected', 'correct', 'incorrect');

        // 以前の回答があれば復元
        if (answers[index] === i) {
            button.classList.add('selected');
        }
    });

    // コメント欄をリセット
    const commentTextarea = document.getElementById('comment');
    if (commentTextarea) {
        commentTextarea.value = '';
    }
    const commentArea = document.querySelector('.comment-area');
    if (commentArea && answers[index] === undefined) {
        commentArea.style.display = 'none';
    }

    // 結果セクションを非表示
    document.getElementById('resultSection').style.display = 'none';

    // ボタンの状態をリセット
    document.getElementById('submitBtn').style.display = 'inline-block';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('finishBtn').style.display = 'none';
}

/**
 * 回答を提出
 */
function submitAnswers() {
    // 回答が選択されているか確認
    if (answers[currentQuestionIndex] === undefined) {
        alert('回答を選択してください');
        return;
    }

    // 正解は常に最初の選択肢（インデックス0）
    const correctAnswer = 0;

    // 結果を表示
    displayResults(correctAnswer);

    // ボタンの表示を切り替え
    document.getElementById('submitBtn').style.display = 'none';

    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'inline-block';
    } else {
        document.getElementById('finishBtn').style.display = 'inline-block';
    }

    // 選択肢ボタンを無効化
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(button => {
        button.disabled = true;
    });

    // 結果を保存
    saveReviewResult(correctAnswer);
}

/**
 * 結果を表示
 */
function displayResults(correctAnswer) {
    const resultSection = document.getElementById('resultSection');
    const resultContent = document.getElementById('resultContent');
    const correctAnswerText = document.getElementById('correctAnswerText');

    // 結果をクリア
    resultContent.innerHTML = '';

    // 結果を表示
    const answer = answers[currentQuestionIndex];
    const isCorrect = answer === correctAnswer;
    const commentTextarea = document.getElementById('comment');
    const comment = commentTextarea ? commentTextarea.value.trim() : '';

    const resultDiv = document.createElement('div');
    resultDiv.className = `reviewer-result ${isCorrect ? 'correct' : 'incorrect'}`;
    resultDiv.innerHTML = `
        <h4>あなたの回答</h4>
        <p><strong>選択:</strong> ${questions[currentQuestionIndex].choice[answer]}</p>
        <p><strong>判定:</strong> ${isCorrect ? '✓ 正解' : '✗ 不正解'}</p>
        ${comment ? `<p><strong>コメント:</strong> ${comment}</p>` : ''}
    `;
    resultContent.appendChild(resultDiv);

    // 選択肢ボタンの色を更新
    const buttons = document.querySelectorAll('.choice-btn');
    buttons[answer].classList.remove('selected');
    buttons[answer].classList.add(isCorrect ? 'correct' : 'incorrect');
    buttons[correctAnswer].classList.add('correct');

    // 正解を表示
    correctAnswerText.textContent = questions[currentQuestionIndex].choice[correctAnswer];

    // 結果セクションを表示
    resultSection.style.display = 'block';

    // 結果セクションにスクロール
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 次の問題へ
 */
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        displayQuestion(currentQuestionIndex + 1);
    }
}

/**
 * レビュー完了
 */
function finishReview() {
    // 完了メッセージを表示
    const totalQuestions = questions.length;
    let correctCount = 0;

    // 正解数を計算
    for (let i = 0; i < totalQuestions; i++) {
        if (answers[i] === 0) { // 正解は常にインデックス0
            correctCount++;
        }
    }

    const percentage = ((correctCount / totalQuestions) * 100).toFixed(1);
    const message = `レビューが完了しました！\n\n【結果】\n${reviewerName}: ${correctCount}/${totalQuestions}問正解 (${percentage}%)`;

    alert(message);

    // ホーム画面に戻る
    window.location.href = 'index.html';
}

/**
 * ホームに戻る
 */
function backToHome() {
    if (confirm('レビューを中断してホームに戻りますか？')) {
        window.location.href = 'index.html';
    }
}

/**
 * レビュー結果を保存
 */
function saveReviewResult(correctAnswer) {
    const question = questions[currentQuestionIndex];
    const reviewId = generateUniqueId();
    const timestamp = new Date().toISOString();

    // コメントを取得
    const commentTextarea = document.getElementById('comment');
    const comment = commentTextarea ? commentTextarea.value.trim() : '';

    // 結果データを作成
    const result = {
        review_id: reviewId,
        question_id: `${currentProblemSet.problemSet}_q${currentQuestionIndex + 1}`,
        question_set: currentProblemSet.problemSet,
        question_index: currentQuestionIndex,
        question_tag: question.tag,
        question_text: question.question,
        reviewer_name: reviewerName,
        answer: answers[currentQuestionIndex],
        correct_answer: correctAnswer,
        is_correct: answers[currentQuestionIndex] === correctAnswer,
        timestamp: timestamp,
        comment: comment
    };

    // ストレージに保存
    if (window.StorageManager) {
        StorageManager.saveResult(result);

        // S3が有効な場合は自動アップロード
        if (window.AWS_CONFIG && window.AWS_CONFIG.enabled) {
            StorageManager.uploadToS3(result).catch(err => {
                console.error('S3自動アップロードエラー:', err);
            });
        }
    } else {
        // フォールバック: localStorage
        const allResults = JSON.parse(localStorage.getItem('review_results') || '[]');
        allResults.push(result);
        localStorage.setItem('review_results', JSON.stringify(allResults));
    }

    console.log('レビュー結果を保存しました:', result);
}

/**
 * ユニークIDを生成
 */
function generateUniqueId() {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// グローバル関数として公開
window.submitAnswers = submitAnswers;
window.nextQuestion = nextQuestion;
window.finishReview = finishReview;
window.backToHome = backToHome;
