// Handles video-related operations
class VideoController {
  constructor() {
    this.video = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      this.video = await utils.waitForElement('video');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize VideoController:', error);
      return false;
    }
  }

  skipToTime(seconds) {
    if (!this.initialized || !this.video) return false;
    
    try {
      this.video.currentTime = seconds;
      return true;
    } catch (error) {
      console.error('Failed to skip video:', error);
      return false;
    }
  }

  getCurrentTime() {
    return this.video?.currentTime || 0;
  }

  getDuration() {
    return this.video?.duration || 0;
  }

  addTimeUpdateListener(callback) {
    if (!this.initialized || !this.video) return;
    this.video.addEventListener('timeupdate', callback);
  }

  removeTimeUpdateListener(callback) {
    if (!this.initialized || !this.video) return;
    this.video.removeEventListener('timeupdate', callback);
  }

  addDurationChangeListener(callback) {
    if (!this.initialized || !this.video) return;
    this.video.addEventListener('durationchange', callback);
  }

  removeDurationChangeListener(callback) {
    if (!this.initialized || !this.video) return;
    this.video.removeEventListener('durationchange', callback);
  }
}