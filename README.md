# AutoDeposit Chrome Extension

## Description
A Chrome extension designed to automate payment processing in the Synxis Control Center system. This extension provides a floating widget interface that automates multiple form interactions including payment method selection, amount entry, and consent confirmation.

## Features
- Floating, draggable widget interface
- Automated form filling and interaction
- Real-time status updates and debugging information
- Position memory for widget placement
- Robust error handling and retry mechanisms

## Installation
1. Download or clone the repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## File Structure
```
room-price-calculator/
├── manifest.json
├── background.js
├── content.js
├── automationScript.js
├── static/
│   ├── logo192.png
│   └── other assets...
└── README.md
```

## Configuration
The extension requires the following permissions in manifest.json:
```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "tabs"
  ],
  "host_permissions": [
    "<all_urls>",
    "https://controlcenter-p2.synxis.com/*",
    "https://*.synxis.com/*"
  ]
}
```

## Usage
1. Click the extension icon to open the widget
2. Position the widget as desired (position will be remembered)
3. Click "Enter Deposit" to start the automation
4. The automation will:
   - Click the post payment button
   - Select "VI - VISA" as payment method
   - Select the debit radio button
   - Enter amount "50"
   - Check the consent checkbox

## Debugging
- The widget includes a debug information panel
- Check the browser console for detailed logs
- Status messages appear in the widget interface

## Technical Details
### Components
- **background.js**: Handles extension initialization and messaging
- **content.js**: Manages widget creation and UI interactions
- **automationScript.js**: Contains the automation logic

### Key Functions
```javascript
// Automation sequence
async function runAutomation() {
    // Handles element finding and interaction
}

// Widget creation
function createWidgetContainer() {
    // Creates and manages the floating widget
}

// Element interaction
const findElementInFrames = (selector) => {
    // Finds elements across multiple frames
}
```

## Error Handling
- Retry mechanism for failed operations
- Detailed error logging
- User-friendly error messages
- Frame detection and handling

## Browser Compatibility
- Chrome Version: Latest version recommended
- Works with Synxis Control Center system

## Development
### Building from Source
1. Clone the repository
2. Make necessary modifications
3. Test in Chrome using "Load unpacked"
4. Package for distribution if needed

### Testing
1. Open Chrome Developer Tools
2. Monitor console for debugging information
3. Check widget debug panel for operation status

## Known Issues
- Must be used on Synxis pages
- Requires proper page loading before automation

## Security
- Extension operates only on specified domains
- No sensitive data is stored or transmitted
- Local storage used only for widget position

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License


## Support
- For bugs, submit an issue in the repository
- For questions, contact [your contact information]

## Acknowledgments
- Built for use with Synxis Control Center
- Uses Chrome Extension Manifest V3

## Version History
- 0.0.1: Initial release
  - Basic automation functionality
  - Widget interface
  - Debugging capabilities

## Future Improvements
- Additional payment method support
- Customizable amount entry
- Enhanced error recovery
- Configuration options

## Notes
- Ensure all necessary permissions are enabled
- Keep Chrome and the extension updated
- Test on a non-production environment first

This README provides a comprehensive overview of your extension. You may want to customize it further based on specific requirements or additional features you plan to add.