import React, { useState } from 'react';

const AutoDeposit = () => {
    const [status, setStatus] = useState('');
    const [debug, setDebug] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const findPaymentButton = () => {
        const logDebug = (msg) => {
            console.log(msg);
            setDebug(prev => [...prev, msg]);
        };

        // Log all elements with similar attributes
        const buttons = Array.from(document.querySelectorAll('[role="menubaritem"]'));
        logDebug(`Found ${buttons.length} menubar items`);
        
        buttons.forEach(button => {
            logDebug('Button found:');
            logDebug(`- ID: ${button.id}`);
            logDebug(`- Label: ${button.getAttribute('label')}`);
            logDebug(`- Classes: ${button.className}`);
            logDebug(`- Text: ${button.textContent}`);
        });

        // Try to find the specific button
        const button = buttons.find(btn => 
            btn.id === 'post-payment-toolbar-item' || 
            btn.getAttribute('label')?.toLowerCase() === 'post payment' ||
            btn.getAttribute('aria-label')?.toLowerCase() === 'post payment'
        );

        if (button) {
            logDebug('Found post payment button!');
            return button;
        }

        // If not found, try XPath
        try {
            const xpath = "//div[@role='menubaritem'][@label='post payment']";
            const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            if (result.singleNodeValue) {
                logDebug('Found button using XPath');
                return result.singleNodeValue;
            }
        } catch (e) {
            logDebug(`XPath search error: ${e.message}`);
        }

        return null;
    };

    const automateSequence = async () => {
        const logDebug = (msg) => {
            console.log(msg);
            setDebug(prev => [...prev, msg]);
        };

        try {
            logDebug('Starting automation...');

            // Add a small delay before starting
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Log document state
            logDebug(`Document ready state: ${document.readyState}`);
            logDebug(`Body children count: ${document.body.children.length}`);

            // Try to find all relevant containers
            const containers = {
                folioView: document.querySelector('.folio-view'),
                toolbar: document.querySelector('.spark-toolbar'),
                header: document.querySelector('.folio-transactions-table__header')
            };

            Object.entries(containers).forEach(([name, element]) => {
                logDebug(`${name}: ${element ? 'Found' : 'Not found'}`);
                if (element) {
                    logDebug(`${name} children: ${element.children.length}`);
                }
            });

            // Find the button
            logDebug('Searching for post payment button...');
            const button = findPaymentButton();

            if (!button) {
                // Try querying by full class name
                const altButton = document.querySelector('.spark-toolbar__item.folio-transactions__post-payment_tool-bar-item');
                if (altButton) {
                    logDebug('Found button using class name');
                    button = altButton;
                } else {
                    throw new Error('Post payment button not found');
                }
            }

            logDebug('Attempting to click button...');
            
            // Try different ways to click the button
            try {
                // Method 1: Direct click
                button.click();
                logDebug('Direct click executed');
            } catch (e) {
                logDebug(`Direct click failed: ${e.message}`);
                try {
                    // Method 2: MouseEvent
                    button.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    logDebug('MouseEvent click executed');
                } catch (e2) {
                    logDebug(`MouseEvent click failed: ${e2.message}`);
                }
            }

            // Wait for potential dialog
            await new Promise(resolve => setTimeout(resolve, 1000));

            return true;

        } catch (error) {
            logDebug(`Operation error: ${error.message}`);
            return false;
        }
    };

    const handleClick = async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        setStatus('Running automation sequence...');
        setDebug(['Starting automation...']);

        try {
            const success = await automateSequence();
            setStatus(success ? 'Automation completed successfully' : 'Automation failed');
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            <button 
                onClick={handleClick}
                disabled={isProcessing}
                className={`w-full h-10 px-4 rounded-md text-white ${
                    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
            >
                {isProcessing ? 'Processing...' : 'Enter Deposit'}
            </button>
            
            {status && (
                <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
                    <p className="text-sm text-gray-700">{status}</p>
                </div>
            )}
            
            {debug.length > 0 && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md space-y-1 max-h-48 overflow-y-auto">
                    <div className="font-medium">Debug Log:</div>
                    {debug.map((info, index) => (
                        <div key={index} className="font-mono text-sm">{info}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AutoDeposit;
