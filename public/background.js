let extensionState = {
    isWidgetOpen: false,
    automationInProgress: false,
    lastTabId: null,
    injectedTabs: new Set()
};

chrome.action.onClicked.addListener(async (tab) => {
    console.log('Extension clicked');

    try {
        // Reset state if switching tabs
        if (extensionState.lastTabId !== tab.id) {
            extensionState.isWidgetOpen = false;
            extensionState.automationInProgress = false;
        }
        extensionState.lastTabId = tab.id;

        // Toggle widget state
        extensionState.isWidgetOpen = !extensionState.isWidgetOpen;
        
        // Inject content script
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log('Content script injected');
        } catch (e) {
            console.log('Content script might already be injected:', e);
        }

        // Send toggle message
        await chrome.tabs.sendMessage(tab.id, { 
            type: 'TOGGLE_WIDGET',
            shouldOpen: extensionState.isWidgetOpen
        });
        console.log('Toggle message sent');

    } catch (error) {
        console.error('Error:', error);
        extensionState.isWidgetOpen = false;
    }
});

// Handle automation execution
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXECUTE_AUTOMATION') {
        if (extensionState.automationInProgress) {
            sendResponse({ success: false, error: 'Automation already in progress' });
            return true;
        }

        extensionState.automationInProgress = true;
        
        chrome.scripting.executeScript({
            target: { 
                tabId: sender.tab.id,
                allFrames: true
            },
            files: ['automationScript.js']
        }).then(() => {
            console.log('Automation script injected successfully');
            sendResponse({ success: true });
        }).catch(error => {
            console.error('Automation script error:', error);
            sendResponse({ success: false, error: error.message });
        }).finally(() => {
            extensionState.automationInProgress = false;
        });

        return true;
    }
});

// Reset states when tab is updated or removed
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading' && tabId === extensionState.lastTabId) {
        extensionState.isWidgetOpen = false;
        extensionState.automationInProgress = false;
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === extensionState.lastTabId) {
        extensionState.isWidgetOpen = false;
        extensionState.automationInProgress = false;
        extensionState.lastTabId = null;
    }
});
