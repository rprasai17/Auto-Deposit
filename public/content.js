(() => {
    // Global flag to track widget instance
    let widgetInstance = null;
    let lastAutomationId = null;

    function createWidgetContainer() {
        // Remove existing widget if it exists
        if (widgetInstance) {
            widgetInstance.remove();
        }

        const host = document.createElement('div');
        host.id = 'room-price-calculator-host';

        // Get saved position
        const savedPosition = localStorage.getItem('widgetPosition');
        const position = savedPosition ? JSON.parse(savedPosition) : { x: 20, y: 20 };

        const shadow = host.attachShadow({ mode: 'open' });

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #room-price-calculator-widget {
                position: fixed;
                top: ${position.y}px;
                left: ${position.x}px;
                width: 350px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                z-index: 2147483647;
                overflow: hidden;
                resize: both;
                min-width: 300px;
                min-height: 200px;
            }
            .drag-handle {
                padding: 10px;
                background: #f5f5f5;
                cursor: move;
                user-select: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e0e0e0;
            }
            .close-button {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 16px;
                color: #666;
            }
            .widget-content {
                padding: 16px;
            }
            .deposit-button {
                width: 100%;
                padding: 10px;
                background: #ef4444;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            .deposit-button:hover {
                background: #dc2626;
            }
            .deposit-button:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }
            .status-text {
                margin-top: 8px;
                font-size: 14px;
            }
            .debug-info {
                margin-top: 8px;
                padding: 8px;
                background: #f9fafb;
                border-radius: 4px;
                font-size: 12px;
                max-height: 200px;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
        `;
        shadow.appendChild(styles);

        // Create widget container
        const container = document.createElement('div');
        container.id = 'room-price-calculator-widget';

        // Create header
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        const title = document.createElement('span');
        title.textContent = 'Room Price Calculator';
        dragHandle.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.className = 'close-button';
        closeButton.onclick = () => host.remove();
        dragHandle.appendChild(closeButton);

        // Create content
        const content = document.createElement('div');
        content.className = 'widget-content';

        // Add deposit button
        const depositButton = document.createElement('button');
        depositButton.className = 'deposit-button';
        depositButton.textContent = 'Enter Deposit';
        // In content.js, update the deposit button onclick handler:
        depositButton.onclick = async () => {
            depositButton.disabled = true;
            depositButton.textContent = 'Processing...';
            debugInfo.textContent = ''; // Clear previous debug info

            try {
                statusText.textContent = 'Starting automation...';
                console.log('Sending automation request...');

                chrome.runtime.sendMessage({
                    type: 'EXECUTE_AUTOMATION'
                }, (response) => {
                    console.log('Received automation response:', response);

                    if (response?.success) {
                        statusText.textContent = 'Automation initiated...';
                        debugInfo.textContent = 'Automation script injected successfully...';
                    } else {
                        statusText.textContent = 'Failed to start automation';
                        debugInfo.textContent = response?.error || 'Unknown error';
                        depositButton.disabled = false;
                        depositButton.textContent = 'Enter Deposit';
                    }
                });
            } catch (error) {
                console.error('Automation error:', error);
                statusText.textContent = `Error: ${error.message}`;
                debugInfo.textContent = `Full error: ${error.stack}`;
                depositButton.disabled = false;
                depositButton.textContent = 'Enter Deposit';
            }
        };
        content.appendChild(depositButton);

        // Add status text
        const statusText = document.createElement('div');
        statusText.className = 'status-text';
        content.appendChild(statusText);

        // Add debug info
        const debugInfo = document.createElement('div');
        debugInfo.className = 'debug-info';
        content.appendChild(debugInfo);

        // Assemble widget
        container.appendChild(dragHandle);
        container.appendChild(content);
        shadow.appendChild(container);

        // Make draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        dragHandle.addEventListener('mousedown', e => {
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                isDragging = true;
                const rect = container.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
            }
        });

        document.addEventListener('mousemove', e => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                container.style.left = `${currentX}px`;
                container.style.top = `${currentY}px`;
                localStorage.setItem('widgetPosition', JSON.stringify({
                    x: currentX,
                    y: currentY
                }));
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        return host;
    }

    // Message listener for automation updates
    window.addEventListener('message', (event) => {
        if (event.data.type === 'AUTOMATION_LOG') {
            if (lastAutomationId && lastAutomationId !== event.data.automationId) {
                return; // Ignore messages from old automation runs
            }
            lastAutomationId = event.data.automationId;

            const debugInfo = document.querySelector('#room-price-calculator-host')
                ?.shadowRoot?.querySelector('.debug-info');
            if (debugInfo) {
                debugInfo.textContent += '\n' + event.data.message;
                debugInfo.scrollTop = debugInfo.scrollHeight;
            }
        } else if (event.data.type === 'AUTOMATION_COMPLETE') {
            const statusText = document.querySelector('#room-price-calculator-host')
                ?.shadowRoot?.querySelector('.status-text');
            const depositButton = document.querySelector('#room-price-calculator-host')
                ?.shadowRoot?.querySelector('.deposit-button');

            if (statusText && depositButton) {
                if (event.data.success) {
                    statusText.textContent = 'Automation completed successfully';
                } else {
                    statusText.textContent = `Automation failed: ${event.data.error}`;
                }
                depositButton.disabled = false;
                depositButton.textContent = 'Enter Deposit';
            }
        }
    });

    // Chrome runtime message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_WIDGET') {
            if (widgetInstance && document.contains(widgetInstance)) {
                widgetInstance.remove();
                widgetInstance = null;
            } else {
                widgetInstance = createWidgetContainer();
                document.body.appendChild(widgetInstance);
            }
            sendResponse({ success: true });
        }
        return true;
    });

    // Clean up any existing widgets when the script loads
    const existingWidget = document.getElementById('room-price-calculator-host');
    if (existingWidget) {
        existingWidget.remove();
    }

    console.log('Content script loaded successfully');
})();