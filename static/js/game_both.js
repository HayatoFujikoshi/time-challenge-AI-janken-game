// game_both.js: 両手モードのゲームロジック

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
const commandRightElement = document.getElementById('command-right');
const commandLeftElement = document.getElementById('command-left');
const computerRightHandImageElement = document.getElementById('computer-right-hand-image');
const computerLeftHandImageElement = document.getElementById('computer-left-hand-image');
const video = document.getElementById('video');
const resultElement = document.getElementById('result');
const finalScoreElement = document.getElementById('final-score');
const correctSound = document.getElementById('correct-sound');
const startSound = document.getElementById('start-sound');
const userHandsElement = document.getElementById('user-hands');

let timeLeft = 30;
let score = 0;
let computerRightHand = '';
let computerLeftHand = '';
let commandRight = '';
let commandLeft = '';
let timerStarted = false;
let gameInterval;
let predictionInterval;
let model;
let handDetector;

// 前回のユーザーの手を保持
let previousRightUserHand = '';
let previousLeftUserHand = '';

// 全ての可能な組み合わせを定義
const possibleChoicesBothHands = [
    { computerRightHand: "rocks", computerLeftHand: "rocks", commandRight: "win", commandLeft: "win", rightUserHand: "paper", leftUserHand: "paper" },
    { computerRightHand: "rocks", computerLeftHand: "rocks", commandRight: "win", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "scissors" },
    { computerRightHand: "rocks", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "paper" },
    { computerRightHand: "rocks", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "scissors" },

    { computerRightHand: "rocks", computerLeftHand: "paper", commandRight: "win", commandLeft: "win", rightUserHand: "paper", leftUserHand: "scissors" },
    { computerRightHand: "rocks", computerLeftHand: "paper", commandRight: "win", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "rocks" },
    { computerRightHand: "rocks", computerLeftHand: "paper", commandRight: "lose", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "scissors" },
    { computerRightHand: "rocks", computerLeftHand: "paper", commandRight: "lose", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "rocks" },

    { computerRightHand: "rocks", computerLeftHand: "scissors", commandRight: "win", commandLeft: "win", rightUserHand: "paper", leftUserHand: "rocks" },
    { computerRightHand: "rocks", computerLeftHand: "scissors", commandRight: "win", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "paper" },
    { computerRightHand: "rocks", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "rocks" },
    { computerRightHand: "rocks", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "paper" },

    { computerRightHand: "paper", computerLeftHand: "rocks", commandRight: "win", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "paper" },
    { computerRightHand: "paper", computerLeftHand: "rocks", commandRight: "win", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "scissors" },
    { computerRightHand: "paper", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "paper" },
    { computerRightHand: "paper", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "scissors" },

    { computerRightHand: "paper", computerLeftHand: "paper", commandRight: "win", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "scissors" },
    { computerRightHand: "paper", computerLeftHand: "paper", commandRight: "win", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "rocks" },
    { computerRightHand: "paper", computerLeftHand: "paper", commandRight: "lose", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "scissors" },
    { computerRightHand: "paper", computerLeftHand: "paper", commandRight: "lose", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "rocks" },

    { computerRightHand: "paper", computerLeftHand: "scissors", commandRight: "win", commandLeft: "win", rightUserHand: "scissors", leftUserHand: "rocks" },
    { computerRightHand: "paper", computerLeftHand: "scissors", commandRight: "win", commandLeft: "lose", rightUserHand: "scissors", leftUserHand: "paper" },
    { computerRightHand: "paper", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "rocks" },
    { computerRightHand: "paper", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "paper" },

    { computerRightHand: "scissors", computerLeftHand: "rocks", commandRight: "win", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "paper" },
    { computerRightHand: "scissors", computerLeftHand: "rocks", commandRight: "win", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "scissors" },
    { computerRightHand: "scissors", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "win", rightUserHand: "paper", leftUserHand: "paper" },
    { computerRightHand: "scissors", computerLeftHand: "rocks", commandRight: "lose", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "scissors" },

    { computerRightHand: "scissors", computerLeftHand: "paper", commandRight: "win", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "scissors" },
    { computerRightHand: "scissors", computerLeftHand: "paper", commandRight: "win", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "rocks" },
    { computerRightHand: "scissors", computerLeftHand: "paper", commandRight: "lose", commandLeft: "win", rightUserHand: "paper", leftUserHand: "scissors" },
    { computerRightHand: "scissors", computerLeftHand: "paper", commandRight: "lose", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "rocks" },

    { computerRightHand: "scissors", computerLeftHand: "scissors", commandRight: "win", commandLeft: "win", rightUserHand: "rocks", leftUserHand: "rocks" },
    { computerRightHand: "scissors", computerLeftHand: "scissors", commandRight: "win", commandLeft: "lose", rightUserHand: "rocks", leftUserHand: "paper" },
    { computerRightHand: "scissors", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "win", rightUserHand: "paper", leftUserHand: "rocks" },
    { computerRightHand: "scissors", computerLeftHand: "scissors", commandRight: "lose", commandLeft: "lose", rightUserHand: "paper", leftUserHand: "paper" }
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

// カウントダウンを開始する
function startInitialCountdown() {
    let countdown = 3; // 3秒からカウントダウン
    countdownElement.innerText = countdown;
    countdownElement.style.display = 'block';

    let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countdownElement.innerText = countdown;
        } else {
            countdownElement.innerText = "スタート！";
            tipsElement.style.display = 'none';
            clearInterval(countdownInterval);
            setTimeout(() => {
                countdownElement.style.display = 'none';
                startGame();
            }, 1000);
        }
    }, 1000);
}

