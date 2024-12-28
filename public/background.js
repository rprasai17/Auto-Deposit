async function injectWidgetContainer(tab) {
    try {
        if (!tab || !tab.id) {
            console.error('Invalid tab');
            return;
        }

        // First inject the widget container and styles
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: createWidget
        });

        // Get all JS files from the build directory
        const scripts = await chrome.runtime.getManifest().web_accessible_resources[0].resources
            .filter(file => file.endsWith('.js'));

        // Inject each JS file
        for (const script of scripts) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: [script]
                });
            } catch (error) {
                console.error(`Error injecting script ${script}:`, error);
            }
        }

    } catch (error) {
        console.error('Error injecting widget:', error);
    }
}

function createWidget() {
    // Remove existing widget if present
    const existingWidget = document.getElementById('room-price-calculator-widget');
    if (existingWidget) {
        existingWidget.remove();
        return;
    }

    // Create widget styles
    const style = document.createElement('style');
    style.textContent = `
        #room-price-calculator-widget {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 350px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 2147483647;
            overflow: hidden;
            resize: both;
            min-width: 300px;
            min-height: 200px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 
                'Helvetica Neue', sans-serif;
        }

        .widget-drag-handle {
            padding: 10px;
            background: #f5f5f5;
            cursor: move;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e0e0e0;
        }

        .widget-close-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #666;
            padding: 4px 8px;
        }

        .widget-close-button:hover {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
        }

        #room-price-calculator-content {
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
    closeButton.onclick = () => container.remove();
    dragHandle.appendChild(closeButton);

    // Add content container for React
    const content = document.createElement('div');
    content.id = 'room-price-calculator-content';
    
    container.appendChild(dragHandle);
    container.appendChild(content);
    document.body.appendChild(container);

    // Make widget draggable
    let isDragging = false;
    let startX, startY;

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = container.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        
        // Add move and up listeners to document
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const newX = e.clientX - startX;
            const newY = e.clientY - startY;
            
            // Keep widget within viewport bounds
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            container.style.left = Math.min(Math.max(0, newX), maxX) + 'px';
            container.style.top = Math.min(Math.max(0, newY), maxY) + 'px';
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

// Listen for extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
    await injectWidgetContainer(tab);
});