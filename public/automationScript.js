// At the very start of automationScript.js, add:
console.log('Automation script starting...');
window.postMessage({ 
    type: 'AUTOMATION_LOG', 
    message: 'Automation script loaded and starting...',
    automationId: Date.now()
}, '*');
(function() {
    const AUTOMATION_ID = Date.now();
    let isRunning = false;

    const waitForElement = async (selector, timeout = 5000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            let element = document.querySelector(selector);
            if (!element) {
                const iframes = document.querySelectorAll('iframe');
                for (const iframe of iframes) {
                    try {
                        element = iframe.contentDocument?.querySelector(selector);
                        if (element) break;
                    } catch (e) {
                        console.log('Cannot access iframe:', e);
                    }
                }
            }
            if (element) return element;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error(`Element ${selector} not found after ${timeout}ms`);
    };

    const isElementInteractable = (element) => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetParent !== null;
    };

    const triggerEvent = (element, eventType) => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        const reactEvent = new Event(`react-${eventType}`, { bubbles: true, cancelable: true });
        element.dispatchEvent(reactEvent);
    };

    const findElementInFrames = (selector) => {
        let element = document.querySelector(selector);
        if (element) return element;

        const iframes = document.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                element = iframe.contentDocument?.querySelector(selector);
                if (element) return element;
            } catch (e) {
                console.log('Cannot access iframe:', e);
            }
        }
        return null;
    };

    const retryOperation = async (operation, maxAttempts = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxAttempts) throw error;
                console.log(`Retry attempt ${attempt} of ${maxAttempts}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    };

    const logDebug = (msg) => {
        console.log(`[${AUTOMATION_ID}] ${msg}`);
        window.postMessage({ 
            type: 'AUTOMATION_LOG', 
            message: msg,
            automationId: AUTOMATION_ID 
        }, '*');
    };

    async function runAutomation() {
        try {
            // Step 1: Click post payment button
            const postPaymentButton = findElementInFrames('#post-payment-toolbar-item') || 
                                    findElementInFrames('.folio-transactions__post-payment_tool-bar-item');
            
            if (!postPaymentButton) {
                throw new Error('Post payment button not found in any frame');
            }
            
            logDebug('Found post payment button');
            logDebug(`Button details: ${postPaymentButton.outerHTML}`);
            postPaymentButton.click();
            logDebug('Post payment button clicked');

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 2: Select payment method
            await retryOperation(async () => {
                const select = findElementInFrames('.spark-select__input.folio-post-payment__drop-down-color');
                if (!select) {
                    throw new Error('Payment method dropdown not found');
                }
                if (!isElementInteractable(select)) {
                    throw new Error('Payment method dropdown is not interactable');
                }
                select.value = 'VI - VISA';
                triggerEvent(select, 'change');
                triggerEvent(select, 'input');
                const changeEvent = new Event('change', { bubbles: true });
                select.dispatchEvent(changeEvent);
                logDebug('Payment method selected: VI - VISA');
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Step 3: Click radio button
            await retryOperation(async () => {
                const radio = findElementInFrames('#debitRecognizationDebit');
                if (!radio) {
                    throw new Error('Debit radio button not found');
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (!isElementInteractable(radio)) {
                    radio.style.opacity = '1';
                    radio.style.visibility = 'visible';
                    radio.style.display = 'inline-block';
                }

                radio.click();
                radio.checked = true;
                triggerEvent(radio, 'change');
                triggerEvent(radio, 'click');
                
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                radio.dispatchEvent(clickEvent);
                logDebug('Debit radio selected');
            }, 5, 1500);

            // Step 4: Enter amount
            await retryOperation(async () => {
                const input = findElementInFrames('#folio-amount-input');
                if (!input) {
                    throw new Error('Amount input not found');
                }
                if (!isElementInteractable(input)) {
                    throw new Error('Amount input is not interactable');
                }
                input.focus();
                input.value = '50';
                triggerEvent(input, 'input');
                triggerEvent(input, 'change');
                input.blur();
                logDebug('Amount entered');
            });

            // Step 5: Check consent box
                       // Step 5: Check consent box
                       await retryOperation(async () => {
                        const checkbox = findElementInFrames('#guestConsentCheckBox') || 
                                       findElementInFrames('.spark-checkbox__input');
                        if (!checkbox) {
                            throw new Error('Consent checkbox not found');
                        }
        
                        await new Promise(resolve => setTimeout(resolve, 1000));
        
                        if (!isElementInteractable(checkbox)) {
                            // Try to make the checkbox interactable
                            checkbox.style.opacity = '1';
                            checkbox.style.visibility = 'visible';
                            checkbox.style.display = 'inline-block';
                        }
        
                        // Try multiple methods to check the box
                        try {
                            // Method 1: Direct click
                            checkbox.click();
                        } catch (e) {
                            try {
                                // Method 2: Programmatic check
                                checkbox.checked = true;
                            } catch (e2) {
                                // Method 3: Dispatch click event
                                const clickEvent = new MouseEvent('click', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                });
                                checkbox.dispatchEvent(clickEvent);
                            }
                        }
        
                        // Trigger all possible events
                        triggerEvent(checkbox, 'change');
                        triggerEvent(checkbox, 'click');
                        triggerEvent(checkbox, 'input');
        
                        // Verify the checkbox is checked
                        if (!checkbox.checked) {
                            throw new Error('Failed to check the consent box');
                        }
        
                        logDebug('Consent checkbox checked');
                    }, 5, 1500); // Increased retries and delay
        
                    // Add verification
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const verifyCheckbox = findElementInFrames('#guestConsentCheckBox');
                    if (verifyCheckbox && !verifyCheckbox.checked) {
                        logDebug('Retrying checkbox one last time...');
                        verifyCheckbox.checked = true;
                        triggerEvent(verifyCheckbox, 'change');
                    }

            logDebug('Automation sequence completed');
            window.postMessage({ 
                type: 'AUTOMATION_COMPLETE', 
                success: true,
                automationId: AUTOMATION_ID
            }, '*');

        } catch (error) {
            logDebug(`Error: ${error.message}`);
            window.postMessage({
                type: 'AUTOMATION_COMPLETE',
                success: false,
                error: error.message,
                automationId: AUTOMATION_ID
            }, '*');
        }
    }

    // Only run if not already running
    if (!isRunning) {
        isRunning = true;
        runAutomation().finally(() => {
            isRunning = false;
        });
    } else {
        console.log('Automation already in progress');
    }
})();