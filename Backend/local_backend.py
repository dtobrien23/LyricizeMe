import requests
import json
import mysql.connector
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv  

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

load_dotenv()

db_host = os.getenv("db_host")
db_user = os.getenv("db_user")
db_password = os.getenv("db_password")
db_database = os.getenv("db_database")
genius_client_access_token = os.getenv('genius_client_access_token')

@app.route('/api/handle-artist-select', methods=['POST'])
def handle_artist_selection():
    data = request.json  
    artist_name = data.get('artist')

    client_access_token = genius_client_access_token
    base_url = 'https://api.genius.com'

    mydb = mysql.connector.connect(
    host = db_host,
    user = db_user,
    password = db_password,
    database = db_database
    )

    mycursor = mydb.cursor()

    path = 'referents/'
    request_uri = '/'.join([base_url, path])

    query = "SELECT id FROM songs_final WHERE artist_processed = %s"
    mycursor.execute(query, (artist_name,))
    myresult = mycursor.fetchall()
    
    song_found = False
    song_count = 0

    if myresult:
        
        while song_found != True or song_count > 20:
            
            song = random.choice(myresult)
            song_id = str(song[0])
            
            params = {'song_id': song_id, "text_format":"html"}

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

            # return "return"

            if len(referents) != 0:
                annotation = random.choice(referents)
                if annotation["annotations"][0]["votes_total"] > 1:  # to filter out potentially useless annotations
                    response_data = {
                    'artist': annotation["annotatable"]["context"],
                    'song':  annotation["annotatable"]["title"],
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
    app.run()


