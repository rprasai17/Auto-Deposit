// Create widget container
function createWidgetContainer() {
    const container = document.createElement('div');
    container.id = 'room-price-calculator-widget';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 2147483647;
        overflow: hidden;
        resize: both;
        min-width: 300px;
        min-height: 200px;
    `;

    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.style.cssText = `
        padding: 10px;
        background: #f5f5f5;
        cursor: move;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('span');
    title.textContent = 'Room Price Calculator';
    dragHandle.appendChild(title);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: #666;
    `;
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
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === dragHandle) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, container);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragEnd() {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    return container;
}

// Initialize widget
function initWidget() {
    const existingWidget = document.getElementById('room-price-calculator-widget');
    if (!existingWidget) {
        createWidgetContainer();
        // Inject React app
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('index.js');
        document.body.appendChild(script);
    }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_WIDGET') {
        const widget = document.getElementById('room-price-calculator-widget');
        if (widget) {
            widget.remove();
        } else {
            initWidget();
        }
        sendResponse({ success: true });
    }
});