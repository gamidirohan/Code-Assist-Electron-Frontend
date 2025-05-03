# Interview Coder

Interview Coder is a desktop application designed to help users with technical coding interviews. It allows users to take screenshots of coding problems, process them using AI, and get solutions.


## Features

- Take screenshots of coding problems
- Process screenshots to extract problem statements
- Generate solutions in your preferred programming language
- View time and space complexity analysis
- Toggle window visibility with keyboard shortcuts
- Move the window around the screen with keyboard shortcuts

## Keyboard Shortcuts

- **Cmd/Ctrl + B**: Toggle window visibility
- **Cmd/Ctrl + Q**: Quit the application
- **Cmd/Ctrl + H**: Take a screenshot
- **Cmd/Ctrl + Enter**: Process screenshots
- **Arrow keys with Cmd/Ctrl**: Move window around the screen

## Running the Application

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/gamidirohan/Code-Assist-Electron-Frontend.git
   cd interview-coder
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Run the application in development mode:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Build the application for production:
   ```
   npm run build
   # or
   yarn build
   ```

## API Integration

This version of the application still requires an API connection to process screenshots and generate solutions. You'll need to set up your own API service or modify the code to use a different solution generation method.

## Improvements Over Original Version

This enhanced version of Interview Coder includes several improvements over the original application:

### UI/UX Enhancements
- **Hidden Scrollbars**: Scrollable content areas now have invisible scrollbars for a cleaner interface while maintaining full scrolling functionality
- **Click-Through Transparency**: Transparent areas of the window now allow mouse events to pass through to applications behind it, making it less intrusive
- **Improved Interaction**: The application only captures mouse events on actual UI elements, allowing you to interact with other applications in the background

### Technical Improvements
- **Better Resource Management**: Optimized memory usage and reduced CPU load during idle periods
- **Enhanced Stability**: Fixed several edge cases that could cause crashes in the original application
- **Improved Responsiveness**: Faster UI updates and smoother animations

### Additional Features
- **Keyboard Navigation**: Enhanced keyboard shortcuts for better accessibility
- **Customizable Appearance**: More control over the application's appearance and behavior
- **Cross-Platform Compatibility**: Better support across different operating systems

## Disclaimer

This modified version is for educational purposes only. The original Interview Coder application is a commercial product with subscription requirements.

## License

This project is licensed under the ISC License.
