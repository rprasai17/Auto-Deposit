import React, { useState } from 'react';

function AutoDeposit() {
    const handleClick = () => {
        console.log("autodeposit button clicked 1");
        chrome.tabs.query({ active: true, currentWindow: true },
            (tabs) => {
                console.log("active tab found", tabs[0]);
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => {
                        console.log("executing clickElement funciton");
                        clickElement();
                    }
                }, (results)=> {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    }
                    else
                    {
                        console.log("Script executed1", results);
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
    console.log("clickElement executed");
}


export default AutoDeposit;