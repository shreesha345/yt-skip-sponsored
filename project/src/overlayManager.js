// Manages the skip overlay UI
class OverlayManager {
  constructor(videoController) {
    this.videoController = videoController;
    this.skipRanges = [];
    this.highlightElements = [];
  }

  async create() {
    try {
      // Get the YouTube progress bar
      const progressBar = await utils.waitForElement('.ytp-progress-bar-container');
      
      // Load skip ranges
      const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
      this.skipRanges = skipRanges;
      
      // Create highlights for each range
      this.updateHighlights();
      
      // Set up time update listener
      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Failed to create overlay:', error);
      return false;
    }
  }

  updateHighlights() {
    // Remove existing highlights
    this.removeHighlights();

    // Get video duration
    const duration = this.videoController.getDuration();
    if (!duration) return;

    const progressBar = document.querySelector('.ytp-progress-bar-container');
    if (!progressBar) return;

    // Create highlights for each range
    this.skipRanges.forEach(range => {
      const highlight = document.createElement('div');
      highlight.className = 'skip-highlight';
      
      // Calculate position and width
      const startPercent = (range.start / duration) * 100;
      const endPercent = (range.end / duration) * 100;
      
      highlight.style.left = `${startPercent}%`;
      highlight.style.width = `${endPercent - startPercent}%`;
      
      progressBar.appendChild(highlight);
      this.highlightElements.push(highlight);
    });
  }

  removeHighlights() {
    this.highlightElements.forEach(element => element.remove());
    this.highlightElements = [];
  }

  remove() {
    this.cleanup();
    this.removeHighlights();
  }

  setupEventListeners() {
    // Update highlights when video duration changes
    const updateOnDuration = () => {
      this.updateHighlights();
    };

    this.videoController.addDurationChangeListener(updateOnDuration);
    
    this._cleanupCallback = () => {
      this.videoController.removeDurationChangeListener(updateOnDuration);
    };
  }

  cleanup() {
    if (this._cleanupCallback) {
      this._cleanupCallback();
      this._cleanupCallback = null;
    }
  }
}