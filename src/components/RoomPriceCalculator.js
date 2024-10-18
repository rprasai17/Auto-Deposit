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
        if (!isNaN(priceAfterTax) && priceAfterTax > 0)
        {
            const beforeTaxPrice = priceAfterTax / (1 + taxRate);
            setBeforeTaxPrice(beforeTaxPrice.toFixed(2));
            setError('');
        }
        else
        {
            setBeforeTaxPrice('');
            setError("Please enter a valid positive number");
        }
    }

    return (
        <div className="container mt-3" style={{ width: '450px' }}>
            <h2>Room Price Calculator</h2>
            <form>
                <div className="mb-3">
                    <label htmlFor="priceAfterTax" className="form-label" style={{  display: 'block'  }}>Price After Tax</label>
                    <input 
                        type="number"
                        className="form-control"
                        id="priceAfterTax"
                        placeholder="Enter room price"
                        value={priceAfterTax}
                        onChange={handleInputChange}
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
            </form>
            <div className="mt-3">
                <h2>Before Tax Price: <span>${beforeTaxPrice}</span></h2>
            </div>
        </div>
    );
}

export default RoomPriceCalculator;