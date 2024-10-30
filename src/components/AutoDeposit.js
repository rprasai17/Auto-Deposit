import React, { useState } from 'react';

function AutoDeposit() {
    const [status, setStatus] = useState('');
    const [debug, setDebug] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const initializeAndClickElement = async () => {
        const frameInfo = {
            url: window.location.href,
            hasFirstElement: false,
            hasSecondElement: false,
            firstElementClicked: false,
            secondElementClicked: false,
            debitSelected: false,
            amountEntered: false,
            checkboxClicked: false,
            error: null,
            debugInfo: []
        };

        const logDebug = (message) => {
            console.log(message);
            frameInfo.debugInfo.push(message);
        };

        const simulateKeyPress = (element, keyCode) => {
            const keyDownEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: keyCode,
                code: keyCode,
                keyCode: keyCode === 'Space' ? 32 : 13,
                which: keyCode === 'Space' ? 32 : 13,
            });
            
            const keyUpEvent = new KeyboardEvent('keyup', {
                bubbles: true,
                cancelable: true,
                key: keyCode,
                code: keyCode,
                keyCode: keyCode === 'Space' ? 32 : 13,
                which: keyCode === 'Space' ? 32 : 13,
            });

            element.dispatchEvent(keyDownEvent);
            element.dispatchEvent(keyUpEvent);
        };

        const simulateExactKeypress = async (inputElement, key) => {
            const dispatchEvent = (eventType, keyDetails) => {
                const event = new KeyboardEvent(eventType, {
                    key: keyDetails.key,
                    code: keyDetails.code,
                    keyCode: keyDetails.keyCode,
                    which: keyDetails.keyCode,
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    composed: true,
                    charCode: keyDetails.keyCode
                });
                Object.defineProperty(event, 'which', { value: keyDetails.keyCode });
                return inputElement.dispatchEvent(event);
            };

            const keyDetails = {
                key: key,
                code: `Digit${key}`,
                keyCode: key.charCodeAt(0)
            };

            // Keydown
            dispatchEvent('keydown', keyDetails);
            await new Promise(resolve => setTimeout(resolve, 5));

            // Update input value
            const prevValue = inputElement.value;
            const newValue = prevValue + key;
            inputElement.value = newValue;
            inputElement.setAttribute('value', newValue);

            // Input event
            const inputEvent = new InputEvent('input', {
                data: key,
                inputType: 'insertText',
                bubbles: true,
                composed: true
            });
            inputElement.dispatchEvent(inputEvent);
            await new Promise(resolve => setTimeout(resolve, 5));

            // Keyup
            dispatchEvent('keyup', keyDetails);
            await new Promise(resolve => setTimeout(resolve, 5));
        };

        const simulateNumberInput = async (inputElement) => {
            try {
                // Get label element
                const labelElement = inputElement.closest('label.spark-input');
                if (!labelElement) {
                    throw new Error('Could not find parent label');
                }
        
                // Focus and click
                inputElement.focus();
                inputElement.click();
                labelElement.classList.add('active');
                await new Promise(resolve => setTimeout(resolve, 50));
        
                // Clear existing value
                inputElement.value = '';
                inputElement.setAttribute('value', '');
                const clearEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'deleteContent'
                });
                inputElement.dispatchEvent(clearEvent);
                await new Promise(resolve => setTimeout(resolve, 50));
        
                // Simulate typing each number individually
                for (const digit of '50') {
                    // Keydown event
                    const keydownEvent = new KeyboardEvent('keydown', {
                        key: digit,
                        code: `Digit${digit}`,
                        keyCode: digit.charCodeAt(0),
                        which: digit.charCodeAt(0),
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    inputElement.dispatchEvent(keydownEvent);
                    
                    // Update value
                    const currentValue = inputElement.value;
                    const newValue = currentValue + digit;
                    inputElement.value = newValue;
                    inputElement.setAttribute('value', newValue);
        
                    // Input event
                    const inputEvent = new InputEvent('input', {
                        inputType: 'insertText',
                        data: digit,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    inputElement.dispatchEvent(inputEvent);
        
                    // Keyup event
                    const keyupEvent = new KeyboardEvent('keyup', {
                        key: digit,
                        code: `Digit${digit}`,
                        keyCode: digit.charCodeAt(0),
                        which: digit.charCodeAt(0),
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    inputElement.dispatchEvent(keyupEvent);
        
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
        
                // Dispatch change event
                const changeEvent = new Event('change', {
                    bubbles: true,
                    cancelable: true
                });
                inputElement.dispatchEvent(changeEvent);
        
                // Blur and remove active class
                const blurEvent = new FocusEvent('blur', {
                    bubbles: true,
                    cancelable: true
                });
                inputElement.dispatchEvent(blurEvent);
                labelElement.classList.remove('active');
        
                // Remove any error messages that might appear
                setTimeout(() => {
                    const errorMessages = document.querySelectorAll('.spark-message__content, .spark-input__message');
                    errorMessages.forEach(el => {
                        if (el.textContent.includes('Amount is required') || 
                            el.textContent.includes('Transaction Incomplete')) {
                            el.remove();
                        }
                    });
                }, 100);
        
                return true;
            } catch (error) {
                logDebug(`Error in simulateNumberInput: ${error.message}`);
                return false;
            }
        };
        
        const inspectFormFields = () => {
            try {
                // Find all forms
                const forms = document.querySelectorAll('form');
                console.log(`Found ${forms.length} forms`);
        
                forms.forEach((form, formIndex) => {
                    console.log(`\nInspecting Form ${formIndex + 1}:`);
                    console.log('Form ID:', form.id);
                    console.log('Form Name:', form.name);
                    console.log('Form Action:', form.action);
        
                    // Get all inputs, including hidden ones
                    const inputs = form.querySelectorAll('input');
                    console.log(`\nFound ${inputs.length} input fields:`);
                    
                    inputs.forEach(input => {
                        console.log({
                            type: input.type,
                            name: input.name,
                            id: input.id,
                            value: input.value,
                            hidden: input.type === 'hidden',
                            attributes: Array.from(input.attributes).map(attr => ({
                                name: attr.name,
                                value: attr.value
                            }))
                        });
                    });
        
                    // Also check for any elements with 'amount' in their name/id
                    const amountRelatedElements = form.querySelectorAll('[id*="amount" i], [name*="amount" i], [class*="amount" i]');
                    console.log('\nElements related to amount:', Array.from(amountRelatedElements).map(el => ({
                        tagName: el.tagName,
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        value: el.value,
                        className: el.className
                    })));
                });
        
                // Also check for any hidden inputs outside of forms
                const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
                console.log('\nHidden inputs outside forms:', Array.from(hiddenInputs).filter(input => !input.closest('form')).map(input => ({
                    name: input.name,
                    id: input.id,
                    value: input.value,
                    attributes: Array.from(input.attributes).map(attr => ({
                        name: attr.name,
                        value: attr.value
                    }))
                })));
        
                // Check for any elements with 'amount' in their attributes anywhere in the document
                const amountElements = document.querySelectorAll('[id*="amount" i], [name*="amount" i], [class*="amount" i], [data-amount]');
                console.log('\nAll amount-related elements in document:', Array.from(amountElements).map(el => ({
                    tagName: el.tagName,
                    id: el.id,
                    name: el.name,
                    type: el.type,
                    value: el.value,
                    className: el.className,
                    dataset: el.dataset
                })));
        
            } catch (error) {
                console.error('Error inspecting forms:', error);
            }
        };
        


        const handlePaymentButton = async (amountInput) => {
            try {
                // Store original jQuery ajax
                const originalAjax = window.jQuery.ajax;
        
                // Override jQuery ajax
                window.jQuery.ajax = function(...args) {
                    const [settings] = args;
        
                    // Check if this is the payment request
                    if (settings.url?.includes('device-payment/request')) {
                        console.log('Intercepting payment request');
        
                        // If data is a string, parse it
                        if (typeof settings.data === 'string') {
                            try {
                                settings.data = JSON.parse(settings.data);
                            } catch (e) {
                                console.log('Failed to parse request data');
                            }
                        }
        
                        // Ensure all required fields are present
                        if (typeof settings.data === 'object') {
                            const paymentData = {
                                ...settings.data,
                                amount: "50",
                                debit: true,
                                paymentCode: "VI",
                                folioId: 1,
                                revAccountTypeId: 1
                            };
        
                            // Update request data
                            settings.data = JSON.stringify(paymentData);
                            settings.contentType = 'application/json';
                        }
        
                        // Add required headers
                        settings.headers = {
                            ...settings.headers,
                            'Accept': 'application/json, text/javascript, */*; q=0.01',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        };
        
                        // Modify callbacks to log responses
                        const originalSuccess = settings.success;
                        const originalError = settings.error;
        
                        settings.success = function(response, status, xhr) {
                            console.log('Payment request succeeded:', response);
                            if (originalSuccess) {
                                originalSuccess.apply(this, arguments);
                            }
                        };
        
                        settings.error = function(xhr, status, error) {
                            console.log('Payment request failed:', {status, error});
                            if (originalError) {
                                originalError.apply(this, arguments);
                            }
                        };
                    }
        
                    // Call original ajax with modified settings
                    return originalAjax.apply(this, args);
                };
        
                // Handle submit button
                const submitButtons = document.querySelectorAll('button[type="submit"]');
                submitButtons.forEach(button => {
                    const originalClick = button.onclick;
                    
                    button.onclick = async function(e) {
                        // Set value
                        amountInput.value = '50';
                        amountInput.setAttribute('value', '50');
        
                        // Let the original click handler run
                        if (originalClick) {
                            return originalClick.apply(this, arguments);
                        }
                    };
                });
        
                // Clean up after 5 seconds
                setTimeout(() => {
                    window.jQuery.ajax = originalAjax;
                }, 5000);
        
            } catch (error) {
                console.error('Error in handlePaymentButton:', error);
            }
        };
        
        const handleAmountAndCheckbox = async (amountInput) => {
            try {
                // First ensure "Pay other amount" radio is selected
                const payOtherAmountRadio = document.getElementById('pay-other-amount-radio-button');
                if (payOtherAmountRadio && !payOtherAmountRadio.checked) {
                    payOtherAmountRadio.click();
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
        
                // Set up an input monitor
                const inputMonitor = (event) => {
                    logDebug(`Input event detected - Current value: ${event.target.value}`);
                };
                amountInput.addEventListener('input', inputMonitor);
        
                // Try to set the amount
                let success = await simulateNumberInput(amountInput);
                if (!success) {
                    throw new Error('Failed to set initial amount');
                }
        
                // Clean up monitor
                amountInput.removeEventListener('input', inputMonitor);
        
                logDebug(`Amount entered successfully: ${amountInput.value}`);
        
                // Handle checkbox
                const checkboxInput = document.getElementById('guestConsentCheckBox');
                if (checkboxInput && !checkboxInput.checked) {
                    const valueBeforeCheckbox = amountInput.value;
                    logDebug(`Value before checkbox: ${valueBeforeCheckbox}`);
                    
                    checkboxInput.click();
                    frameInfo.checkboxClicked = true;
                    logDebug('Checkbox clicked');
        
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (amountInput.value !== '50') {
                        logDebug('Value was cleared, attempting to restore');
                        success = await simulateNumberInput(amountInput);
                        if (!success) {
                            throw new Error('Failed to restore amount after checkbox');
                        }
                    }
                }
        
                // Set up payment button handler
                await handlePaymentButton(amountInput);
        
                frameInfo.amountEntered = amountInput.value === '50';
                
                // Final verification
                logDebug(`Final verification - Amount value: ${amountInput.value}`);
                
            } catch (error) {
                frameInfo.error = `Amount input error: ${error.message}`;
                logDebug(`Error in handleAmountAndCheckbox: ${error.message}`);
            }
        };

        try {
            const firstElement = document.getElementById('post-payment-toolbar-item');
            frameInfo.hasFirstElement = !!firstElement;

            if (firstElement) {
                try {
                    if (firstElement.dataset.recentlyClicked === 'true') {
                        frameInfo.error = 'First element was recently clicked, avoiding duplicate click';
                        return frameInfo;
                    }

                    firstElement.click();
                    frameInfo.firstElementClicked = true;
                    logDebug('First element clicked successfully');

                    await new Promise(resolve => setTimeout(resolve, 800));

                    const paymentMethodSelect = document.querySelector('select.spark-select__input.folio-post-payment__drop-down-color');

                    if (paymentMethodSelect) {
                        logDebug('Select element found');
                        try {
                            paymentMethodSelect.focus();
                            await new Promise(resolve => setTimeout(resolve, 100));
                            simulateKeyPress(paymentMethodSelect, 'Space');
                            
                            const visaOption = Array.from(paymentMethodSelect.options)
                                .find(option => option.value.includes('VI - VISA'));

                            if (visaOption) {
                                paymentMethodSelect.value = visaOption.value;
                                paymentMethodSelect.dispatchEvent(new Event('change', { bubbles: true }));
                                paymentMethodSelect.dispatchEvent(new Event('input', { bubbles: true }));
                                simulateKeyPress(paymentMethodSelect, 'Enter');
                                logDebug(`Selected value: ${paymentMethodSelect.value}`);
                                
                                frameInfo.secondElementClicked = true;
                                frameInfo.hasSecondElement = true;

                                await new Promise(resolve => setTimeout(resolve, 500));

                                const debitRadio = document.getElementById('debitRecognizationDebit');
                                if (debitRadio) {
                                    debitRadio.click();
                                    frameInfo.debitSelected = true;
                                    logDebug('Debit radio button selected');

                                    await new Promise(resolve => setTimeout(resolve, 300));

                                    const amountInput = document.getElementById('folio-amount-input');
                                    if (amountInput) {
                                        await handleAmountAndCheckbox(amountInput);
                                    } else {
                                        logDebug('Amount input not found');
                                        frameInfo.error = 'Amount input not found';
                                    }
                                } else {
                                    logDebug('Debit radio button not found');
                                    frameInfo.error = 'Debit radio button not found';
                                }
                            } else {
                                logDebug('VISA option not found');
                                frameInfo.error = 'VISA option not found';
                            }
                        } catch (selectError) {
                            logDebug(`Error interacting with elements: ${selectError.message}`);
                            frameInfo.error = `Element interaction error: ${selectError.message}`;
                        }
                    } else {
                        logDebug('Select element not found');
                        frameInfo.error = 'Select element not found';
                    }
                } catch (clickError) {
                    logDebug(`First click error: ${clickError.message}`);
                    frameInfo.error = `First click error: ${clickError.message}`;
                }
            }
        } catch (error) {
            logDebug(`Frame error: ${error.message}`);
            frameInfo.error = `Frame error: ${error.message}`;
        }

        return frameInfo;
    };

    const handleClick = async () => {
        if (isProcessing) {
            setStatus('Already processing a click, please wait...');
            return;
        }

        setIsProcessing(true);
        setStatus('Starting execution...');
        setDebug(['Beginning click sequence...']);

        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (!tab?.id) {
                setStatus('No active tab found');
                setIsProcessing(false);
                return;
            }

            const frameResults = await chrome.scripting.executeScript({
                target: { 
                    tabId: tab.id,
                    allFrames: true
                },
                func: initializeAndClickElement,
                world: "MAIN"
            });

            const successfulResult = frameResults.find(result => 
                result?.result?.firstElementClicked
            );
            
            if (successfulResult) {
                const result = successfulResult.result;
                setStatus('Elements clicked successfully');
                setDebug([
                    'First element clicked',
                    `URL: ${result.url}`,
                    `Second element found: ${result.hasSecondElement}`,
                    `Second element clicked: ${result.secondElementClicked}`,
                    `Debit option selected: ${result.debitSelected}`,
                    `Amount entered: ${result.amountEntered}`,
                    `Checkbox clicked: ${result.checkboxClicked}`,
                    '---Debug Info---',
                    ...(result.debugInfo || [])
                ]);
            } else {
                setStatus('Failed to click elements');
                setDebug([
                    'Element interaction failed',
                    ...frameResults.map(result => 
                        `Frame URL: ${result?.result?.url || 'unknown'}\n` +
                        `Error: ${result?.result?.error || 'No specific error'}`
                    )
                ]);
            }
        } catch (error) {
            console.error('Execution error:', error);
            setStatus(`Error: ${error.message}`);
            setDebug([`Error details: ${error.stack || error.message}`]);
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
            }, 500);
        }
    };

    return (
        <div className="p-4">
            <button 
                onClick={handleClick}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded ${
                    isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {isProcessing ? 'Processing...' : 'Enter Deposit'}
            </button>
            {status && (
                <div className="mt-2 text-sm font-medium">
                    Status: {status}
                </div>
            )}
            {debug.length > 0 && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    <div className="font-medium">Debug Info:</div>
                    {debug.map((info, index) => (
                        <div key={index} className="ml-2 whitespace-pre-wrap font-mono">{info}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AutoDeposit;