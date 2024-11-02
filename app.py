import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # CORSライブラリをインポート
from supabase import create_client, Client
from datetime import datetime, timedelta

app = Flask(__name__)

# SupabaseのURLとAPIキーの取得
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# アプリ全体にCORSを適用
CORS(app, origins=[supabase_url]) 

# ルートエンドポイント
@app.route('/')
def index():
    return render_template('index.html')

# 片手モードのゲーム開始エンドポイント
@app.route('/start_game_single_hand')
def start_game_single_hand():
    return render_template('game_single_hand.html')

# 両手モードのゲーム開始エンドポイント
@app.route('/start_game_both_hands')
def start_game_both_hands():
    return render_template('game_both_hands.html')

# リーダーボードの保存と取得機能
@app.route('/submit_score_single', methods=['POST'])
def submit_score_single():
    data = request.get_json()
    username = data.get('username')
    score = data.get('score')

    if username and score is not None:
        try:
            supabase.table("leaderboard_single").insert({
                "username": username,
                "score": score,
            }).execute()
            return jsonify({'status': 'success'})
        except Exception as e:
            print(f'Error saving score: {e}')  # ログにエラーを記録
            return jsonify({'status': 'partial_success'}), 200  # データが保存されていれば、成功と見なす
    else:
        return jsonify({'status': 'error'}), 400

@app.route('/leaderboard_single')
def leaderboard_single_hand():
    result = supabase.table("leaderboard_single").select("*").order("score", desc=True).limit(100).execute()
    leaderboard = result.data

    # 日付をパース
    for entry in leaderboard:
        # UTCの日時を取得
        utc_date = datetime.fromisoformat(entry['date'])
        # 日本時間に変換
        jst_date = utc_date + timedelta(hours=9)
        entry['date'] = jst_date

    return render_template('leaderboard_single.html', leaderboard=leaderboard)

@app.route('/submit_score_both', methods=['POST'])
def submit_score_both():
    data = request.get_json()
    username = data.get('username')
    score = data.get('score')

    if username and score is not None:
        try:
            supabase.table("leaderboard_both").insert({
                "username": username,
                "score": score,
            }).execute()
            return jsonify({'status': 'success'})
        except Exception as e:
            print(f'Error saving score: {e}')  # ログにエラーを記録
            return jsonify({'status': 'partial_success'}), 200  # データが保存されていれば、成功と見なす
    else:
        return jsonify({'status': 'error'}), 400


@app.route('/leaderboard_both')
def leaderboard_both_hand():
    result = supabase.table("leaderboard_both").select("*").order("score", desc=True).limit(100).execute()
    leaderboard = result.data

    # 日付をパース
    for entry in leaderboard:
        # UTCの日時を取得
        utc_date = datetime.fromisoformat(entry['date'])
        # 日本時間に変換
        jst_date = utc_date + timedelta(hours=9)
        entry['date'] = jst_date

    return render_template('leaderboard_both.html', leaderboard=leaderboard)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
