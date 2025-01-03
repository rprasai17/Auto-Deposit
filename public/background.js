chrome.action.onClicked.addListener(async (tab) => {
    try {
        // Remove existing content script if any
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const widget = document.getElementById('room-price-calculator-widget');
                if (widget) {
                    widget.remove();
                }
            }
        });

        // Inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        // Send message to toggle widget
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_WIDGET' });
    } catch (error) {
        console.error('Error:', error);
    }
});