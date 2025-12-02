import requests

# Test CORS preflight request
url = "http://127.0.0.1:8000/api/notifications/"
headers = {
    "Origin": "http://localhost:5173",
    "Access-Control-Request-Method": "GET",
    "Access-Control-Request-Headers": "authorization,content-type"
}

print("Testing CORS preflight (OPTIONS)...")
try:
    response = requests.options(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"\nAccess-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
    print(f"Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'NOT SET')}")
    print(f"Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'NOT SET')}")
    print(f"Access-Control-Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials', 'NOT SET')}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50)
print("\nTesting actual GET request...")
headers_get = {
    "Origin": "http://localhost:5173",
}

try:
    response = requests.get(url, headers=headers_get)
    print(f"Status Code: {response.status_code}")
    print(f"Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
    print(f"Response: {response.text[:200] if response.text else 'Empty'}")
except Exception as e:
    print(f"Error: {e}")
