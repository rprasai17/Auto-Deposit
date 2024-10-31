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
            debugInfo: [],
            reactDetails: {
                hasReactInstance: false,
                hasReactProps: false,
                hasOnChange: false,
                hasOnInput: false
            },
            sparkDetails: {
                hasSparkInstance: false,
                sparkMethodsCalled: []
            }
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
                logDebug('Starting number input simulation');
        
                const createKeyboardEvent = (type, key) => {
                    const charCode = key.charCodeAt(0);
                    const keyCode = charCode;
                    
                    // Create the event with all the properties their code checks
                    const event = new KeyboardEvent(type, {
                        key: key,
                        code: `Digit${key}`,
                        charCode: type === 'keypress' ? charCode : 0,
                        keyCode: keyCode,
                        which: type === 'keypress' ? charCode : keyCode,
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                        isTrusted: true,
                        view: window
                    });
        
                    // Force the charCode property
                    Object.defineProperties(event, {
                        charCode: { value: type === 'keypress' ? charCode : 0 },
                        keyCode: { value: keyCode },
                        which: { value: type === 'keypress' ? charCode : keyCode }
                    });
        
                    return event;
                };
        
                // Get label element
                const labelElement = inputElement.closest('label.spark-input');
                if (!labelElement) {
                    logDebug('Could not find parent label');
                    return false;
                }
        
                // Focus and activate
                inputElement.focus();
                labelElement.classList.add('active');
                await new Promise(resolve => setTimeout(resolve, 100));
        
                // Clear the input first
                inputElement.value = '';
                const clearEvent = new Event('input', { bubbles: true });
                inputElement.dispatchEvent(clearEvent);
                await new Promise(resolve => setTimeout(resolve, 50));
        
                // Type each number with proper event sequence
                for (const num of '50') {
                    // 1. Keydown
                    const keydownEvent = createKeyboardEvent('keydown', num);
                    const keydownResult = inputElement.dispatchEvent(keydownEvent);
                    logDebug(`Keydown dispatched: ${keydownResult}`);
                    await new Promise(resolve => setTimeout(resolve, 10));
        
                    // 2. Keypress (crucial for their event system)
                    const keypressEvent = createKeyboardEvent('keypress', num);
                    const keypressResult = inputElement.dispatchEvent(keypressEvent);
                    logDebug(`Keypress dispatched: ${keypressResult}`);
                    await new Promise(resolve => setTimeout(resolve, 10));
        
                    // 3. Update value
                    const currentValue = inputElement.value + num;
                    inputElement.value = currentValue;
                    inputElement.setAttribute('value', currentValue);
        
                    // 4. Input event
                    const inputEvent = new InputEvent('input', {
                        inputType: 'insertText',
                        data: num,
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    });
                    inputElement.dispatchEvent(inputEvent);
                    await new Promise(resolve => setTimeout(resolve, 10));
        
                    // 5. Keyup
                    const keyupEvent = createKeyboardEvent('keyup', num);
                    const keyupResult = inputElement.dispatchEvent(keyupEvent);
                    logDebug(`Keyup dispatched: ${keyupResult}`);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
        
                // Final change event
                const changeEvent = new Event('change', { bubbles: true });
                inputElement.dispatchEvent(changeEvent);
                
                // Set a flag to track our changes
                inputElement._programmaticValue = '50';
        
                // Final verification
                const success = inputElement.value === '50';
                logDebug(`Final value check: ${success ? 'successful' : 'failed'}`);
        
                return success;
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
                const elements = getFormElements();
        
                // Protect the value
                const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                Object.defineProperty(amountInput, 'value', {
                    get: function() {
                        return descriptor.get.call(this);
                    },
                    set: function(v) {
                        if (this._programmaticValue === '50' && v !== '50') {
                            logDebug('Prevented value clear attempt');
                            return;
                        }
                        descriptor.set.call(this, v);
                    },
                    configurable: true
                });
        
                // Set up the submit button
                if (elements.submitButton) {
                    // Clone the button to remove existing listeners
                    const originalButton = elements.submitButton;
                    const newButton = originalButton.cloneNode(true);
                    originalButton.parentNode.replaceChild(newButton, originalButton);
        
                    // Add our handler
                    newButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (amountInput.value !== '50') {
                            await simulateNumberInput(amountInput);
                        }
        
                        // Create a new click event that won't trigger our handler
                        const syntheticClick = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        
                        // Dispatch directly to submit the form
                        Object.defineProperty(syntheticClick, '_synthetic', {
                            value: true,
                            configurable: true
                        });
                        
                        newButton.dispatchEvent(syntheticClick);
                    }, true);
        
                    // Handle synthetic clicks
                    newButton.addEventListener('click', (e) => {
                        if (!e._synthetic) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }, false);
                }
        
                return true;
            } catch (error) {
                logDebug(`Error in handlePaymentButton: ${error.message}`);
                return false;
            }
        };
        
        const handleAmountAndCheckbox = async (amountInput) => {
            try {
                logDebug('Starting handleAmountAndCheckbox');
        
                // Ensure "Pay other amount" radio is selected
                const payOtherAmountRadio = document.getElementById('pay-other-amount-radio-button');
                if (payOtherAmountRadio) {
                    if (!payOtherAmountRadio.checked) {
                        payOtherAmountRadio.click();
                        await new Promise(resolve => setTimeout(resolve, 300));
                        logDebug('Other amount radio selected');
                    } else {
                        logDebug('Other amount radio was already selected');
                    }
                } else {
                    logDebug('Warning: Could not find other amount radio button');
                }
        
                // Set up input monitor
                const inputMonitor = (event) => {
                    logDebug(`Input event detected - Current value: ${event.target.value}`);
                };
                amountInput.addEventListener('input', inputMonitor);
        
                // Try to set the amount with multiple retries
                let success = false;
                let attempts = 0;
                const maxAttempts = 3;
        
                while (!success && attempts < maxAttempts) {
                    attempts++;
                    logDebug(`Attempt ${attempts} to set amount`);
                    
                    success = await simulateNumberInput(amountInput);
                    
                    if (success) {
                        logDebug('Amount set successfully');
                        break;
                    }
        
                    if (!success && attempts < maxAttempts) {
                        logDebug('Waiting before retry...');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
        
                if (!success) {
                    throw new Error(`Failed to set amount after ${maxAttempts} attempts`);
                }
        
                // Clean up monitor
                amountInput.removeEventListener('input', inputMonitor);
        
                // Handle checkbox with retries
                const checkboxInput = document.getElementById('guestConsentCheckBox');
                if (checkboxInput && !checkboxInput.checked) {
                    logDebug('Attempting to click checkbox');
                    
                    let checkboxSuccess = false;
                    attempts = 0;
        
                    while (!checkboxSuccess && attempts < maxAttempts) {
                        attempts++;
                        try {
                            // Store value before checkbox click
                            const valueBeforeCheckbox = amountInput.value;
                            logDebug(`Value before checkbox attempt ${attempts}: ${valueBeforeCheckbox}`);
        
                            // Click checkbox
                            checkboxInput.click();
                            await new Promise(resolve => setTimeout(resolve, 200));
                            
                            // Verify checkbox state
                            checkboxSuccess = checkboxInput.checked;
                            logDebug(`Checkbox click attempt ${attempts}: ${checkboxSuccess ? 'successful' : 'failed'}`);
        
                            // Check if amount was maintained
                            if (amountInput.value !== '50') {
                                logDebug('Value was cleared by checkbox, restoring...');
                                const restoreSuccess = await simulateNumberInput(amountInput);
                                if (!restoreSuccess) {
                                    throw new Error('Failed to restore amount after checkbox');
                                }
                            }
        
                            if (checkboxSuccess) {
                                frameInfo.checkboxClicked = true;
                                break;
                            }
                        } catch (error) {
                            logDebug(`Checkbox click attempt ${attempts} failed: ${error.message}`);
                            if (attempts >= maxAttempts) {
                                throw error;
                            }
                            await new Promise(resolve => setTimeout(resolve, 500));
                        }
                    }
        
                    if (!checkboxSuccess) {
                        throw new Error('Failed to click checkbox after multiple attempts');
                    }
                } else {
                    logDebug('Checkbox was already checked or not found');
                }
        
                // Final verification
                frameInfo.amountEntered = amountInput.value === '50';
                
                const formState = {
                    amount: amountInput.value,
                    checkbox: checkboxInput?.checked,
                    radio: payOtherAmountRadio?.checked
                };
                
                logDebug(`Final form state: ${JSON.stringify(formState)}`);
                
                return formState.amount === '50' && formState.checkbox && formState.radio;
        
            } catch (error) {
                frameInfo.error = `Amount input error: ${error.message}`;
                logDebug(`Error in handleAmountAndCheckbox: ${error.message}`);
                return false;
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