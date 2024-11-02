// game_single.js: シングルプレイヤーモードのゲームロジック

// ========================================
// グローバル変数の宣言
// ========================================

// DOM要素の取得
const preparationElement = document.getElementById('preparation-message'); // 準備中メッセージの要素
const tipsElement = document.getElementById('tips'); // ヒントメッセージの要素
const countdownElement = document.getElementById('countdown');
const gameElement = document.getElementById('game');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const commandElement = document.getElementById('command');
const computerHandImageElement = document.getElementById('computer-hand-image');
const video = document.getElementById('video');
const resultElement = document.getElementById('result');
const finalScoreElement = document.getElementById('final-score');
const correctSound = document.getElementById('correct-sound');
const startSound = document.getElementById('start-sound');
const userHandElement = document.getElementById('user-hand');

// ゲーム関連の変数
let timeLeft = 30;
let score = 0;
let computerHand = '';
let command = '';
let timerStarted = false;
let gameInterval;
let predictionInterval;
let model; // 手の形状判定モデル
let handDetector; // 手の検出モデル

// 前回のユーザーの手を保持
let previousUserHand = '';

// コンピュータの手と指示の組み合わせ
const possibleChoices = [
    { computerHand: "rocks", command: "win", userHand: "paper" },
    { computerHand: "rocks", command: "lose", userHand: "scissors" },
    { computerHand: "paper", command: "win", userHand: "scissors" },
    { computerHand: "paper", command: "lose", userHand: "rocks" },
    { computerHand: "scissors", command: "win", userHand: "rocks" },
    { computerHand: "scissors", command: "lose", userHand: "paper" }
];

// ========================================
// メインの処理開始
// ========================================

// ページの読み込みが完了したら初期化を開始
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// ========================================
// ゲームの初期化と開始
// ========================================

async function initializeGame() {
    // 「準備中...」メッセージを表示
    preparationElement.style.display = 'block';
    tipsElement.style.display = 'block';

    try {
        // モデルのロードとカメラの起動を並行して実行
        await Promise.all([loadModels(), startCamera()]);

        // モデルとカメラの準備が完了したら、テスト推論を実行
        await testModelInference();

        // 「準備中...」メッセージを非表示
        preparationElement.style.display = 'none';

        // カウントダウンの開始
        startInitialCountdown();
    } catch (error) {
        console.error('初期化エラー:', error);
        alert('初期化中にエラーが発生しました。ページをリロードして再試行してください。');
    }
}

// 最初のカウントダウンを開始する
function startInitialCountdown() {
    let countdown = 3; // 3秒からカウントダウン
    countdownElement.innerText = countdown;
    countdownElement.style.display = 'block'; // カウントダウン表示

    let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.innerText = countdown;
        } else {
            countdownElement.innerText = "スタート！";
            clearInterval(countdownInterval);
            setTimeout(() => {
                countdownElement.style.display = 'none';
                tipsElement.style.display = 'none';
                startGame();
            }, 1000);
        }
    }, 1000);
}

// ゲームを開始する
function startGame() {
    gameElement.style.display = 'block';

    // コンピュータの手を取得
    getComputerHand();

    // 手の判定を開始
    predictionInterval = setInterval(predictHandShape, 300);
}

// ========================================
// モデルのロード
// ========================================

async function loadModels() {
    try {
        // 手の形状判定モデルをロード
        model = await tf.loadLayersModel('/static/js/model/model.json');
        console.log('手の形状判定モデルをロードしました');

        // 手の検出モデルを作成
        handDetector = await handPoseDetection.createDetector(
            handPoseDetection.SupportedModels.MediaPipeHands,
            {
                runtime: 'tfjs',
                modelType: 'lite',
                maxHands: 1,
                modelUrl: '/static/js/handpose_model/model.json'// 手の検出モデルのURL（必要に応じて変更してください）
            }
        );
        console.log('手の検出モデルをロードしました');
    } catch (error) {
        console.error('モデルのロードエラー:', error);
        throw error;
    }
}

// ========================================
// カメラの起動と映像の取得
// ========================================

async function startCamera() {
    try {
        // ユーザーのカメラにアクセス
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // カメラ映像の準備ができたらイベントを設定
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                console.log('カメラ映像の取得を開始しました');
                resolve();
            };
        });
    } catch (err) {
        console.error('カメラへのアクセスエラー:', err);
        alert('カメラへのアクセスに失敗しました。権限を確認してください。');
        throw err;
    }
}

