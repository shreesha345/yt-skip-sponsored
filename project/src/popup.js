// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('overlayToggle');
  const sponsorToggle = document.getElementById('sponsorToggle');
  const adBlockToggle = document.getElementById('adBlockToggle');
  const status = document.getElementById('status');
  const addSkipButton = document.getElementById('addSkip');
  const skipList = document.getElementById('skipList');

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.url?.includes('youtube.com/watch')) {
    status.textContent = 'Please navigate to a YouTube video';
    toggle.disabled = true;
    sponsorToggle.disabled = true;
    adBlockToggle.disabled = true;
    addSkipButton.disabled = true;
    return;
  }

  // Load saved skip ranges
  const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
  updateSkipList(skipRanges);

  // Add new skip range
  addSkipButton.addEventListener('click', async () => {
    const startMin = parseInt(document.getElementById('startMin').value) || 0;
    const startSec = parseInt(document.getElementById('startSec').value) || 0;
    const endMin = parseInt(document.getElementById('endMin').value) || 0;
    const endSec = parseInt(document.getElementById('endSec').value) || 0;

    const startTime = startMin * 60 + startSec;
    const endTime = endMin * 60 + endSec;

    if (startTime >= endTime) {
      status.textContent = 'End time must be after start time';
      return;
    }

    const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
    const newRanges = [...skipRanges, { start: startTime, end: endTime }];
    
    await chrome.storage.local.set({ skipRanges: newRanges });
    updateSkipList(newRanges);

    // Clear inputs
    document.getElementById('startMin').value = '';
    document.getElementById('startSec').value = '';
    document.getElementById('endMin').value = '';
    document.getElementById('endSec').value = '';

    // Update content script
    try {
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'updateSkipRanges',
        skipRanges: newRanges
      });
      status.textContent = 'Skip range added successfully';
    } catch (error) {
      status.textContent = 'Error: Please refresh the page';
    }
  });

  async function fetchSponsorSegments(videoUrl) {
    try {
      const response = await fetch('http://127.0.0.1:8000/process_video/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ video_url: videoUrl })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sponsor segments');
      }

      const data = await response.json();
      return data.best_segments.map(segment => ({
        start: Math.floor(segment.start_time),
        end: Math.floor(segment.end_time)
      }));
    } catch (error) {
      console.error('Error fetching sponsor segments:', error);
      throw error;
    }
  }

  function updateSkipList(ranges) {
    skipList.innerHTML = ranges.map((range, index) => `
      <div class="skip-item">
        <span class="skip-time">${formatTime(range.start)} - ${formatTime(range.end)}</span>
        <button class="remove-skip" data-index="${index}">×</button>
      </div>
    `).join('');

    // Add remove handlers
    skipList.querySelectorAll('.remove-skip').forEach(button => {
      button.addEventListener('click', async () => {
        const index = parseInt(button.dataset.index);
        const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
        const newRanges = skipRanges.filter((_, i) => i !== index);
        await chrome.storage.local.set({ skipRanges: newRanges });
        updateSkipList(newRanges);

        // Update content script
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateSkipRanges',
            skipRanges: newRanges
          });
          status.textContent = 'Skip range removed successfully';
        } catch (error) {
          status.textContent = 'Error: Please refresh the page';
        }
      });
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Enable toggles and set up event listeners
  toggle.disabled = false;
  sponsorToggle.disabled = false;
  adBlockToggle.disabled = false;
  
  // Get initial states from storage
  const { enabled = false, sponsorEnabled = false, adBlockEnabled = false } = 
    await chrome.storage.local.get(['enabled', 'sponsorEnabled', 'adBlockEnabled']);
  
  toggle.checked = enabled;
  sponsorToggle.checked = sponsorEnabled;
  adBlockToggle.checked = adBlockEnabled;
  
  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.local.set({ enabled });
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleOverlay',
        enabled
      });
      status.textContent = enabled ? 'Auto-skip enabled' : 'Auto-skip disabled';
    } catch (error) {
      status.textContent = 'Error: Please refresh the page';
      toggle.checked = !enabled;
    }
  });

  sponsorToggle.addEventListener('change', async () => {
    const sponsorEnabled = sponsorToggle.checked;
    await chrome.storage.local.set({ sponsorEnabled });
    
    if (sponsorEnabled) {
      status.textContent = 'Fetching sponsored segments...';
      try {
        const segments = await fetchSponsorSegments(tab.url);
        const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
        const newRanges = [...skipRanges, ...segments];
        
        await chrome.storage.local.set({ skipRanges: newRanges });
        updateSkipList(newRanges);
        
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSkipRanges',
          skipRanges: newRanges
        });
        
        status.textContent = 'Sponsored segments added successfully';
      } catch (error) {
        status.textContent = 'Error: Failed to fetch sponsored segments';
        sponsorToggle.checked = false;
        await chrome.storage.local.set({ sponsorEnabled: false });
      }
    } else {
      // Remove sponsored segments
      const { skipRanges = [] } = await chrome.storage.local.get('skipRanges');
      await chrome.storage.local.set({ skipRanges: [] });
      updateSkipList([]);
      
      await chrome.tabs.sendMessage(tab.id, {
        action: 'updateSkipRanges',
        skipRanges: []
      });
      
      status.textContent = 'Sponsored segments removed';
    }
  });

  adBlockToggle.addEventListener('change', async () => {
    const enabled = adBlockToggle.checked;
    await chrome.storage.local.set({ adBlockEnabled: enabled });
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleAdBlock',
        enabled
      });
      status.textContent = enabled ? 'Ad blocking enabled' : 'Ad blocking disabled';
    } catch (error) {
      status.textContent = 'Error: Please refresh the page';
      adBlockToggle.checked = !enabled;
    }
  });
});