import requests
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["https://lyricize.me", "http://localhost:3000"]}})

load_dotenv()

# firebase admin SDK
admin = os.getenv('admin_sdk')
cred = credentials.Certificate(admin)
url = os.getenv('db_url')

firebase_admin.initialize_app(cred, {
    'databaseURL': url,
})

ref = db.reference('/')  

genius_client_access_token = os.getenv('genius_client_access_token')

@app.route('/api/handle-artist-select', methods=['POST'])
def handle_artist_selection():
    data = request.json 
    artist_name = data.get('artist')

    client_access_token = genius_client_access_token
    base_url = 'https://api.genius.com'

    path = 'referents/'
    request_uri = '/'.join([base_url, path])
    
    query = ref.order_by_child('artist_processed').equal_to(artist_name).get()

    song_found = False
    song_count = 0

    if query:
        while not song_found and song_count <= 20:
            song_key = random.choice(list(query.keys())) 
            song_data = query[song_key]

            params = {'song_id': song_data['id'], "text_format": "html"}

            token = 'Bearer {}'.format(client_access_token)
            headers = {'Authorization': token}

            r = requests.get(request_uri, params=params, headers=headers).json()

            print()
            print("Attempt number " + str(song_count + 1))
            print()
            print()

            with open('response.json', 'w') as json_file:
                json.dump(r, json_file, indent=4)

            referents = r["response"]["referents"]

            if len(referents) != 0:
                annotation = random.choice(referents)
                if annotation["annotations"][0]["votes_total"] > 1: 
                    response_data = {
                        'artist': annotation["annotatable"]["context"],
                        'song': annotation["annotatable"]["title"],
                        'lyric': annotation["fragment"],
                        'annotation': annotation["annotations"][0]["body"]["html"]
                    }
                    song_found = True
                else:
                    song_count += 1
            else:
                song_count += 1

        return jsonify(response_data)

    else:
        return jsonify({'empty': 'We could not find any songs by that artist.'})

if __name__ == '__main__':
    # app.run(host='0.0.0.0', port=8000)
    app.run()

       