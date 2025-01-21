# 🔄 AutoDeposit Chrome Extension

## 📝 Description
A Chrome extension designed to automate payment processing in the Synxis Control Center system. This extension provides a floating widget interface that automates multiple form interactions including payment method selection, amount entry, and consent confirmation.

## ✨ Features
* **Interactive Widget Interface**
  * Floating, draggable design
  * Position memory functionality
  * Intuitive controls

* **Automation Capabilities**
  * Automated form completion
  * Payment method selection
  * Consent handling

* **Advanced Features**
  * Real-time status updates
  * Comprehensive debugging information
  * Robust error handling with retry logic

## 🚀 Installation

1. Download or clone the repository
```bash
git clone https://github.com/rprasai17/Auto-Deposit.git
```

2. Navigate to Chrome Extensions
   * Open Chrome and go to `chrome://extensions/`
   * Enable **"Developer mode"** in the top right corner
   * Click **"Load unpacked"** and select the extension directory

## 📁 File Structure

```
sph-chrome-extension/
├── manifest.json
├── background.js
├── content.js
├── automationScript.js
├── LICENSE
├── static/
│   ├── other assets...
└── README.md
```

## ⚙️ Configuration

Required permissions in `manifest.json`:

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

## 💡 Usage

1. Launch the extension from Chrome toolbar
2. Position the widget as desired
3. Click **"Enter Deposit"** to initiate automation
4. The automation will perform:
   * Payment button activation
   * VISA payment method selection
   * Debit option selection
   * Amount entry ($50)
   * Consent confirmation

## 🔍 Technical Details

### **Components**
* `background.js`: Extension initialization & messaging
* `content.js`: Widget management & UI handling
* `automationScript.js`: Core automation logic

### **Key Functions**

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

## 🐛 Debugging

* Built-in debug information panel
* Console logging for detailed tracking
* Real-time status updates in widget

## 💻 Browser Compatibility

* **Chrome Version:** Latest version recommended
* **System:** Synxis Control Center compatible

## 🛠️ Development

### Building from Source
1. Clone the repository
2. Implement modifications
3. Test using Chrome's "Load unpacked"
4. Package for distribution if needed

### Testing
1. Open Chrome Developer Tools
2. Monitor console outputs
3. Utilize widget debug panel

## ⚠️ Known Issues

* Synxis page compatibility required
* Complete page load necessary before automation

## 🔒 Security

* Domain-specific operation
* No data storage or transmission
* Local widget position storage only

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/YourFeature
```
3. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

* **Bugs:** Submit via GitHub issues
* **Questions:** Contact prasairupan@gmail.com

## 👏 Acknowledgments

* Designed for Synxis Control Center
* Chrome Extension Manifest V3 implementation

## 📈 Version History

* **0.0.1:** Initial Release
  * Core automation features
  * Widget interface implementation
  * Debug capabilities

## 🔮 Future Improvements

* Additional payment methods
* Customizable amount entry
* Enhanced error recovery
* Configuration options

## 📌 Notes

* Enable all required permissions
* Maintain updated Chrome version
* Test in non-production environment first

## ⚠️ Disclaimer

**Important:** This extension is not affiliated with, endorsed by, or connected to Synxis Control Center or any of its affiliated companies. Use at your own discretion and in accordance with Synxis Control Center's terms of service.

## 👤 Author

Rupan Prasai
---
