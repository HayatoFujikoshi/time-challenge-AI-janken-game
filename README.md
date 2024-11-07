# タイムチャレンジじゃんけんゲーム 🎮

このプロジェクトは、反射神経を鍛えることを目的としたAI駆動のじゃんけんゲームです。プレイヤーは、コンピュータが出す「勝って」「負けて」という指示に従い、手を素早く出していきます。手の認識には画像処理技術を用い、ユーザーの手をリアルタイムで判定します。30秒以内にどれだけ多くの指示に従えるかでスコアが決まり、リーダーボードで他のプレイヤーと競うことができます！

## 主な機能 🌟

- **片手モード**と**両手モード**の2種類のゲームスタイル
- コンピュータが毎回異なる手と指示を出し、プレイヤーはその指示に従って反応
- ユーザーの手の形をリアルタイムで認識し、正確な判定を行います
- 30秒間の制限時間内にスコアを競う
- ゲーム終了後、スコアを入力してリーダーボードに登録可能

## 使用技術 🔧

- **TensorFlow.js**: 手の形状判定モデルを利用して、ユーザーの手の形を認識します
- **MediaPipe Hands**: 手のランドマーク検出
- **HTML/CSS/JavaScript**: ゲームのUIとロジックの構築
- **Flask**: Webサーバーの構築とスコア保存用APIの提供
- **Supabase**: リーダーボードのスコアを管理するデータベース
- **Google Cloud Platform (GCP)**: デプロイ先

## ゲームの遊び方 🎲

1. [ゲームページ](https://time-challenge-janken-game.an.r.appspot.com/)にアクセスします。
2. メインメニューから片手モードまたは両手モードを選択します。
3. カウントダウンが終了したら、画面上の指示に従い、カメラに手を見せて指示に応じた形を出します。
4. 30秒以内に多くの正しい反応を示すことで高スコアを目指しましょう！
5. ゲーム終了後、スコアをリーダーボードに登録して、他のプレイヤーと競いましょう。

## ファイル構成 📂

```plaintext
├── app.py                      # Flaskアプリケーションのメインファイル
├── app.yaml                    # GCPデプロイ用の設定ファイル(githubにはあげていない）
├── requirements.txt            # 必要なPythonパッケージの一覧
├── static                      # 静的ファイル (CSS, JS, 画像、サウンド)
│   ├── css
│   │   ├── leaderboard.css     # リーダーボード画面用のスタイル
│   │   ├── styles.css          # メインのスタイル
│   │   ├── styles_both.css     # 両手モード用のスタイル
│   │   └── styles_single.css   # 片手モード用のスタイル
│   ├── img
│   │   ├── correct.jpg         # 正解時に表示する画像
│   │   ├── paper.png           # 「パー」の手の画像
│   │   ├── rocks.png           # 「グー」の手の画像
│   │   ├── scissors.png        # 「チョキ」の手の画像
│   │   └── tips.png            # プレイガイド用の画像
│   ├── js
│   │   ├── game_both.js        # 両手モードのゲームロジック
│   │   ├── game_single.js      # 片手モードのゲームロジック
│   │   ├── handpose_model      # 手の形状を認識するモデルデータ(自作モデル)
│   │   │   ├── group1-shard1of1.bin 
│   │   │   └── model.json
│   │   └── model               # 手のランドマーク検出用のモデルデータ(mediapipeのモデル使用）
│   │       ├── group1-shard1of1.bin
│   │       └── model.json
│   └── sound
│       ├── correct.wav         # 正解音
│       └── start.wav           # ゲーム開始音
└── templates                   # HTMLテンプレート
    ├── game_both_hands.html    # 両手モードのゲーム画面
    ├── game_single_hand.html   # 片手モードのゲーム画面
    ├── index.html              # ゲームのトップページ
    ├── leaderboard_both.html   # 両手モードのリーダーボード
    └── leaderboard_single.html # 片手モードのリーダーボード

```




# Time Challenge Janken Game 🎮

This project is an AI-powered Rock-Paper-Scissors game designed to train your reflexes. Players must quickly respond to instructions from the computer, which directs them to "win" or "lose" with specific hand shapes. Utilizing image processing techniques, the game recognizes players' hand gestures in real-time. The objective is to follow as many instructions as possible within 30 seconds and compete on the leaderboard against other players!

## Main Features 🌟

- Two game styles: **Single Hand Mode** and **Both Hands Mode**
- The computer gives new instructions for each round, and players must respond quickly
- Real-time recognition of players' hand shapes for precise judgment
- Compete to score the highest within the 30-second time limit
- After the game, players can register their score on the leaderboard

## Technologies Used 🔧

- **TensorFlow.js**: Used for the hand shape recognition model to identify player hand gestures
- **MediaPipe Hands**: Detects hand landmarks
- **HTML/CSS/JavaScript**: Builds the game UI and logic
- **Flask**: Web server setup and API for score saving
- **Supabase**: Database for managing leaderboard scores
- **Google Cloud Platform (GCP)**: Deployment platform

## How to Play 🎲

1. Visit the [game page](https://time-challenge-janken-game.an.r.appspot.com/).
2. Select either Single Hand Mode or Both Hands Mode from the main menu.
3. After the countdown, follow the on-screen instructions and show the correct hand shape to the camera.
4. Aim to respond correctly as many times as possible within 30 seconds to achieve a high score!
5. After the game, register your score on the leaderboard to compete with others.

## File Structure 📂

```plaintext
├── app.py                      # Main file for the Flask application
├── app.yaml                    # GCP deployment configuration (not included in GitHub)
├── requirements.txt            # List of required Python packages
├── static                      # Static files (CSS, JS, images, sounds)
│   ├── css
│   │   ├── leaderboard.css     # Styles for leaderboard page
│   │   ├── styles.css          # Main styles
│   │   ├── styles_both.css     # Styles for Both Hands Mode
│   │   └── styles_single.css   # Styles for Single Hand Mode
│   ├── img
│   │   ├── correct.jpg         # Image shown when player responds correctly
│   │   ├── paper.png           # Image for "paper" hand shape
│   │   ├── rocks.png           # Image for "rock" hand shape
│   │   ├── scissors.png        # Image for "scissors" hand shape
│   │   └── tips.png            # Gameplay guide image
│   ├── js
│   │   ├── game_both.js        # Game logic for Both Hands Mode
│   │   ├── game_single.js      # Game logic for Single Hand Mode
│   │   ├── handpose_model      # Custom model for hand shape recognition
│   │   │   ├── group1-shard1of1.bin 
│   │   │   └── model.json
│   │   └── model               # Mediapipe model for hand landmark detection
│   │       ├── group1-shard1of1.bin
│   │       └── model.json
│   └── sound
│       ├── correct.wav         # Correct response sound
│       └── start.wav           # Game start sound
└── templates                   # HTML templates
    ├── game_both_hands.html    # Game page for Both Hands Mode
    ├── game_single_hand.html   # Game page for Single Hand Mode
    ├── index.html              # Main game page
    ├── leaderboard_both.html   # Leaderboard for Both Hands Mode
    └── leaderboard_single.html # Leaderboard for Single Hand Mode
```
