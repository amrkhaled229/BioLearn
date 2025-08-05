import requests

url = "https://dev.vdocipher.com/api/videos/81b0e4499e1441fdaaad8ce1909e2cf9/otp"
headers = {
    "Authorization": "Apisecret pKTTyDCDvJJYo2CBSuBer4nXCnfU5ihtNIyXRUMOmVXggPCc9zW4auaPgj6sSkOL",
    "Content-Type": "application/json"
}
payload = { "ttl": 300 }

resp = requests.post(url, json=payload, headers=headers)
print(resp.status_code, resp.json())
