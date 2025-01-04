// background.js
let isWidgetOpen = false;
let automationInProgress = false;

chrome.action.onClicked.addListener(async (tab) => {
    try {
        isWidgetOpen = !isWidgetOpen;
        
        if (isWidgetOpen) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch (e) {
                console.log('Content script might already be injected');
            }
        }

        await chrome.tabs.sendMessage(tab.id, { 
            type: 'TOGGLE_WIDGET',
            shouldOpen: isWidgetOpen
        });
    } catch (error) {
        console.error('Error:', error);
        isWidgetOpen = false;
    }
});

// Handle automation execution
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXECUTE_AUTOMATION' && !automationInProgress) {
        automationInProgress = true;
        
        chrome.scripting.executeScript({
            target: { 
                tabId: sender.tab.id,
                allFrames: true  // This is important
            },
            files: ['automationScript.js']
        }).then(() => {
            sendResponse({ success: true });
        }).catch(error => {
            console.error('Automation script error:', error);
            sendResponse({ success: false, error: error.message });
        }).finally(() => {
            automationInProgress = false;
        });
        
        return true; // Keep message channel open for async response
    }
});

// Reset states when tab is updated or removed
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        isWidgetOpen = false;
        automationInProgress = false;
    }
});

chrome.tabs.onRemoved.addListener(() => {
    isWidgetOpen = false;
    automationInProgress = false;
});