import os, sys
from pathlib import Path
backend_env = Path('d:/dementia/backend/.env')
print("Exists:", backend_env.exists())
try:
    for line in backend_env.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'\"")
            print(f"Key: '{k}', Value: '{v}'")
            if k == "GEMINI_API_KEY":
                print("FOUND GEMINI KEY")
except Exception as e:
    print("Error:", e)
