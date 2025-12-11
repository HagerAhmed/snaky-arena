import urllib.request
import json
import urllib.error
import time

BASE_URL = "http://localhost:3000/api/v1"

def verify_fix():
    print(f"Verifying backend at {BASE_URL}...")
    
    # Check if we can reach the health/root or just auth
    # Root is at / so http://localhost:3000/ (from main.py)
    # But API is at /api/v1
    
    url = f"{BASE_URL}/auth/signup"
    print(f"Attempting Signup at {url}...")
    
    # Use a random user to avoid 400 Duplicate Error
    import random
    suffix = random.randint(1000, 9999)
    data = {
        "username": f"TestUser{suffix}",
        "email": f"test{suffix}@game.com",
        "password": "password123"
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as f:
            print(f"SUCCESS: Signup returned {f.getcode()}")
            resp = json.loads(f.read().decode('utf-8'))
            print("Response:", resp)
            print("\nVERIFICATION PASSED: The backend is reachable and API prefix is correct.")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print("Body:", e.read().decode('utf-8'))
        if e.code == 400:
             print("\nVERIFICATION PASSED (Partial): Endpoint reachable but request failed (likely duplicate).")
        else:
             print("\nVERIFICATION FAILED: Unexpected error.")
    except urllib.error.URLError as e:
        print(f"Connection Failed: {e.reason}")
        print("\nVERIFICATION FAILED: Backend not reachable. Did you restart the server?")

if __name__ == "__main__":
    verify_fix()
