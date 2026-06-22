import requests
from pathlib import Path

audio_path = Path("d:/dementia_III/ndi_project/test_converted.wav")
with open(audio_path, "rb") as f:
    files = {"audio": ("test.wav", f, "audio/wav")}
    data = {
        "task_type": "picture-description",
        "task_prompt": "Describe the picture.",
        "task_title": "Test Task"
    }
    response = requests.post("http://localhost:8000/analyze", files=files, data=data)

print(response.status_code)
print(response.json())
