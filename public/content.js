(() => {
    function removeExistingWidgets() {
        const existingWidgets = document.querySelectorAll('#autodeposit-host');
        existingWidgets.forEach(widget => widget.remove());
    }

    let widgetInstance = null;
    let lastAutomationId = null;

    function createWidgetContainer() {
        removeExistingWidgets();

        const host = document.createElement('div');
        host.id = 'autodeposit-host';

        const savedPosition = localStorage.getItem('autodeposit-position');
        const position = savedPosition ? JSON.parse(savedPosition) : { x: 20, y: 20 };

        const shadow = host.attachShadow({ mode: 'open' });

        const styles = document.createElement('style');
        styles.textContent = `
            #autodeposit-widget {
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

        const container = document.createElement('div');
        container.id = 'autodeposit-widget';

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        const title = document.createElement('span');
        title.textContent = 'AutoDeposit';
        dragHandle.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.className = 'close-button';
        closeButton.onclick = () => {
            host.remove();
            widgetInstance = null;
        };
        dragHandle.appendChild(closeButton);

        const content = document.createElement('div');
        content.className = 'widget-content';

        const depositButton = document.createElement('button');
        depositButton.className = 'deposit-button';
        depositButton.textContent = 'Enter Deposit';
        depositButton.onclick = async () => {
            depositButton.disabled = true;
            depositButton.textContent = 'Processing...';
            
            const debugInfo = shadow.querySelector('.debug-info');
            const statusText = shadow.querySelector('.status-text');
            debugInfo.textContent = '';
            
            try {
                statusText.textContent = 'Starting automation...';
                console.log('Sending automation request...');
                
                chrome.runtime.sendMessage({
                    type: 'EXECUTE_AUTOMATION'
                }, (response) => {
                    console.log('Automation response:', response);
                    
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

        const statusText = document.createElement('div');
        statusText.className = 'status-text';
        content.appendChild(statusText);

        const debugInfo = document.createElement('div');
        debugInfo.className = 'debug-info';
        content.appendChild(debugInfo);

        container.appendChild(dragHandle);
        container.appendChild(content);
        shadow.appendChild(container);

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
                localStorage.setItem('autodeposit-position', JSON.stringify({
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

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_WIDGET') {
            console.log('Toggle widget requested');
            
            if (widgetInstance && document.contains(widgetInstance)) {
                console.log('Removing existing widget');
                widgetInstance.remove();
                widgetInstance = null;
            } else {
                console.log('Creating new widget');
                removeExistingWidgets();
                widgetInstance = createWidgetContainer();
                document.body.appendChild(widgetInstance);
            }
            
            sendResponse({ success: true });
        }
        return true;
    });

    window.addEventListener('message', (event) => {
        if (!widgetInstance) return;

        if (event.data.type === 'AUTOMATION_LOG') {
            if (lastAutomationId && lastAutomationId !== event.data.automationId) {
                return;
            }
            lastAutomationId = event.data.automationId;

            const debugInfo = widgetInstance.shadowRoot?.querySelector('.debug-info');
            if (debugInfo) {
                debugInfo.textContent += '\n' + event.data.message;
                debugInfo.scrollTop = debugInfo.scrollHeight;
            }
        } else if (event.data.type === 'AUTOMATION_COMPLETE') {
            const statusText = widgetInstance.shadowRoot?.querySelector('.status-text');
            const depositButton = widgetInstance.shadowRoot?.querySelector('.deposit-button');
            
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

    // Initial cleanup
    removeExistingWidgets();

    console.log('AutoDeposit content script loaded successfully');
})();
