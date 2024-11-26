document.getElementById('toggleSkip').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: toggleSkipOverlay
    });
  } else {
    document.getElementById('status').textContent = 'Please navigate to a YouTube video first';
  }
});

function toggleSkipOverlay() {
  const overlay = document.querySelector('.yt-time-skip-overlay');
  if (overlay) {
    overlay.remove();
    return;
  }

  const player = document.querySelector('.html5-video-player');
  if (!player) return;

  const skipOverlay = document.createElement('div');
  skipOverlay.className = 'yt-time-skip-overlay';
  skipOverlay.innerHTML = `
    <div class="skip-message">
      Skip First Minute
      <button class="skip-button">Skip</button>
    </div>
  `;

  player.appendChild(skipOverlay);

  const skipButton = skipOverlay.querySelector('.skip-button');
  skipButton.addEventListener('click', () => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = 60; // Skip to 1 minute
    }
  });
}