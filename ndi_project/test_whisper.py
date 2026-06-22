import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

try:
    print("Attempting to import faster_whisper...")
    import faster_whisper
    print("Success importing faster_whisper!")
    
    # Try loading the model to see if it causes any issues
    print("Loading Whisper model base.en (CPU, int8)...")
    model = faster_whisper.WhisperModel("base.en", device="cpu", compute_type="int8")
    print("Success loading model!")
except Exception as e:
    print(f"Error occurred: {e}")
