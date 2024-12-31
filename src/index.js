import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Function to initialize the React app
const init = () => {
    console.log('React initialization starting...');
    const container = document.getElementById('root');
    
    if (container) {
        console.log('Found root container, creating React root');
        try {
            const root = ReactDOM.createRoot(container);
            console.log('Created React root, rendering app');
            
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
            console.log('App rendered successfully');

            // Report web vitals
            reportWebVitals();
        } catch (error) {
            console.error('Error rendering React app:', error);
        }
    } else {
        console.log('Root container not found, retrying in 100ms');
        setTimeout(init, 100);
    }
};

// Start initialization
console.log('Starting React app initialization');
init();