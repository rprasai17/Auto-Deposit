import React, { useState, useEffect } from 'react';

const AutoDeposit = () => {
    const [status, setStatus] = useState('');
    const [debug, setDebug] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setStatus('Running automation sequence...');
        setDebug(['Starting automation...']);

        try {
            // Get the current tab through the parent window
            window.parent.postMessage({
                type: 'RUN_AUTOMATION',
                source: 'room-price-calculator'
            }, '*');
        } catch (error) {
            setStatus(`Error: ${error.message}`);
            setDebug(prev => [...prev, `Error: ${error.message}`]);
            setIsProcessing(false);
        }
    };

    // Listen for messages from content script
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'AUTOMATION_STATUS') {
                setIsProcessing(false);
                if (event.data.success) {
                    setStatus('Automation completed successfully');
                    setDebug(prev => [...prev, 'Automation successful']);
                } else {
                    setStatus(`Automation failed: ${event.data.error}`);
                    setDebug(prev => [...prev, `Failed: ${event.data.error}`]);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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