// ========================================
// モデルのテスト推論
// ========================================

async function testModelInference() {
    try {
        
        // ビデオが準備できるまで待機
        await new Promise((resolve) => {
            if (video.readyState >= video.HAVE_ENOUGH_DATA) {
                resolve();
            } else {
                video.onloadeddata = () => {
                    resolve();
                };
            }
        });

        
        // ユーザーに手をカメラにかざすように促す
        preparationElement.innerText = '準備中です。手をカメラにかざしてください...';

        // 手が検出されるまで一定時間待機
        let attempts = 0;
        let handsDetected = false;
        while (attempts < 5 && !handsDetected){
            const hands = await handDetector.estimateHands(video, { flipHorizontal: true });
            if (hands.length > 0) {
                const keypoints3D = hands[0].keypoints3D;
                handsDetected = true;// 手が検出された
                if (keypoints3D) {
                    // ランドマークを配列に変換
                    let landmarkArray = [];
                    keypoints3D.forEach(lm => {
                        landmarkArray.push(lm.x, lm.y, lm.z);
                    });

                    // ランドマークをTensorに変換
                    const inputTensor = tf.tensor(landmarkArray).reshape([1, -1]);

                    // モデルで予測
                    const prediction = model.predict(inputTensor);
                    const predictedClass = prediction.argMax(-1).dataSync()[0];

                    // メモリ解放
                    inputTensor.dispose();
                    prediction.dispose();

                    console.log('テスト推論が成功しました。予測クラス:', predictedClass);
                    preparationElement.innerText = '準備完了！間もなくゲームが始まります...';
                } else {
                    console.warn('手が検出されませんでした。再試行します...');
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
                }
            }
        } 
        if (!handsDetected) {
            preparationElement.innerText = '手が検出されませんでしたが、ゲームを開始します。';
            console.warn('手が検出されませんでした。');
        }
        // 少し待ってから次の処理へ
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
        console.error('テスト推論エラー:', error);
        throw error;
    }
}

// ========================================
// 手の形状を予測する
// ========================================

async function predictHandShape() {
    if (!model || !handDetector) return;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
        // ビデオがまだ準備できていない
        return;
    }

    try {
        // 手の検出
        const hands = await handDetector.estimateHands(video, { flipHorizontal: true });

        if (hands.length > 0) {
            const keypoints3D = hands[0].keypoints3D;

            if (keypoints3D) {
                // ランドマークを配列に変換
                let landmarkArray = [];
                keypoints3D.forEach(lm => {
                    landmarkArray.push(lm.x, lm.y, lm.z);
                });

                // ランドマークをTensorに変換
                const inputTensor = tf.tensor(landmarkArray).reshape([1, -1]);

                // モデルで予測
                const prediction = model.predict(inputTensor);
                const predictedClass = prediction.argMax(-1).dataSync()[0];

                // メモリ解放
                inputTensor.dispose();
                prediction.dispose();

                // 予測結果を解釈
                let userHand = '';
                if (predictedClass === 0) {
                    userHand = 'パー';
                } else if (predictedClass === 1) {
                    userHand = 'グー';
                } else {
                    userHand = 'チョキ';
                }

                // ユーザーの手を表示
                userHandElement.innerText = 'あなたの手: ' + userHand;

                // タイマーが開始されていなければ開始
                if (!timerStarted) {
                    startSound.play();
                    startTimer();
                    timerStarted = true;
                }

                // 勝敗の判定
                if (determineWinner(userHandEnglish(userHand), computerHand, command)) {
                    score++;
                    scoreElement.innerText = 'スコア: ' + score;
                    showCorrectFeedback();
                    getComputerHand();
                }
            } else {
                userHandElement.innerText = 'あなたの手: ランドマークが検出されませんでした';
            }
        } else {
            userHandElement.innerText = 'あなたの手: 検出されませんでした';
        }
    } catch (error) {
        console.error('手の判定エラー:', error);
    }
}

// ========================================
// ゲームのタイマーと終了処理
// ========================================

