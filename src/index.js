import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Function to initialize the React app
const init = () => {
    // Try to get the widget content container first
    let container = document.getElementById('room-price-calculator-content');
    
    // If not found, fall back to root (for development)
    if (!container) {
        container = document.getElementById('root');
    }

    // If we found a container, render the app
    if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );

        // Report web vitals
        reportWebVitals();
    } else {
        // If no container is found, retry after a short delay
        setTimeout(init, 100);
    }
};

// Start initialization
init();