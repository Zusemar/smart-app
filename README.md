Если надо поднять https на localhost:
сначала заменить в tsx http на https
короче в папке бэка так писать 
mkcert -install
uvicorn fullback:app --host 0.0.0.0 --port 8000 --ssl-keyfile=localhost+2-key.pem --ssl-certfile=localhost+2.pem

а в папке smartt-app вот так 
node server.js

-----------------------------

Иначе просто как обычно
для бэка из smart-app/ сделать:

python3 -m venv venv
source /venv/bin/activate
pip install requirements.txt
cd backend/
uvicorn fullback:app --reload 

для фронта из smart-app/ сделать:
yarn
yarn run dev
