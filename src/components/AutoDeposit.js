import React, { useState } from 'react';

function AutoDeposit() {
    const handleClick = () => {
        chrome.tabs.query({ active: true, currentWindow: true },
            (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: clickElement
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    }
                });
            });
    };

    return (
        <div>
            <button onClick={handleClick}>Enter Deposit</button>
        </div>
    );
};

function clickElement() {
    const element = document.getElementById("post-payment-toolbar-item");
    if (element) {
        console.log("element was found");
        element.click();
    } else {
        console.log("element not found");
    }
}




export default AutoDeposit;