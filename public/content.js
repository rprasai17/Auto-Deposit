if (!window.roomPriceCalculatorInjected) {
    window.roomPriceCalculatorInjected = true;

    // Store widget position
    let widgetPosition = {
        x: 20,
        y: 20
    };

    // Create widget container with shadow DOM
    function createWidgetContainer() {
        // Create the host element
        const host = document.createElement('div');
        host.id = 'room-price-calculator-host';

        // Get saved position or use default
        const savedPosition = localStorage.getItem('widgetPosition');
        const position = savedPosition ? JSON.parse(savedPosition) : widgetPosition;

        // Attach shadow DOM
        const shadow = host.attachShadow({ mode: 'open' });

        // Create the widget container inside shadow DOM
        const container = document.createElement('div');
        container.id = 'room-price-calculator-widget';

        // Apply styles using a style element in shadow DOM
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
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
                padding: 4px 8px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
    
            .close-button:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
    
            .widget-content {
                padding: 16px;
                background: white;
            }
    
            /* Button styles */
            .widget-content {
                padding: 0;
                background: white;
                height: calc(100% - 40px); /* Subtract header height */
                overflow: hidden;
            }
    
            .widget-content button:hover {
                background-color: #dc2626;
            }
    
            .widget-content button:disabled {
                background-color: #9ca3af;
                cursor: not-allowed;
            }
    
            /* Status and debug styles */
            .status-message {
                margin-top: 8px;
                padding: 8px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                font-size: 14px;
            }
    
            .debug-info {
                margin-top: 8px;
                padding: 8px;
                background: #f9fafb;
                border-radius: 6px;
                font-size: 12px;
                max-height: 200px;
                overflow-y: auto;
            }
    
            .debug-info pre {
                margin: 4px 0;
                font-family: monospace;
            }
        `;

        // Create the widget structure
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

        const content = document.createElement('div');
        content.id = 'room-price-calculator-content';
        content.className = 'widget-content';

        container.appendChild(dragHandle);
        container.appendChild(content);

        // Add styles and container to shadow DOM
        shadow.appendChild(styles);
        shadow.appendChild(container);

        // Make widget draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                initialX = e.clientX - position.x;
                initialY = e.clientY - position.y;
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                // Update position
                position.x = currentX;
                position.y = currentY;
                container.style.left = `${currentX}px`;
                container.style.top = `${currentY}px`;

                // Save position
                localStorage.setItem('widgetPosition', JSON.stringify(position));
            }
        }

        function dragEnd() {
            isDragging = false;
        }

        return host;
    }

    // Initialize widget
    async function initWidget() {
        const existingWidget = document.getElementById('room-price-calculator-host');
        if (!existingWidget) {
            const container = createWidgetContainer();
            document.body.appendChild(container);

            try {
                // Get the content container from shadow DOM
                const content = container.shadowRoot.getElementById('room-price-calculator-content');

                // Create an iframe to load the React app
                const iframe = document.createElement('iframe');
                iframe.style.cssText = `
                    width: 100%;
                    height: calc(100% - 40px); /* Subtract header height */
                    border: none;
                    display: block;
                `;

                // Create the HTML content for the iframe
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <link rel="stylesheet" href="${chrome.runtime.getURL('static/css/main.da16b67b.css')}">
                            <style>
                                body {
                                    margin: 0;
                                    padding: 0;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                                }
                                #root {
                                    padding: 16px;
                                }
                            </style>
                        </head>
                        <body>
                            <div id="root"></div>
                            <script src="${chrome.runtime.getURL('static/js/453.faca7261.chunk.js')}"></script>
                            <script src="${chrome.runtime.getURL('static/js/main.cbaa7084.js')}"></script>
                        </body>
                    </html>
                `;

                // Set the iframe content
                iframe.srcdoc = htmlContent;
                content.appendChild(iframe);

            } catch (error) {
                console.error('Error initializing widget:', error);
            }
        }
    }

    window.addEventListener('message', function (event) {
        if (event.data.type === 'RUN_AUTOMATION' && event.data.source === 'room-price-calculator') {
            runAutomation();
        }
    });

    async function runAutomation() {
        try {
            console.log('Starting automation sequence');

            // Click post payment button
            const button = document.querySelector('#post-payment-toolbar-item');
            if (!button) {
                throw new Error('Post payment button not found');
            }

            button.click();
            console.log('Button clicked');

            // Wait for form elements
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Select payment method
            const select = document.querySelector('.spark-select__input.folio-post-payment__drop-down-color');
            if (select) {
                select.value = 'CA - CASH';
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Click radio button
            const radio = document.querySelector('#debitRecognizationDebit');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Input amount
            const input = document.querySelector('#folio-amount-input');
            if (input) {
                input.value = '50';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Check consent
            const checkbox = document.querySelector('#guestConsentCheckBox');
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Send success message back to iframe
            const iframe = document.querySelector('#room-price-calculator-content iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({
                    type: 'AUTOMATION_STATUS',
                    success: true
                }, '*');
            }
        } catch (error) {
            console.error('Automation failed:', error);
            const iframe = document.querySelector('#room-price-calculator-content iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({
                    type: 'AUTOMATION_STATUS',
                    success: false,
                    error: error.message
                }, '*');
            }
        }
    }

    // Message handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'TOGGLE_WIDGET') {
            const widget = document.getElementById('room-price-calculator-host');
            if (widget) {
                widget.remove();
            } else {
                initWidget();
            }
            sendResponse({ success: true });
        }
        return true;
    });

    console.log('Content script loaded successfully');
}