// ゲームを開始する
function startGame() {
    gameElement.style.display = 'block';

    // コンピュータの手を取得
    getComputerHands();

    // 手の判定を開始
    predictionInterval = setInterval(predictHandShapes, 300);
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
                modelType: 'full',
                maxHands: 2,
                modelUrl: '/static/js/handpose_model/model.json' // ローカルにホストした手の検出モデルのパス
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
        if (!model || !handDetector) return;

        if (video.readyState < video.HAVE_ENOUGH_DATA) {
            // ビデオがまだ準備できていない
            return;
        }

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        if (videoWidth === 0 || videoHeight === 0) {
            // ビデオの幅または高さがゼロの場合
            return;
        }

        // ビデオ要素の幅と高さを設定（必要に応じて）
        if (!video.width || !video.height) {
            video.width = videoWidth;
            video.height = videoHeight;
        }

        // ユーザーに手をカメラにかざすように促す
        preparationElement.innerText = '準備中です。手をカメラにかざしてください...';

        // 手が検出されるまで一定時間待機
        let attempts = 0;
        let handsDetected = false;
        while (attempts < 5 && !handsDetected) {
            console.log('Video dimensions:', video.videoWidth, video.videoHeight);
            const hands = await handDetector.estimateHands(video, { flipHorizontal: true });

            if (hands.length > 0) {
                console.log('テスト推論が成功しました。手が検出されました。');
                console.log(hands);
                handsDetected = true;
                let userRightHand = '';
                let userLeftHand = '';

                for (let hand of hands) {
                    const keypoints3D = hand.keypoints3D;

                    if (keypoints3D) {
                        // ランドマークを配列に変換
                        let landmarkArray = [];
                        keypoints3D.forEach(lm => {
                            landmarkArray.push(lm.x, lm.y, lm.z);
                        });

                        // ランドマークをTensorに変換
                        let inputTensor = tf.tensor(landmarkArray).reshape([1, -1]);

                        // モデルで予測
                        const prediction = model.predict(inputTensor);
                        const predictedClass = prediction.argMax(-1).dataSync()[0];
                        inputTensor.dispose();
                        prediction.dispose();

                        let userHand;
                        if (predictedClass === 0) {
                            userHand = 'パー';
                        } else if (predictedClass === 1) {
                            userHand = 'グー';
                        } else {
                            userHand = 'チョキ';
                        }

                        // 手の左右を判定
                        if (hand.handedness === 'Right') {
                            userRightHand = userHand;
                        } else if (hand.handedness === 'Left') {
                            userLeftHand = userHand;
                        } else {
                            // 位置で左右を推定（必要なら実装）
                        }
                    }
                }
                preparationElement.innerText = '準備完了！間もなくゲームが始まります...';
            } else {
                console.warn('手が検出されませんでした。再試行します...');
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
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
// 両手の判定を行う
// ========================================

async function predictHandShapes() {
    if (!model || !handDetector) return;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
        // ビデオがまだ準備できていない
        return;
    }

    try {
        // 手の検出
        const hands = await handDetector.estimateHands(video, { flipHorizontal: true });

        let userRightHand = '';
        let userLeftHand = '';

        for (let hand of hands) {
            const keypoints3D = hand.keypoints3D;

            if (keypoints3D) {
                // ランドマークを配列に変換
                let landmarkArray = [];
                keypoints3D.forEach(lm => {
                    landmarkArray.push(lm.x, lm.y, lm.z);
                });

                // ランドマークをTensorに変換
                let inputTensor = tf.tensor(landmarkArray).reshape([1, -1]);

                // モデルで予測
                const prediction = model.predict(inputTensor);
                const predictedClass = prediction.argMax(-1).dataSync()[0];
                inputTensor.dispose();
                prediction.dispose();

                let userHand;
                if (predictedClass === 0) {
                    userHand = 'パー';
                } else if (predictedClass === 1) {
                    userHand = 'グー';
                } else {
                    userHand = 'チョキ';
                }

                // 手の左右を判定
                if (hand.handedness === 'Right') {
                    userRightHand = userHand;
                } else if (hand.handedness === 'Left') {
                    userLeftHand = userHand;
                } else {
                    // 位置で左右を推定（必要なら実装）
                }
            }
        }

        // ユーザーの手を表示
        userHandsElement.innerText = 'あなたの手 - 左手: ' + (userLeftHand || '検出されませんでした') + ', 右手: ' + (userRightHand || '検出されませんでした');

        // タイマーがまだ開始されていなければ開始
        if (!timerStarted) {
            startSound.play();
            startTimer();
            timerStarted = true;
        }

        // 両手が検出された場合のみ勝敗を判定
        if (userRightHand && userLeftHand) {
            const rightHandResult = determineWinner(userHandEnglish(userRightHand), computerRightHand, commandRight);
            const leftHandResult = determineWinner(userHandEnglish(userLeftHand), computerLeftHand, commandLeft);

            if (rightHandResult && leftHandResult) {
                score++;
                scoreElement.innerText = 'スコア: ' + score;
                showCorrectFeedback() ; // 正解画像を表示
                getComputerHands();
            }
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
    if (score >= 15) {
        resultMessage = '素晴らしい！あなたは達人です！';
    } else if (score >= 10) {
        resultMessage = 'よくできました！もう少しで達人ですね。';
    } else if (score >= 5) {
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
        fetch('/submit_score_both', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, score: score })
        })
        .then(response => response.json())
        .then(data => {
            // リーダーボードページにリダイレクト
            window.location.href = '/leaderboard_both';
        })
        .catch(error => {
            console.error('エラー:', error);
            alert('スコアの送信に失敗しました');
        });
    });
}

