// background.js
function initiate() {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));
    chrome.runtime.onInstalled.addListener(() => {
        console.log("Extension installed");
    });
}

initiate();
