import React, { useState } from 'react';

function AutoDeposit() {
    const [status, setStatus] = useState('');
    const [debug, setDebug] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const initializeAndClickElement = () => {
        const frameInfo = {
            url: window.location.href,
            hasFirstElement: false,
            hasSecondElement: false,
            firstElementClicked: false,
            secondElementClicked: false,
            error: null,
            debugInfo: []
        };

        const logDebug = (message) => {
            console.log(message);
            frameInfo.debugInfo.push(message);
        };

        try {
            // First element - post-payment-toolbar-item
            const firstElement = document.getElementById('post-payment-toolbar-item');
            frameInfo.hasFirstElement = !!firstElement;

            if (firstElement) {
                try {
                    if (firstElement.dataset.recentlyClicked === 'true') {
                        frameInfo.error = 'First element was recently clicked, avoiding duplicate click';
                        return frameInfo;
                    }

                    const originalDisplay = firstElement.style.display;
                    const originalVisibility = firstElement.style.visibility;
                    const originalPointerEvents = firstElement.style.pointerEvents;
                    
                    firstElement.style.display = 'flex';
                    firstElement.style.visibility = 'visible';
                    firstElement.style.pointerEvents = 'auto';
                    firstElement.style.opacity = '1';

                    firstElement.dataset.recentlyClicked = 'true';
                    firstElement.click();
                    frameInfo.firstElementClicked = true;
                    logDebug('First element clicked successfully');

                    setTimeout(() => {
                        firstElement.style.display = originalDisplay;
                        firstElement.style.visibility = originalVisibility;
                        firstElement.style.pointerEvents = originalPointerEvents;
                        
                        setTimeout(() => {
                            firstElement.dataset.recentlyClicked = 'false';
                        }, 1000);
                    }, 100);

                    // Second element - try multiple methods to find the select
                    setTimeout(() => {
                        logDebug('Attempting to find select element...');
                        
                        // Try different selectors
                        const selectElement = (
                            document.querySelector('.spark-select__input.folio-post-payment__drop-down-color') ||
                            document.querySelector('.spark-select__input') ||
                            document.querySelector('[class*="spark-select__input"]') ||
                            document.querySelector('select[class*="folio-post-payment"]') ||
                            document.querySelector('select')
                        );

                        if (selectElement) {
                            logDebug('Select element found with classes: ' + selectElement.className);
                            
                            // Log element details for debugging
                            logDebug('Select element details:');
                            logDebug('- Tag: ' + selectElement.tagName);
                            logDebug('- ID: ' + selectElement.id);
                            logDebug('- Classes: ' + selectElement.className);
                            logDebug('- Parent classes: ' + selectElement.parentElement?.className);
                            logDebug('- Display: ' + getComputedStyle(selectElement).display);
                            logDebug('- Visibility: ' + getComputedStyle(selectElement).visibility);
                            
                            frameInfo.hasSecondElement = true;

                            try {
                                // Try multiple interaction methods
                                selectElement.focus();
                                logDebug('Select element focused');
                                
                                // Method 1: Direct click
                                selectElement.click();
                                logDebug('Direct click attempted');

                                // Method 2: Programmatic selection
                                if (selectElement.tagName.toLowerCase() === 'select') {
                                    selectElement.dispatchEvent(new MouseEvent('mousedown'));
                                    selectElement.dispatchEvent(new MouseEvent('mouseup'));
                                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                                    logDebug('Select events dispatched');
                                }

                                // Method 3: Try to open the select dropdown
                                if (selectElement.parentElement) {
                                    const parentClickable = selectElement.parentElement.querySelector('[role="combobox"]') ||
                                                         selectElement.parentElement.querySelector('[aria-haspopup="listbox"]');
                                    if (parentClickable) {
                                        parentClickable.click();
                                        logDebug('Parent combobox clicked');
                                    }
                                }

                                frameInfo.secondElementClicked = true;
                                logDebug('Select element interaction attempts completed');

                            } catch (selectError) {
                                logDebug(`Error interacting with select: ${selectError.message}`);
                                frameInfo.error = `Select interaction error: ${selectError.message}`;
                            }
                        } else {
                            logDebug('Select element not found. Searching for similar elements...');
                            
                            // Log all select and select-like elements for debugging
                            const allSelects = document.querySelectorAll('select');
                            const allComboboxes = document.querySelectorAll('[role="combobox"]');
                            
                            logDebug(`Found ${allSelects.length} select elements`);
                            logDebug(`Found ${allComboboxes.length} combobox elements`);
                            
                            frameInfo.error = 'Select element not found after multiple attempts';
                        }
                    }, 2000);

                } catch (clickError) {
                    logDebug(`First click error: ${clickError.message}`);
                    frameInfo.error = `First click error: ${clickError.message}`;
                }
            }
        } catch (error) {
            logDebug(`Frame error: ${error.message}`);
            frameInfo.error = `Frame error: ${error.message}`;
        }

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(frameInfo);
            }, 2500);
        });
    };

    // ... rest of the component remains the same ...

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