// ========================================
// ユーティリティ関数
// ========================================

// コンピュータの手と指示を取得（両手用）
function getComputerHands() {
    // 前回の正解の手と異なる組み合わせをフィルタリング
    const filteredChoices = possibleChoicesBothHands.filter(choice => {
        return choice.rightUserHand !== previousRightUserHand || choice.leftUserHand !== previousLeftUserHand;
    });

    // フィルタリングされた中からランダムに選択
    const selectedChoice = filteredChoices[Math.floor(Math.random() * filteredChoices.length)];

    // 選択された手と指示を取得
    computerRightHand = selectedChoice.computerRightHand;
    computerLeftHand = selectedChoice.computerLeftHand;
    commandRight = selectedChoice.commandRight;
    commandLeft = selectedChoice.commandLeft;

    // ユーザーが出すべき手を保存
    previousRightUserHand = selectedChoice.rightUserHand;
    previousLeftUserHand = selectedChoice.leftUserHand;

    // 表示の更新
    commandRightElement.innerText = '右手の指示: ' + (commandRight === 'win' ? '勝ってください' : '負けてください');
    commandLeftElement.innerText = '左手の指示: ' + (commandLeft === 'win' ? '勝ってください' : '負けてください');
    computerRightHandImageElement.src = '/static/img/' + computerRightHand + '.png';
    computerLeftHandImageElement.src = '/static/img/' + computerLeftHand + '.png';
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

