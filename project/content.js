function createSkipOverlay() {
  const video = document.querySelector('video');
  if (!video) return;

  // Create and inject the skip overlay
  const skipOverlay = document.createElement('div');
  skipOverlay.className = 'yt-time-skip-overlay';
  
  // Add the skip indicator
  const skipIndicator = document.createElement('div');
  skipIndicator.className = 'skip-indicator';
  skipIndicator.style.width = '100%';
  skipOverlay.appendChild(skipIndicator);

  // Add it to the player
  const player = document.querySelector('.html5-video-player');
  if (player) {
    player.appendChild(skipOverlay);
  }

  // Update the indicator position based on video time
  video.addEventListener('timeupdate', () => {
    if (video.currentTime <= 60) {
      skipIndicator.style.width = `${(video.currentTime / 60) * 100}%`;
    }
  });

  // Add click handler to skip
  skipOverlay.addEventListener('click', () => {
    video.currentTime = 60;
  });
}

// Watch for navigation changes (YouTube is a SPA)
const observer = new MutationObserver(() => {
  if (window.location.href.includes('youtube.com/watch')) {
    createSkipOverlay();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});