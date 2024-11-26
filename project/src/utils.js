// Utility functions for the extension
const utils = {
  // Check if current page is a YouTube video
  isYouTubeVideo: () => {
    return window.location.hostname === 'www.youtube.com' 
      && window.location.pathname === '/watch';
  },

  // Wait for an element to be present in the DOM
  waitForElement: async (selector, timeout = 5000) => {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element ${selector} not found after ${timeout}ms`);
  },

  // Format time in seconds to MM:SS
  formatTime: (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};