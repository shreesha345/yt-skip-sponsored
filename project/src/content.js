// Main content script
let videoController = null;
let overlayManager = null;
let isEnabled = false;
let isAdBlockEnabled = false;

async function initialize() {
  if (!utils.isYouTubeVideo()) return;

  try {
    // Get initial states
    const { enabled = false, adBlockEnabled = false } = await chrome.storage.local.get(['enabled', 'adBlockEnabled']);
    isEnabled = enabled;
    isAdBlockEnabled = adBlockEnabled;

    if (!videoController) {
      videoController = new VideoController();
      const initialized = await videoController.initialize();
      
      if (!initialized) {
        console.error('Failed to initialize video controller');
        return;
      }

      // Add time update listener for auto-skip
      videoController.addTimeUpdateListener(async () => {
        if (!isEnabled) return;

        const currentTime = videoController.getCurrentTime();
        const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');

        for (const range of skipRanges) {
          if (currentTime >= range.start && currentTime < range.end) {
            videoController.skipToTime(range.end);
            break;
          }
        }
      });
    }

    if (!overlayManager) {
      overlayManager = new OverlayManager(videoController);
    }

    if (isEnabled) {
      await overlayManager.create();
    }

    // Initialize ad blocking if enabled
    if (isAdBlockEnabled) {
      initializeAdBlocking();
    }
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      // Handle extension reload/update gracefully
      return;
    }
    console.error('Initialization error:', error);
  }
}

function initializeAdBlocking() {
  // Remove video ads
  const removeAds = () => {
    const adElements = [
      '.video-ads',
      '.ytp-ad-overlay-container',
      '.ytp-ad-text-overlay',
      'div[id^="player-ads"]',
      '.ytp-ad-preview-container',
      '.ytd-companion-slot-renderer',
      '.ytd-action-companion-ad-renderer',
      '.ytd-watch-next-secondary-results-renderer > ytd-compact-promoted-video-renderer',
      'ytd-promoted-sparkles-web-renderer',
      '.ytd-display-ad-renderer',
      '.ytd-statement-banner-renderer',
      '.ytd-in-feed-ad-layout-renderer'
    ];

    adElements.forEach(selector => {
      document.querySelectorAll(selector).forEach(ad => {
        ad.remove();
      });
    });

    // Skip video ad if present
    const skipButton = document.querySelector('.ytp-ad-skip-button');
    if (skipButton) {
      skipButton.click();
    }

    // Handle pre-roll ads
    const video = document.querySelector('video');
    if (video && video.duration < 10 && document.querySelector('.ytp-ad-player-overlay')) {
      video.currentTime = video.duration;
    }
  };

  // Run immediately and set up observer
  removeAds();
  
  const observer = new MutationObserver(() => {
    if (isAdBlockEnabled) {
      removeAds();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case 'toggleOverlay':
        isEnabled = message.enabled;
        
        if (overlayManager) {
          if (isEnabled) {
            overlayManager.create();
          } else {
            overlayManager.remove();
          }
          sendResponse({ success: true });
        }
        break;
      
      case 'updateSkipRanges':
        if (overlayManager) {
          overlayManager.skipRanges = message.skipRanges;
          overlayManager.updateHighlights();
          sendResponse({ success: true });
        }
        break;

      case 'toggleAdBlock':
        isAdBlockEnabled = message.enabled;
        if (isAdBlockEnabled) {
          initializeAdBlocking();
        }
        sendResponse({ success: true });
        break;
    }
  } catch (error) {
    console.error('Message handling error:', error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

// Watch for navigation (YouTube is a SPA)
const observer = new MutationObserver(() => {
  if (utils.isYouTubeVideo()) {
    initialize();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial setup
initialize();