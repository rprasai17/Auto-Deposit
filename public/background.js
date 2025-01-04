let isWidgetOpen = false;
let automationInProgress = false;
let lastTabId = null;

chrome.action.onClicked.addListener(async (tab) => {
    try {
        // If clicking on a different tab, reset state
        if (lastTabId !== tab.id) {
            isWidgetOpen = false;
            automationInProgress = false;
        }
        lastTabId = tab.id;

        // Toggle widget state
        isWidgetOpen = !isWidgetOpen;
        
        if (isWidgetOpen) {
            try {
                // Only inject if not already injected
                const [{ result }] = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => window.autoDepositInitialized
                });

                if (!result) {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                }
            } catch (e) {
                console.log('Content script injection error:', e);
            }
        }

        // Send toggle message
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
    if (message.type === 'EXECUTE_AUTOMATION') {
        if (automationInProgress) {
            sendResponse({ success: false, error: 'Automation already in progress' });
            return true;
        }

        automationInProgress = true;
        
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
            automationInProgress = false;
        });

        return true; // Keep message channel open
    }
});

// Reset states when tab is updated or removed
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') {
        if (tabId === lastTabId) {
            isWidgetOpen = false;
            automationInProgress = false;
        }
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastTabId) {
        isWidgetOpen = false;
        automationInProgress = false;
        lastTabId = null;
    }
});