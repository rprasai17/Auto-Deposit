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
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 50));
        
                // Create and dispatch paste event
                const pasteEvent = new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: new DataTransfer()
                });
                
                // Set the clipboard data
                Object.defineProperty(pasteEvent.clipboardData, 'getData', {
                    value: () => '50'
                });
        
                // Dispatch paste event
                inputElement.dispatchEvent(pasteEvent);
        
                // Set the value (as the paste event would)
                inputElement.value = '50';
                inputElement.setAttribute('value', '50');
        
                // Dispatch necessary follow-up events
                const events = [
                    new InputEvent('input', {
                        bubbles: true,
                        cancelable: true,
                        inputType: 'insertFromPaste',
                        data: '50'
                    }),
                    new Event('change', { bubbles: true }),
                    new FocusEvent('blur', { bubbles: true })
                ];
        
                for (const event of events) {
                    inputElement.dispatchEvent(event);
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
        
                // Log verification
                const finalValue = inputElement.getAttribute('value');
                const displayValue = inputElement.value;
                logDebug(`Verification - Input value: ${displayValue}, Attribute value: ${finalValue}`);
        
                return finalValue === '50' && displayValue === '50';
            } catch (error) {
                logDebug(`Error in simulateNumberInput: ${error.message}`);
                return false;
            }
        };
        
        // Also modify the handleAmountAndCheckbox function to monitor for successful input
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
        
                // Try multiple times if needed
                let success = false;
                let attempts = 0;
                while (!success && attempts < 3) {
                    attempts++;
                    logDebug(`Attempt ${attempts} to enter amount`);
                    success = await simulateNumberInput(amountInput);
                    if (!success) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
        
                // Clean up monitor
                amountInput.removeEventListener('input', inputMonitor);
        
                if (!success) {
                    throw new Error('Failed to enter amount properly');
                }
        
                logDebug(`Amount entered successfully: ${amountInput.getAttribute('value')}`);
        
                // Handle checkbox
                const checkboxInput = document.getElementById('guestConsentCheckBox');
                if (checkboxInput && !checkboxInput.checked) {
                    const valueBeforeCheckbox = amountInput.getAttribute('value');
                    logDebug(`Value before checkbox: ${valueBeforeCheckbox}`);
                    
                    checkboxInput.click();
                    frameInfo.checkboxClicked = true;
                    logDebug('Checkbox clicked');
        
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    if (amountInput.getAttribute('value') !== '50') {
                        logDebug('Value was cleared, attempting to restore');
                        success = await simulateNumberInput(amountInput);
                        if (!success) {
                            throw new Error('Failed to restore amount after checkbox');
                        }
                    }
                }
        
                frameInfo.amountEntered = amountInput.getAttribute('value') === '50';
                
                // Final verification
                logDebug(`Final verification - Amount value: ${amountInput.getAttribute('value')}`);
                
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