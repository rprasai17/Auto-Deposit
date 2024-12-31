// Store widget position
let widgetPosition = null;

async function injectWidgetContainer(tab) {
    try {
        if (!tab || !tab.id) {
            console.error('Invalid tab');
            return;
        }

        // First inject the widget container and styles
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: createWidget,
            args: [widgetPosition]
        });

        // Get list of JS files dynamically
        const manifest = chrome.runtime.getManifest();
        const jsFiles = manifest.web_accessible_resources[0].resources
            .filter(file => file.startsWith('static/js/') && file.endsWith('.js'));
        
        console.log('Available JS files:', jsFiles);

        // Now inject the scripts
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (jsFiles) => {
                return new Promise((resolve, reject) => {
                    // Helper function to load a script
                    const loadScript = (url) => {
                        return new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = url;
                            script.onload = resolve;
                            script.onerror = reject;
                            document.body.appendChild(script);
                        });
                    };

                    // Load all JS files in sequence
                    jsFiles.reduce((promise, file) => 
                        promise.then(() => loadScript(chrome.runtime.getURL(file)))
                    , Promise.resolve())
                        .then(() => {
                            // After scripts are loaded, try to mount React
                            console.log('Scripts loaded, attempting to mount React app');
                            const rootElement = document.getElementById('root');
                            if (rootElement) {
                                console.log('Root element found');
                                // The React app should auto-mount due to your index.js
                            } else {
                                console.error('Root element not found');
                            }
                        })
                        .catch(error => {
                            console.error('Error loading scripts:', error);
                            reject(error);
                        });
                });
            },
            args: [jsFiles]
        });

    } catch (error) {
        console.error('Error injecting widget:', error);
    }
}

function createWidget(position) {
    // Calculate initial position if no saved position
    function getInitialPosition() {
        const padding = 20;
        const defaultWidth = 350;
        const x = window.innerWidth - (defaultWidth + padding);
        const y = Math.max(20, (window.innerHeight - 420) / 2);
        return { x, y };
    }

    // Remove existing widget if present
    const existingWidget = document.getElementById('room-price-calculator-widget');
    if (existingWidget) {
        existingWidget.remove();
        return;
    }

    // Use last position or calculate initial position
    const pos = position || getInitialPosition();

    // Create widget styles
    const style = document.createElement('style');
    style.textContent = `
        #room-price-calculator-widget {
            position: fixed;
            top: ${pos.y}px;
            left: ${pos.x}px;
            width: 350px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 2147483647;
            overflow: hidden;
            resize: both;
            min-width: 300px;
            min-height: 240px;
            height: 420px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 
                'Helvetica Neue', sans-serif;
        }

        .widget-drag-handle {
            padding: 10px;
            background: #e50000;
            cursor: move;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e50000;
            color: #ffffff;
        }

        .widget-close-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #ffffff;
            padding: 4px 8px;
        }

        .widget-close-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        #root {
            padding: 16px;
            height: calc(100% - 40px);
            overflow-y: auto;
        }
    `;
    document.head.appendChild(style);

    // Create widget container
    const container = document.createElement('div');
    container.id = 'room-price-calculator-widget';
    
    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'widget-drag-handle';
    
    const title = document.createElement('span');
    title.textContent = 'Room Price Calculator';
    dragHandle.appendChild(title);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.className = 'widget-close-button';
    closeButton.onclick = () => {
        const rect = container.getBoundingClientRect();
        chrome.runtime.sendMessage({ 
            type: 'STORE_POSITION', 
            position: { x: rect.left, y: rect.top }
        });
        container.remove();
    };
    dragHandle.appendChild(closeButton);

    // Add content container for React
    const root = document.createElement('div');
    root.id = 'root';
    
    container.appendChild(dragHandle);
    container.appendChild(root);
    document.body.appendChild(container);
    console.log('Widget container created with root element');

    // Make widget draggable
    let isDragging = false;
    let startX, startY;

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = container.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const newX = e.clientX - startX;
            const newY = e.clientY - startY;
            
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            const boundedX = Math.min(Math.max(0, newX), maxX);
            const boundedY = Math.min(Math.max(0, newY), maxY);
            
            container.style.left = boundedX + 'px';
            container.style.top = boundedY + 'px';
        };
        
        const onMouseUp = () => {
            if (isDragging) {
                const rect = container.getBoundingClientRect();
                chrome.runtime.sendMessage({ 
                    type: 'STORE_POSITION', 
                    position: { x: rect.left, y: rect.top }
                });
            }
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    return true;
}

// Listen for position storage requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'STORE_POSITION') {
        widgetPosition = message.position;
        sendResponse({ success: true });
    }
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
    await injectWidgetContainer(tab);
});