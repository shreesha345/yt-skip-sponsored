from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from get_yt_transcript import fetch_and_save_transcript, srt_to_custom_json
from get_video import TranscriptBestPartsExtractor

# Initialize FastAPI app
app = FastAPI()

# Define a request model for the API
class VideoURLRequest(BaseModel):
    video_url: str

# Environment variables
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GEMINI_API_KEY environment variable not set.")

# Initialize TranscriptBestPartsExtractor
extractor = TranscriptBestPartsExtractor(GOOGLE_API_KEY)

@app.post("/process_video/")
async def process_video(request: VideoURLRequest):
    """
    Process a YouTube video URL:
    1. Fetch the transcript using yt-dlp.
    2. Convert the transcript to JSON format.
    3. Use Gemini to extract the best segments.
    """
    video_url = request.video_url

    # File paths
    srt_file = "transcript.srt"
    json_file = "transcript.json"

    # Step 1: Fetch and save transcript
    if not fetch_and_save_transcript(video_url, srt_file):
        raise HTTPException(status_code=500, detail="Failed to fetch transcript.")

    # Step 2: Convert SRT to JSON
    try:
        srt_to_custom_json(srt_file, json_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting SRT to JSON: {str(e)}")

    # Step 3: Extract the best parts using Gemini
    try:
        best_segments = extractor.extract_best_parts(json_file)
        return {"best_segments": best_segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting best parts: {str(e)}")
if __name__ == '__main__':
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)