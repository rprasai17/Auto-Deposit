// background.js

// Initialize the extension
async function initializeExtension() {
    try {
        // Set up side panel behavior
        await chrome.sidePanel.setPanelBehavior({ 
            openPanelOnActionClick: true 
        });
        console.log('Side panel behavior set successfully');
    } catch (error) {
        console.error('Error setting side panel behavior:', error);
    }
}

// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    switch (details.reason) {
        case 'install':
            console.log('Extension installed successfully');
            initializeExtension();
            break;
        case 'update':
            console.log('Extension updated to version', chrome.runtime.getManifest().version);
            initializeExtension();
            break;
        case 'chrome_update':
            console.log('Chrome browser updated');
            initializeExtension();
            break;
        case 'shared_module_update':
            console.log('Shared module updated');
            break;
    }
});

// Handle errors
chrome.runtime.onError.addListener((error) => {
    console.error('Runtime error:', error);
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.type === 'OPEN_SIDE_PANEL') {
            chrome.sidePanel.open({ windowId: sender.tab.windowId });
            sendResponse({ success: true });
        }
        // Add more message handlers as needed
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
});

// Initialize on startup
initializeExtension();