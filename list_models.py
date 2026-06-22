import os
from google import genai
import sys

# Load API key
from pathlib import Path
backend_env = Path('d:/dementia/backend/.env')
for line in backend_env.read_text(encoding='utf-8').splitlines():
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        if k.strip() == "GEMINI_API_KEY":
            os.environ["GEMINI_API_KEY"] = v.strip().strip("'\"")

client = genai.Client()
for m in client.models.list():
    print(m.name)
