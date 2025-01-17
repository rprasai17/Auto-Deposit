// mountReact.js
(() => {
    const init = () => {
        const host = document.getElementById('room-price-calculator-host');
        if (!host) return;

        const root = host.shadowRoot.getElementById('root');
        if (!root) return;

        const container = ReactDOM.createRoot(root);
        container.render(
            React.createElement(React.StrictMode, null,
                React.createElement(App, null)
            )
        );
    };

    // Try to initialize immediately
    init();

    // Also try when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();
