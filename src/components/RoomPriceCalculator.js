import React, { useState } from 'react';

function RoomPriceCalculator() {
    const [priceAfterTax, setPriceAfterTax] = useState('');
    const [beforeTaxPrice, setBeforeTaxPrice] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        const value = event.target.value;
        setPriceAfterTax(value);
        calculateBeforeTax(value);
    };

    const calculateBeforeTax = (price) => {
        const taxRate = 0.1788;

        const priceAfterTax = parseFloat(price);
        if (!isNaN(priceAfterTax) && priceAfterTax > 0) {
            const beforeTaxPrice = priceAfterTax / (1 + taxRate);
            setBeforeTaxPrice(beforeTaxPrice.toFixed(2));
            setError('');
        } else {
            setBeforeTaxPrice('');
            setError("Please enter a valid positive number");
        }
    }

    return (
        <div style={{ width: '350px' }}>
            <h2 style={{ marginBottom: '15px' }}>Room Price Calculator</h2>
            <form>
                <div style={{ position: 'relative' }}>
                    <label htmlFor="priceAfterTax" style={{ display: 'block', marginBottom: '8px' }}>
                        Price After Tax
                    </label>
                    <input 
                        type="number"
                        id="priceAfterTax"
                        placeholder="Enter room price"
                        value={priceAfterTax}
                        onChange={handleInputChange}
                        style={{ 
                            width: '100%',
                            height: '38px',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
            </form>
            <div style={{ marginTop: '15px' }}>
                <h2>Before Tax Price: <span>${beforeTaxPrice}</span></h2>
            </div>
            <div id="depositButtonContainer" style={{ marginTop: '16px' }}></div>
        </div>
    );
}

export default RoomPriceCalculator;