// タイマーの開始
function startTimer() {
    timeLeft = 30;
    timerElement.innerText = '残り時間: ' + timeLeft + '秒';

    gameInterval = setInterval(() => {
        timeLeft--;
        timerElement.innerText = '残り時間: ' + timeLeft + '秒';
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// ゲームの終了
function endGame() {
    // インターバルのクリア
    clearInterval(gameInterval);
    clearInterval(predictionInterval);

    // 画面の切り替え
    gameElement.style.display = 'none';
    resultElement.style.display = 'block';

    // 最終スコアの表示
    displayFinalScore();

    // カメラの停止
    stopCamera();

    // スコア送信フォームのイベントリスナー追加
    setupScoreForm();
}

// 最終スコアの表示
function displayFinalScore() {
    // スコアに応じたメッセージ
    let resultMessage = '';
    if (score >= 20) {
        resultMessage = '素晴らしい！あなたは達人です！';
    } else if (score >= 15) {
        resultMessage = 'よくできました！もう少しで達人ですね。';
    } else if (score >= 10) {
        resultMessage = '頑張りました！あと少しで上達できそうです。';
    } else {
        resultMessage = 'もう少し頑張りましょう！';
    }

    finalScoreElement.innerText = 'あなたのスコア: ' + score + '\n' + resultMessage;
}

// カメラの停止
function stopCamera() {
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
    }
}

// スコア送信フォームのセットアップ
function setupScoreForm() {
    const scoreForm = document.getElementById('score-form');
    scoreForm.addEventListener('submit', function(event) {
        event.preventDefault(); // フォームのデフォルトの送信を防止

        const username = document.getElementById('username').value.trim();
        // 文字数制限チェック
        if (username.length > 10) {
            alert("名前は10文字以内で入力してください。");
            return;
        }
        // サーバーに名前とスコアを送信
        fetch('/submit_score_single', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, score: score })
        })
        .then(response => response.json())
        .then(data => {
            // リーダーボードページにリダイレクト
            window.location.href = '/leaderboard_single';
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('スコアの送信に失敗しました。');
        });
    });
}

// ========================================
// ユーティリティ関数
// ========================================

// コンピュータの手と指示を取得（片手用）
function getComputerHand() {
    // 前回のユーザーの手と異なる組み合わせをフィルタリング
    const filteredChoices = possibleChoices.filter(choice => choice.userHand !== previousUserHand);

    // フィルタリングされた中からランダムに選択
    const selectedChoice = filteredChoices[Math.floor(Math.random() * filteredChoices.length)];

    // 選択された手と指示を取得
    computerHand = selectedChoice.computerHand;
    command = selectedChoice.command;
    const userHand = selectedChoice.userHand;

    // 現在の正解の手を保存
    previousUserHand = userHand;

    // 表示の更新
    commandElement.innerText = '指示: ' + (command === 'win' ? '勝ってください' : '負けてください');
    computerHandImageElement.src = '/static/img/' + computerHand + '.png';
}

// ユーザーの手を英語の表記に変換する関数（勝敗判定に使用）
function userHandEnglish(userHandJapanese) {
    if (userHandJapanese === 'グー') {
        return 'rocks';
    } else if (userHandJapanese === 'チョキ') {
        return 'scissors';
    } else if (userHandJapanese === 'パー') {
        return 'paper';
    }
    return '';
}

// 勝敗を判定する関数
function determineWinner(userHand, computerHand, command) {
    if (command === 'win') {
        if ((userHand === 'rocks' && computerHand === 'scissors') ||
            (userHand === 'scissors' && computerHand === 'paper') ||
            (userHand === 'paper' && computerHand === 'rocks')) {
            return true;
        }
    } else if (command === 'lose') {
        if ((userHand === 'rocks' && computerHand === 'paper') ||
            (userHand === 'scissors' && computerHand === 'rocks') ||
            (userHand === 'paper' && computerHand === 'scissors')) {
            return true;
        }
    }
    return false;
}


// 正解音を再生し、正解画像を表示する関数
function showCorrectFeedback() {
    correctSound.play(); // 正解音を再生

    // 正解画像を表示
    const correctImage = document.getElementById('correct-image');
    correctImage.style.display = 'block';

    // 0.5秒後に非表示にする
    setTimeout(() => {
        correctImage.style.display = 'none';
    }, 500);
}
