// Add this script tag to your task tracker HTML:
// <script src="/sync-tracker-data.js"></script>

async function syncTrackerDataToGitHub() {
  try {
    // Get data from localStorage
    const trackerData = localStorage.getItem('amyTaskTracker');
    if (!trackerData) {
      console.log('No tracker data to sync');
      return;
    }

    const data = JSON.parse(trackerData);

    // Option 1: Save to GitHub via GitHub API (requires token)
    // For now, we'll just log it
    console.log('Tracker data ready to sync:', data);

    // You can extend this to:
    // 1. POST to a backend endpoint
    // 2. Use GitHub API to commit the data file
    // 3. Trigger the workflow manually

    return true;
  } catch (error) {
    console.error('Sync error:', error);
    return false;
  }
}

// Optional: Add a "Sync Now" button to the dashboard
function addSyncButton() {
  const syncBtn = document.createElement('button');
  syncBtn.textContent = '☁️ Sync to GitHub';
  syncBtn.style.cssText = `
    padding: 10px 16px;
    border: none;
    background: #2196F3;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 12px;
    margin-left: 1rem;
  `;
  syncBtn.onclick = syncTrackerDataToGitHub;
  return syncBtn;
}
