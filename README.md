Here’s the updated **README.md** reflecting support for all Chromium-based browsers:  

---

# SkipAds: A Project to Skip Sponsored Content in Videos  

## Problem Statement  

Sponsored segments in videos, while valuable to creators, can interrupt the viewing experience for users who prefer uninterrupted content. Identifying and skipping these segments manually is inconvenient and detracts from user satisfaction, especially when viewing multiple videos.  

## Solution  

SkipAds is a lightweight tool built using Python and Node.js that automates the process of skipping sponsored segments in videos. Optimized for all Chromium-based browsers, SkipAds ensures a seamless and distraction-free video-watching experience.  

---  

## Features  

- **Ad Skipping for Chromium Browsers**: Automatically skips predefined sponsored segments in videos across all Chromium-based browsers.  
- **Custom Rules**: Users can define specific time ranges to skip based on their preferences.  
- **Real-Time Integration**: Works with browser playback to ensure smooth transitions without pauses or delays.  
- **Minimal Resource Usage**: Runs efficiently in the background without impacting system performance.  

---  

## Technology Stack  

- **Python**: Handles video segment processing and logic for skipping.  
- **Node.js**: Manages browser integration and user interaction settings.  

---  

## Installation  

1. **Clone the Repository**:  
   ```bash  
   git clone https://github.com/your-username/skipads.git  
   cd skipads  
   ```  

2. **Install Dependencies**:  
   - For Python:  
     ```bash  
     pip install -r requirements.txt  
     ```
  - for the extension you just need to take that project folder and then upload it to the load unpacked like the below Image:
   ![image](https://github.com/user-attachments/assets/9b7b25b2-1b93-44f0-a4d0-bcd47e8ca4a5)
    after uploading the project folder just run python server.py to start the server.

4. **Run SkipAds**:  
   - Start the Python script:  
     ```bash  
     python server.py  
     ```
---  

## Usage  

1. **Enable SkipAds Extension**: Install and enable the SkipAds integration extension for your Chromium-based browser.  
2. **Define Sponsored Segments**: Mark and save the time ranges of sponsored content in the SkipAds interface.  
3. **Automatic Skipping**: Play videos, and SkipAds will handle skipping in real-time.  

---  

## Supported Browsers  

- Google Chrome  
- Microsoft Edge  
- Brave  
- Opera  

(Any other Chromium-based browser should also be compatible.)  
