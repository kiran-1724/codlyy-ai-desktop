# Codlyy AI Desktop

Professional Electron desktop application with auto-update functionality and system tray support.

## 📁 Project Structure

```
codlyy-ai-desktop/
├── src/
│   ├── main/                    # Main Process (Node.js)
│   │   ├── main.js             # Application entry point
│   │   ├── ipc.js              # IPC handlers
│   │   ├── tray.js             # System tray functionality
│   │   └── updater.js          # Auto-updater logic
│   │
│   ├── preload/                 # Preload Scripts
│   │   └── preload.js          # Secure bridge between main & renderer
│   │
│   ├── renderer/                # Renderer Process (Browser)
│   │   ├── index.html          # Main HTML file
│   │   ├── css/
│   │   │   └── styles.css      # Application styles
│   │   └── js/
│   │       ├── app.js          # Main app logic
│   │       └── modal.js        # Modal management
│   │
│   └── assets/                  # Static Assets
│       ├── icon.ico            # Windows icon
│       ├── icon.png            # PNG icon
│       └── icon.svg            # SVG icon
│
├── dist/                        # Build output (gitignored)
├── node_modules/                # Dependencies (gitignored)
├── package.json                 # Project configuration
├── package-lock.json           # Dependency lock file
└── .gitignore                  # Git ignore rules
```

## 🚀 Features

- ✨ **Auto-Update System** - Beautiful liquid animation during updates
- 🎨 **System Tray** - Minimize to tray, quick access menu
- 📊 **Version Display** - Dynamic version info in header
- 📝 **What's New Modal** - Release notes and changelog
- 🔒 **Secure IPC** - Context isolation with preload scripts
- 🏗️ **Modular Architecture** - Clean separation of concerns

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
npm install
```

### Run Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Publish to GitHub
```bash
npm run build -- --publish always
```

## 📦 Build Configuration

The app uses `electron-builder` for packaging. Configuration is in `package.json`:

- **App ID**: `com.codlyy.desktop`
- **Product Name**: Codlyy AI
- **Auto-update**: GitHub Releases
- **Code Signing**: Disabled (set `forceCodeSigning: true` for production)

## 🔐 Environment Variables

Create a `.env` file for local development:

```env
GH_TOKEN=your_github_token_here
```

**Note**: `.env` is gitignored for security.

## 🎯 Architecture Decisions

### Why This Structure?

1. **Separation of Concerns**
   - Main process handles system-level operations
   - Renderer process handles UI
   - Preload acts as secure bridge

2. **Modularity**
   - Each feature in its own file
   - Easy to test and maintain
   - Clear dependencies

3. **Security**
   - Context isolation enabled
   - No node integration in renderer
   - Controlled IPC communication

### Ping/Pong Explanation

The `ping` function in `preload.js` and `ipc.js` is used for:
- **Connection Testing**: Verify IPC communication works
- **Health Checks**: Ensure main process is responsive
- **Development**: Quick way to test the bridge

Example usage:
```javascript
const result = await window.codlyy.ping();
console.log(result); // "pong"
```

## 📝 Scripts

- `npm start` - Start development server
- `npm run build` - Build production app
- `npm test` - Run tests (not implemented yet)

## 🤝 Contributing

1. Follow the existing structure
2. Keep files focused and small
3. Document complex logic
4. Test before committing

## 📄 License

ISC

---

**Made with ❤️ by Codlyy Team**
