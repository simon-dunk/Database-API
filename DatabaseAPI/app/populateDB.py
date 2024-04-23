import requests
from dotenv import load_dotenv
import json
import os

load_dotenv()

PASSWORD = os.getenv("PASSWORD")

payload = { "password": PASSWORD}
print("Your Password:", payload["password"])

header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
r = requests.post("http://localhost:4040/populateDB", json=payload, headers=header)
data = r.json()
print(data["status"])
