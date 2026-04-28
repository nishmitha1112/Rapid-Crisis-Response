import urllib.request, json
data = json.dumps({"sos": True, "sensor": True, "crowd": False, "location": "floor1", "users": [{"id": "staff1", "type": "staff", "distance": 2}]}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/process', data=data, headers={'Content-Type': 'application/json'})
try:
    resp = urllib.request.urlopen(req)
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print("Status:", resp.status)
    print("Response:", json.loads(resp.read().decode('utf-8')))
except Exception as e:
    print("Error:", e)
