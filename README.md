# 🤖 Jiminy – The Second Conscience

<div align="center">
  <img src="https://img.shields.io/badge/Built_with-Electron-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
</div>

A powerful desktop application designed to assist developers with technical coding interviews and problem-solving. Features screenshot-based problem analysis, AI-powered solution generation, and real-time speech-to-text capabilities.

---

## ✨ Features

### 🖼️ Screenshot-Based Problem Analysis
- **Smart Screenshot Capture**: Instantly capture coding problems with global hotkeys
- **Multi-Language Support**: Support for Python, JavaScript, Java, Go, C++, Swift, Kotlin, Ruby, SQL, and R
- **Problem Extraction**: AI-powered extraction of problem statements, constraints, and requirements from screenshots

### 🧠 AI-Powered Solution Generation
- **Intelligent Code Generation**: Generate optimized solutions based on problem analysis
- **Time & Space Complexity Analysis**: Detailed algorithmic complexity breakdowns
- **Multiple Solution Approaches**: Explore different algorithmic strategies
- **Step-by-Step Explanations**: Clear reasoning for each solution approach

### 🎤 Real-Time Speech-to-Text (STT)
- **Live Transcription**: Real-time speech recognition for hands-free interaction
- **Voice Activity Detection**: Smart detection of speech vs. silence
- **WebSocket Integration**: Low-latency audio streaming and processing
- **Session Management**: Persistent transcription sessions with unique identifiers

### 🎯 Developer Experience
- **Floating Window**: Unobtrusive overlay that stays accessible while coding
- **Click-Through Transparency**: Interact with applications behind the window
- **Global Keyboard Shortcuts**: Quick access without context switching
- **Auto-Updates**: Seamless application updates with user notifications

### 🔄 Workflow Integration
- **Queue Management**: Organize and process multiple screenshots
- **Debug Mode**: Advanced analysis and debugging assistance
- **Solution History**: Track and review previous solutions
- **Export Capabilities**: Copy code and explanations to clipboard

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gamidirohan/Code-Assist-Electron-Frontend.git
   cd Code-Assist-Electron-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Build for production**
   ```bash
   npm run build
   # or
   yarn build
   ```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl/Cmd + B` | Toggle Window | Show/hide the application window |
| `Ctrl/Cmd + H` | Take Screenshot | Capture a screenshot of the current problem |
| `Ctrl/Cmd + Enter` | Process/Solve | Generate solution from captured screenshots |
| `Ctrl/Cmd + Q` | Quit Application | Close the application |
| `Arrow Keys + Ctrl/Cmd` | Move Window | Reposition the application window |

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop Shell**: Electron with Node.js backend
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives
- **Audio Processing**: Web Audio API with WebSocket streaming
- **Build Tools**: Vite, electron-builder

### Project Structure
```
├── electron/                 # Electron main process
│   ├── main.ts              # Application entry point
│   ├── preload.ts           # Preload scripts
│   ├── ProcessingHelper.ts  # Screenshot processing logic
│   └── autoUpdater.ts       # Auto-update functionality
├── src/                     # React application
│   ├── components/          # Reusable UI components
│   ├── pages/               # Application pages/views
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
└── dist-electron/           # Compiled Electron files
```

---

## 🔧 Configuration

### Environment Setup
The application includes sensible defaults and doesn't require extensive configuration for basic usage.

### API Integration
> **Note**: This version includes mock API endpoints. For full functionality, you'll need to implement your own backend service or integrate with existing AI services.

### Real-Time Speech-to-Text Setup
The STT feature connects to a WebSocket server at `ws://localhost:3000/ws/jiminy/`. To enable this feature:

1. Set up a compatible WebSocket server
2. Ensure proper audio permissions in your browser/system
3. Configure the WebSocket URL in `src/hooks/useRealtimeSTT.ts`

---

## 🎯 Usage Guide

### Taking Screenshots
1. Position your coding problem on screen
2. Press `Ctrl/Cmd + H` to capture
3. The screenshot will appear in the queue

### Generating Solutions
1. Ensure you have at least one screenshot captured
2. Select your preferred programming language
3. Press `Ctrl/Cmd + Enter` to process
4. View the generated solution with complexity analysis

### Using Speech-to-Text
1. Click the microphone icon (when available)
2. Start speaking your query or problem description
3. The application will transcribe in real-time
4. Use voice commands for hands-free operation

### Debug Mode
Access advanced debugging and analysis features:
- Multiple solution approaches
- Detailed step-by-step breakdowns
- Error analysis and suggestions
- Performance optimization tips

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting
- Add tests for new features
- Update documentation as needed

---

## 📋 Features Roadmap

### Current Features ✅
- Screenshot capture and processing
- Multi-language code generation
- Real-time speech-to-text
- Floating window interface
- Auto-updates

### Planned Features 🚧
- IDE integration plugins
- Team collaboration features
- Custom AI model integration
- Advanced debugging tools
- Mobile companion app

---

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Ensure Node.js v16+ is installed
- Clear `node_modules` and reinstall dependencies
- Check for port conflicts (default: 3000)

**Screenshots not working**
- Verify screen capture permissions
- Check if other screenshot tools are interfering
- Restart the application

**Speech-to-text not responding**
- Ensure microphone permissions are granted
- Check WebSocket server connection
- Verify audio input device is working

### Getting Help
- 📖 Check the [Wiki](../../wiki) for detailed guides
- 🐛 Report bugs in [Issues](../../issues)
- 💬 Join our [Discussions](../../discussions) for questions

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Speech processing powered by Web Audio API
- Icons from [Lucide React](https://lucide.dev/)

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/gamidirohan/Code-Assist-Electron-Frontend?style=social)
![GitHub forks](https://img.shields.io/github/forks/gamidirohan/Code-Assist-Electron-Frontend?style=social)
![GitHub issues](https://img.shields.io/github/issues/gamidirohan/Code-Assist-Electron-Frontend)
![GitHub pull requests](https://img.shields.io/github/issues-pr/gamidirohan/Code-Assist-Electron-Frontend)

<div align="center">
  <p>Made with ❤️ for developers, by developers</p>
  <p><strong>Star ⭐ this repository if you find it helpful!</strong></p>
</div>
