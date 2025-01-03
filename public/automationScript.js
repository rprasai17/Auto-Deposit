// automationScript.js
(function() {
    async function runAutomation() {
        const logDebug = (msg) => {
            console.log(msg);
            window.postMessage({ type: 'AUTOMATION_LOG', message: msg }, '*');
        };

        try {
            // Click post payment button
            const button = document.getElementById('post-payment-toolbar-item');
            if (!button) {
                throw new Error('Post payment button not found');
            }

            button.click();
            logDebug('Post payment button clicked');

            // Wait for form elements
            await new Promise(resolve => setTimeout(resolve, 800));

            // Select payment method
            const select = document.querySelector('.spark-select__input.folio-post-payment__drop-down-color');
            if (select) {
                select.value = 'CA - CASH';
                select.dispatchEvent(new Event('change', { bubbles: true }));
                logDebug('Payment method selected');
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            // Click radio button
            const radio = document.getElementById('debitRecognizationDebit');
            if (radio) {
                radio.click();
                logDebug('Debit radio selected');
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            // Input amount
            const input = document.getElementById('folio-amount-input');
            if (input) {
                input.focus();
                input.value = '50';
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                logDebug('Amount entered');
            }

            await new Promise(resolve => setTimeout(resolve, 300));

            // Check consent
            const checkbox = document.getElementById('guestConsentCheckBox');
            if (checkbox) {
                checkbox.click();
                logDebug('Consent checkbox checked');
            }

            window.postMessage({ type: 'AUTOMATION_COMPLETE', success: true }, '*');
        } catch (error) {
            logDebug(`Error: ${error.message}`);
            window.postMessage({ 
                type: 'AUTOMATION_COMPLETE', 
                success: false, 
                error: error.message 
            }, '*');
        }
    }

    runAutomation();
})();