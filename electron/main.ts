import { app, BrowserWindow, screen, shell, ipcMain } from "electron"
import path from "path"
import fs from "fs"
import { initializeIpcHandlers } from "./ipcHandlers"
import { ProcessingHelper } from "./ProcessingHelper"
import { ScreenshotHelper } from "./ScreenshotHelper"
import { ShortcutsHelper } from "./shortcuts"
import { initAutoUpdater } from "./autoUpdater"
import * as dotenv from "dotenv"

// Constants
const isDev = process.env.NODE_ENV === "development"

// Application State
const state = {
  // Window management properties
  mainWindow: null as BrowserWindow | null,
  isWindowVisible: false,
  windowPosition: null as { x: number; y: number } | null,
  windowSize: null as { width: number; height: number } | null,
  screenWidth: 0,
  screenHeight: 0,
  step: 0,
  currentX: 0,
  currentY: 0,
  // For maintaining window center position
  originalWidth: 1920,
  originalHeight: 500,
  scale: 1.0,
  isZooming: false, // Added to manage zoom state

  // Application helpers
  screenshotHelper: null as ScreenshotHelper | null,
  shortcutsHelper: null as ShortcutsHelper | null,
  processingHelper: null as ProcessingHelper | null,

  // View and state management
  view: "queue" as "queue" | "solutions" | "debug",
  problemInfo: null as any,
  hasDebugged: false,

  // Processing events
  PROCESSING_EVENTS: {
    UNAUTHORIZED: "processing-unauthorized",
    NO_SCREENSHOTS: "processing-no-screenshots",
    OUT_OF_CREDITS: "out-of-credits",
    API_KEY_INVALID: "api-key-invalid",
    INITIAL_START: "initial-start",
    PROBLEM_EXTRACTED: "problem-extracted",
    SOLUTION_SUCCESS: "solution-success",
    INITIAL_SOLUTION_ERROR: "solution-error",
    DEBUG_START: "debug-start",
    DEBUG_SUCCESS: "debug-success",
    DEBUG_ERROR: "debug-error"
  } as const
}

// Add interfaces for helper classes
export interface IProcessingHelperDeps {
  getScreenshotHelper: () => ScreenshotHelper | null
  getMainWindow: () => BrowserWindow | null
  getView: () => "queue" | "solutions" | "debug"
  setView: (view: "queue" | "solutions" | "debug") => void
  getProblemInfo: () => any
  setProblemInfo: (info: any) => void
  getScreenshotQueue: () => string[]
  getExtraScreenshotQueue: () => string[]
  clearQueues: () => void
  takeScreenshot: () => Promise<string>
  getImagePreview: (filepath: string) => Promise<string>
  deleteScreenshot: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>
  setHasDebugged: (value: boolean) => void
  getHasDebugged: () => boolean
  PROCESSING_EVENTS: typeof state.PROCESSING_EVENTS
}

export interface IShortcutsHelperDeps {
  getMainWindow: () => BrowserWindow | null
  takeScreenshot: () => Promise<string>
  getImagePreview: (filepath: string) => Promise<string>
  processingHelper: ProcessingHelper | null
  clearQueues: () => void
  setView: (view: "queue" | "solutions" | "debug") => void
  isVisible: () => boolean
  toggleMainWindow: () => void
  moveWindowLeft: () => void
  moveWindowRight: () => void
  moveWindowUp: () => void
  moveWindowDown: () => void
}

export interface IIpcHandlerDeps {
  getMainWindow: () => BrowserWindow | null
  setWindowDimensions: (width: number, height: number) => void
  scaleWindow: (direction: "up" | "down" | "reset") => void
  getScreenshotQueue: () => string[]
  getExtraScreenshotQueue: () => string[]
  deleteScreenshot: (
    path: string
  ) => Promise<{ success: boolean; error?: string }>
  getImagePreview: (filepath: string) => Promise<string>
  processingHelper: ProcessingHelper | null
  PROCESSING_EVENTS: typeof state.PROCESSING_EVENTS
  takeScreenshot: () => Promise<string>
  getView: () => "queue" | "solutions" | "debug"
  toggleMainWindow: () => void
  clearQueues: () => void
  setView: (view: "queue" | "solutions" | "debug") => void
  moveWindowLeft: () => void
  moveWindowRight: () => void
  moveWindowUp: () => void
  moveWindowDown: () => void
}

// Initialize helpers
function initializeHelpers() {
  state.screenshotHelper = new ScreenshotHelper(state.view)
  state.processingHelper = new ProcessingHelper({
    getScreenshotHelper,
    getMainWindow,
    getView,
    setView,
    getProblemInfo,
    setProblemInfo,
    getScreenshotQueue,
    getExtraScreenshotQueue,
    clearQueues,
    takeScreenshot,
    getImagePreview,
    deleteScreenshot,
    setHasDebugged,
    getHasDebugged,
    PROCESSING_EVENTS: state.PROCESSING_EVENTS
  } as IProcessingHelperDeps)
  state.shortcutsHelper = new ShortcutsHelper({
    getMainWindow,
    takeScreenshot,
    getImagePreview,
    processingHelper: state.processingHelper,
    clearQueues,
    setView,
    isVisible: () => state.isWindowVisible,
    toggleMainWindow,
    moveWindowLeft: () =>
      moveWindowHorizontal((x) =>
        Math.max(-(state.windowSize?.width || 0) / 2, x - state.step)
      ),
    moveWindowRight: () =>
      moveWindowHorizontal((x) =>
        Math.min(
          state.screenWidth - (state.windowSize?.width || 0) / 2,
          x + state.step
        )
      ),
    moveWindowUp: () => moveWindowVertical((y) => y - state.step),
    moveWindowDown: () => moveWindowVertical((y) => y + state.step)
  } as IShortcutsHelperDeps)
}

// Auth callback handler

// Register the interview-coder protocol
if (process.platform === "darwin") {
  app.setAsDefaultProtocolClient("interview-coder")
} else {
  app.setAsDefaultProtocolClient("interview-coder", process.execPath, [
    path.resolve(process.argv[1] || "")
  ])
}

// Handle the protocol. In this case, we choose to show an Error Box.
if (process.defaultApp && process.argv.length >= 2) {
  app.setAsDefaultProtocolClient("interview-coder", process.execPath, [
    path.resolve(process.argv[1])
  ])
}

// Force Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on("second-instance", (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window.
    if (state.mainWindow) {
      if (state.mainWindow.isMinimized()) state.mainWindow.restore()
      state.mainWindow.focus()

      // Protocol handler removed - no longer using auth callbacks
    }
  })
}

// Auth callback removed as we no longer use Supabase authentication

// Window management functions
async function createWindow(): Promise<void> {
  if (state.mainWindow) {
    if (state.mainWindow.isMinimized()) state.mainWindow.restore()
    state.mainWindow.focus()
    return
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const workAreaSize = primaryDisplay.workAreaSize
  const workArea = primaryDisplay.workArea
  state.screenWidth = workAreaSize.width
  state.screenHeight = workAreaSize.height
  state.step = 60

  // Calculate initial window size with 16:9 aspect ratio
  const baseWidth = 1920  // Full HD width
  const baseHeight = Math.round(baseWidth / 16 * 9)  // ~1080
  
  // Scale down if needed to fit screen with 10% margin
  let scale = 1.0
  let windowWidth = baseWidth
  let windowHeight = baseHeight
  
  if (windowWidth > workAreaSize.width * 0.9) {
    scale = (workAreaSize.width * 0.9) / baseWidth
    windowWidth = Math.round(baseWidth * scale)
    windowHeight = Math.round(baseHeight * scale)
  }
  if (windowHeight > workAreaSize.height * 0.9) {
    scale = (workAreaSize.height * 0.9) / baseHeight
    windowHeight = Math.round(baseHeight * scale)
    windowWidth = Math.round(baseWidth * scale)
  }
  
  // Store initial scale
  state.scale = scale
  
  // Center the window on screen
  const centerX = Math.floor(workArea.x + (workAreaSize.width - windowWidth) / 2)
  const centerY = Math.floor(workArea.y + (workAreaSize.height - windowHeight) / 2)
  
  // Store window state
  state.windowPosition = { x: centerX, y: centerY }
  state.windowSize = { width: windowWidth, height: windowHeight }
  state.currentX = centerX
  state.currentY = centerY

  const windowSettings: Electron.BrowserWindowConstructorOptions = {
    width: windowWidth,
    height: windowHeight,
    minWidth: 300,   // Mobile minimum width
    minHeight: 533,  // Mobile minimum height (16:9 of 300)
    maxWidth: 1920,  // Your display max width
    maxHeight: 1080, // Your display max height
    x: centerX,
    y: centerY,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? path.join(__dirname, "../dist-electron/preload.js")
        : path.join(__dirname, "preload.js"),
      scrollBounce: true
    },
    show: true,
    frame: false,
    transparent: true,
    fullscreenable: false,
    hasShadow: true,
    opacity: 1.0,
    backgroundColor: "#00000000",
    focusable: true,
    skipTaskbar: true, // Hide from taskbar
    type: "panel", // Panel type for floating window behavior
    paintWhenInitiallyHidden: true,
    titleBarStyle: "hidden",
    enableLargerThanScreen: false,
    movable: true,
    resizable: true,
    roundedCorners: true
  }

  state.mainWindow = new BrowserWindow(windowSettings)
  
  // Force 16:9 aspect ratio and prevent resizing
  const resizeController = preventUnwantedResize(state.mainWindow);
  state.mainWindow.setAspectRatio(16/9)
  
  // Handle zoom commands with strict aspect ratio and bounds checking
  state.mainWindow.webContents.on('before-input-event', async (event, input) => {
    if (input.control && (input.key === '+' || input.key === '-' || input.key === '=')) {
      event.preventDefault()
      
      try {
        resizeController.startZoom()
        
        const scaleStep = 0.1
        const minScale = 0.5
        const maxScale = 2.0
        
        // Calculate new scale with bounds checking
        const currentScale = state.scale || 1.0
        let newScale = input.key === '-' 
          ? Math.max(minScale, currentScale - scaleStep)
          : Math.min(maxScale, currentScale + scaleStep)
        
        // Round to 2 decimal places to prevent floating point errors
        newScale = Math.round(newScale * 100) / 100
        
        // Get screen dimensions
        const { workArea } = screen.getPrimaryDisplay()
        
        // Determine if we should use mobile aspect ratio (9:16) for smaller sizes
        const useMobileRatio = newScale <= 0.6
        
        let newWidth, newHeight, aspectRatio
        
        if (useMobileRatio) {
          // Mobile phone aspect ratio (9:16)
          const targetMobileWidth = 400  // Base mobile width
          const targetMobileHeight = Math.round(targetMobileWidth * (16/9))  // 711
          
          newWidth = Math.round(targetMobileWidth * (newScale / 0.6))  // Scale within mobile range
          newHeight = Math.round(newWidth * (16/9))  // Maintain 9:16 ratio
          aspectRatio = 9/16
        } else {
          // Desktop aspect ratio (16:9)
          const targetWidth = 1920
          const targetHeight = 1080
          
          newWidth = Math.round(targetWidth * newScale)
          newHeight = Math.round(targetHeight * newScale)
          aspectRatio = 16/9
        }
        
        // Ensure window fits on screen with margins
        const maxWidth = Math.round(workArea.width * 0.9)
        const maxHeight = Math.round(workArea.height * 0.9)
        
        if (newWidth > maxWidth) {
          newWidth = maxWidth
          if (useMobileRatio) {
            newHeight = Math.round(maxWidth * (16/9))
          } else {
            newHeight = Math.round(maxWidth * (9/16))
          }
        }
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight
          if (useMobileRatio) {
            newWidth = Math.round(maxHeight * (9/16))
          } else {
            newWidth = Math.round(maxHeight * (16/9))
          }
        }
        
        // Ensure we don't go below minimum size
        if (useMobileRatio) {
          if (newWidth < 300) {
            newWidth = 300
            newHeight = Math.round(300 * (16/9))  // 533
          }
        } else {
          if (newWidth < 640) {
            newWidth = 640
            newHeight = 360
          }
        }
        
        // Center window on screen
        const x = Math.round(workArea.x + (workArea.width - newWidth) / 2)
        const y = Math.round(workArea.y + (workArea.height - newHeight) / 2)
        
        // Update state before resize
        state.scale = newScale
        state.windowPosition = { x, y }
        state.windowSize = { width: newWidth, height: newHeight }
        
        // Disable aspect ratio temporarily to prevent double-resizing
        state.mainWindow!.setAspectRatio(0)
        
        // Update window in one atomic operation
        await state.mainWindow!.setBounds({ x, y, width: newWidth, height: newHeight }, true)
        
        // Re-enable aspect ratio based on mode
        state.mainWindow!.setAspectRatio(aspectRatio)
        
        // Forcefully reset webContents zoom factor to prevent content scaling
        state.mainWindow!.webContents.setZoomFactor(1.0);

        const ratioText = useMobileRatio ? "9:16 mobile" : "16:9 desktop"
        console.log(`Window scaled to ${newScale}x: ${newWidth}x${newHeight} (${ratioText})`)
        
        // Send aspect ratio info to renderer for layout changes
        state.mainWindow!.webContents.send('window-aspect-changed', { 
          isMobile: useMobileRatio, 
          width: newWidth, 
          height: newHeight 
        })
      } finally {
        resizeController.endZoom()
      }
    }
  }),

  // Add more detailed logging for window events
  state.mainWindow.webContents.on("did-finish-load", () => {
    console.log("Window finished loading")
  })
  state.mainWindow.webContents.on(
    "did-fail-load",
    async (event, errorCode, errorDescription) => {
      console.error("Window failed to load:", errorCode, errorDescription)
      if (isDev) {
        // In development, retry loading after a short delay
        console.log("Retrying to load development server...")
        setTimeout(() => {
          state.mainWindow?.loadURL("http://localhost:54321").catch((error) => {
            console.error("Failed to load dev server on retry:", error)
          })
        }, 1000)
      }
    }
  )

  if (isDev) {
    // In development, load from the dev server
    console.log("Loading from development server: http://localhost:54321")
    state.mainWindow.loadURL("http://localhost:54321").catch((error) => {
      console.error("Failed to load dev server, falling back to local file:", error)
      // Fallback to local file if dev server is not available
      const indexPath = path.join(__dirname, "../dist/index.html")
      console.log("Falling back to:", indexPath)
      if (fs.existsSync(indexPath)) {
        state.mainWindow.loadFile(indexPath)
      } else {
        console.error("Could not find index.html in dist folder")
      }
    })
  } else {
    // In production, load from the built files
    const indexPath = path.join(__dirname, "../dist/index.html")
    console.log("Loading production build:", indexPath)

    if (fs.existsSync(indexPath)) {
      state.mainWindow.loadFile(indexPath)
    } else {
      console.error("Could not find index.html in dist folder")
    }
  }

  // Configure window behavior
  state.mainWindow.webContents.setZoomFactor(1)
  if (isDev) {
    state.mainWindow.webContents.openDevTools()
  }
  state.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.log("Attempting to open URL:", url)
    if (url.includes("google.com") || url.includes("supabase.co")) {
      shell.openExternal(url)
      return { action: "deny" }
    }
    return { action: "allow" }
  })

  // Enhanced screen capture resistance
  state.mainWindow.setContentProtection(true)

  state.mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  })
  state.mainWindow.setAlwaysOnTop(true, "screen-saver", 1)

  // Additional screen capture resistance settings
  if (process.platform === "darwin") {
    // Prevent window from being captured in screenshots
    state.mainWindow.setHiddenInMissionControl(true)
    state.mainWindow.setWindowButtonVisibility(false)
    state.mainWindow.setBackgroundColor("#00000000")

    // Prevent window from being included in window switcher
    state.mainWindow.setSkipTaskbar(true)

    // Disable window shadow
    state.mainWindow.setHasShadow(false)
  }

  // Prevent the window from being captured by screen recording
  state.mainWindow.webContents.setBackgroundThrottling(false)
  state.mainWindow.webContents.setFrameRate(60)

  // Set up window listeners
  state.mainWindow.on("move", handleWindowMove)
  state.mainWindow.on("resize", handleWindowResize)
  state.mainWindow.on("closed", handleWindowClosed)

  // Set up content loaded event
  state.mainWindow.webContents.on('dom-ready', () => {
    console.log("DOM is ready, window behavior initialized");
  });

  // Initialize window state
  const bounds = state.mainWindow.getBounds()
  state.windowPosition = { x: bounds.x, y: bounds.y }
  state.windowSize = { width: bounds.width, height: bounds.height }
  state.currentX = bounds.x
  state.currentY = bounds.y
  state.isWindowVisible = true

  // Set opacity based on user preferences or hide initially
  // Ensure the window is visible for the first launch or if opacity > 0.1

  // Always make sure window is shown first
  state.mainWindow.showInactive(); // Use showInactive for consistency
    console.log('Initial opacity too low, setting to 0 and hiding window');
    state.mainWindow.setOpacity(0);
    state.isWindowVisible = false;
}

function handleWindowMove(): void {
  if (!state.mainWindow) return
  const bounds = state.mainWindow.getBounds()
  state.windowPosition = { x: bounds.x, y: bounds.y }
  state.currentX = bounds.x
  state.currentY = bounds.y
}

function handleWindowResize(): void {
  if (!state.mainWindow) return
  const bounds = state.mainWindow.getBounds()
  state.windowSize = { width: bounds.width, height: bounds.height }
}

function handleWindowClosed(): void {
  state.mainWindow = null
  state.isWindowVisible = false
  state.windowPosition = null
  state.windowSize = null
}

// Window visibility functions
function hideMainWindow(): void {
  if (!state.mainWindow?.isDestroyed()) {
    // Get the current bounds
    const bounds = state.mainWindow.getBounds();

    // Save the position and size
    state.windowPosition = { x: bounds.x, y: bounds.y };
    state.windowSize = { width: bounds.width, height: bounds.height };

    console.log(`Saving window size: ${bounds.width}x${bounds.height}`);

    // Make the window ignore mouse events and forward them
    state.mainWindow.setIgnoreMouseEvents(true, { forward: true });

    // Hide the window by setting opacity to 0
    state.mainWindow.setOpacity(0);
    state.isWindowVisible = false;
    console.log('Window hidden, opacity set to 0');
  }
}

function showMainWindow(): void {
  if (!state.mainWindow?.isDestroyed()) {
    if (state.windowPosition && state.windowSize) {
      // Ensure the window size is applied correctly
      state.mainWindow.setBounds({
        x: state.windowPosition.x,
        y: state.windowPosition.y,
        width: state.windowSize.width,
        height: state.windowSize.height
      });

      console.log(`Applying window size: ${state.windowSize.width}x${state.windowSize.height}`);
    }

    // Make the window interactive for UI elements
    state.mainWindow.setIgnoreMouseEvents(false);

    state.mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
    state.mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true
    });
    state.mainWindow.setContentProtection(true);
    state.mainWindow.setOpacity(0); // Set opacity to 0 before showing
    state.mainWindow.showInactive(); // Use showInactive instead of show+focus

    // Force a repaint before showing
    state.mainWindow.webContents.invalidate();

    state.mainWindow.setOpacity(1); // Then set opacity to 1 after showing
    state.isWindowVisible = true;
    console.log('Window shown with showInactive(), opacity set to 1');
  }
}

function toggleMainWindow(): void {
  console.log(`Toggling window. Current state: ${state.isWindowVisible ? 'visible' : 'hidden'}`);
  if (state.isWindowVisible) {
    hideMainWindow();
  } else {
    showMainWindow();
  }
}

// Window movement functions
function moveWindowHorizontal(updateFn: (x: number) => number): void {
  if (!state.mainWindow) return

  // Get the actual current position from the window
  const [actualX, actualY] = state.mainWindow.getPosition()
  state.currentX = actualX
  state.currentY = actualY

  state.currentX = updateFn(state.currentX)
  state.mainWindow.setPosition(
    Math.round(state.currentX),
    Math.round(state.currentY)
  )
  console.log(`Window moved to: (${Math.round(state.currentX)}, ${Math.round(state.currentY)})`)
}

function moveWindowVertical(updateFn: (y: number) => number): void {
  if (!state.mainWindow) return

  // Get the actual current position from the window
  const [actualX, actualY] = state.mainWindow.getPosition()
  state.currentX = actualX
  state.currentY = actualY

  const newY = updateFn(state.currentY)
  // Allow window to go 2/3 off screen in either direction
  const maxUpLimit = (-(state.windowSize?.height || 0) * 2) / 3
  const maxDownLimit =
    state.screenHeight + ((state.windowSize?.height || 0) * 2) / 3

  // Log the current state and limits
  console.log({
    actualY,
    newY,
    maxUpLimit,
    maxDownLimit,
    screenHeight: state.screenHeight,
    windowHeight: state.windowSize?.height,
    currentY: state.currentY
  })

  // Only update if within bounds
  if (newY >= maxUpLimit && newY <= maxDownLimit) {
    state.currentY = newY
    state.mainWindow.setPosition(
      Math.round(state.currentX),
      Math.round(state.currentY)
    )
    console.log(`Window moved to: (${Math.round(state.currentX)}, ${Math.round(state.currentY)})`)
  }
}

// Window dimension functions
function setWindowDimensions(width: number, height: number): void {
  if (!state.mainWindow?.isDestroyed()) {
    const [currentX, currentY] = state.mainWindow.getPosition()
    const primaryDisplay = screen.getPrimaryDisplay()
    const workArea = primaryDisplay.workAreaSize
    const maxWidth = Math.floor(workArea.width * 0.5)

    // Add padding to ensure all content is visible
    const contentWidth = Math.min(width + 32, maxWidth)
    const contentHeight = Math.ceil(height + 16) // Add extra padding for height

    // Only resize, don't change position - preserve current position
    state.mainWindow.setSize(contentWidth, contentHeight)

    // Update the window size in state
    state.windowSize = {
      width: contentWidth,
      height: contentHeight
    }

    // Update state with current position to keep tracking accurate
    state.currentX = currentX
    state.currentY = currentY

    // Update screen dimensions for movement bounds
    state.screenWidth = workArea.width
    state.screenHeight = workArea.height

    console.log(`Window dimensions updated: ${contentWidth}x${contentHeight} at (${currentX}, ${currentY})`)
  }
}

// Function to block unwanted resize events
function preventUnwantedResize(window: BrowserWindow) {
  let isZooming = false;
  let lastBounds = window.getBounds();

  window.on('resize', (e: Event) => {
    if (isZooming) return;
    
    const bounds = window.getBounds();
    if (bounds.width !== lastBounds.width || bounds.height !== lastBounds.height) {
      e.preventDefault();
      window.setBounds(lastBounds);
    }
  });

  return {
    startZoom: () => { isZooming = true; },
    endZoom: () => {
      isZooming = false;
      lastBounds = window.getBounds();
    }
  };
}

// Environment setup
function loadEnvVariables() {
  if (isDev) {
    console.log("Loading env variables from:", path.join(process.cwd(), ".env"))
    dotenv.config({ path: path.join(process.cwd(), ".env") })
  } else {
    console.log(
      "Loading env variables from:",
      path.join(process.resourcesPath, ".env")
    )
    dotenv.config({ path: path.join(process.resourcesPath, ".env") })
  }
  console.log("Environment variables loaded for open-source version")
}

// Initialize application
async function initializeApp() {
  try {
    // Set custom cache directory to prevent permission issues
    const appDataPath = path.join(app.getPath('appData'), 'interview-coder-v1')
    const sessionPath = path.join(appDataPath, 'session')
    const tempPath = path.join(appDataPath, 'temp')
    const cachePath = path.join(appDataPath, 'cache')

    // Create directories if they don't exist
    for (const dir of [appDataPath, sessionPath, tempPath, cachePath]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }

    app.setPath('userData', appDataPath)
    app.setPath('sessionData', sessionPath)
    app.setPath('temp', tempPath)
    app.setPath('cache', cachePath)

    loadEnvVariables()

    initializeHelpers()
    initializeIpcHandlers({
      getMainWindow,
      setWindowDimensions,
      scaleWindow,
      getScreenshotQueue,
      getExtraScreenshotQueue,
      deleteScreenshot,
      getImagePreview,
      processingHelper: state.processingHelper,
      PROCESSING_EVENTS: state.PROCESSING_EVENTS,
      takeScreenshot,
      getView,
      toggleMainWindow,
      clearQueues,
      setView,
      moveWindowLeft: () =>
        moveWindowHorizontal((x) =>
          Math.max(-(state.windowSize?.width || 0) / 2, x - state.step)
        ),
      moveWindowRight: () =>
        moveWindowHorizontal((x) =>
          Math.min(
            state.screenWidth - (state.windowSize?.width || 0) / 2,
            x + state.step
          )
        ),
      moveWindowUp: () => moveWindowVertical((y) => y - state.step),
      moveWindowDown: () => moveWindowVertical((y) => y + state.step)
    })
    await createWindow()
    state.shortcutsHelper?.registerGlobalShortcuts()

    // Initialize auto-updater regardless of environment
    initAutoUpdater()
    console.log(
      "Auto-updater initialized in",
      isDev ? "development" : "production",
      "mode"
    )
  } catch (error) {
    console.error("Failed to initialize application:", error)
    app.quit()
  }
}

// Auth callback handling removed - no longer needed
app.on("open-url", (event, url) => {
  console.log("open-url event received:", url)
  event.preventDefault()
})

// Handle second instance (removed auth callback handling)
app.on("second-instance", (_event, commandLine) => {
  console.log("second-instance event received:", commandLine)

  // Focus or create the main window
  if (!state.mainWindow) {
    createWindow()
  } else {
    if (state.mainWindow.isMinimized()) state.mainWindow.restore()
    state.mainWindow.focus()
  }
})

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit()
      state.mainWindow = null
    }
  })
}

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// State getter/setter functions
function getMainWindow(): BrowserWindow | null {
  return state.mainWindow
}

function getView(): "queue" | "solutions" | "debug" {
  return state.view
}

function setView(view: "queue" | "solutions" | "debug"): void {
  state.view = view
  state.screenshotHelper?.setView(view)
}

function getScreenshotHelper(): ScreenshotHelper | null {
  return state.screenshotHelper
}

function getProblemInfo(): any {
  return state.problemInfo
}

function setProblemInfo(problemInfo: any): void {
  state.problemInfo = problemInfo
}

function getScreenshotQueue(): string[] {
  return state.screenshotHelper?.getScreenshotQueue() || []
}

function getExtraScreenshotQueue(): string[] {
  return state.screenshotHelper?.getExtraScreenshotQueue() || []
}

function clearQueues(): void {
  state.screenshotHelper?.clearQueues()
  state.problemInfo = null
  setView("queue")
}

async function takeScreenshot(): Promise<string> {
  if (!state.mainWindow) throw new Error("No main window available")
  return (
    state.screenshotHelper?.takeScreenshot(
      () => hideMainWindow(),
      () => showMainWindow()
    ) || ""
  )
}

async function getImagePreview(filepath: string): Promise<string> {
  return state.screenshotHelper?.getImagePreview(filepath) || ""
}

async function deleteScreenshot(
  path: string
): Promise<{ success: boolean; error?: string }> {
  return (
    state.screenshotHelper?.deleteScreenshot(path) || {
      success: false,
      error: "Screenshot helper not initialized"
    }
  )
}

function setHasDebugged(value: boolean): void {
  state.hasDebugged = value
}

function getHasDebugged(): boolean {
  return state.hasDebugged
}

// Export state and functions for other modules
export {
  state,
  createWindow,
  hideMainWindow,
  showMainWindow,
  toggleMainWindow,
  setWindowDimensions,
  moveWindowHorizontal,
  moveWindowVertical,
  getMainWindow,
  getView,
  setView,
  getScreenshotHelper,
  getProblemInfo,
  setProblemInfo,
  getScreenshotQueue,
  getExtraScreenshotQueue,
  clearQueues,
  takeScreenshot,
  getImagePreview,
  deleteScreenshot,
  setHasDebugged,
  getHasDebugged
}

app.whenReady().then(initializeApp)

// Window scaling function
function scaleWindow(direction: "up" | "down" | "reset"): void {
  if (!state.mainWindow || state.isZooming) return

  state.isZooming = true

  const primaryDisplay = screen.getPrimaryDisplay()
  const workArea = primaryDisplay.workAreaSize
  
  let newScale = state.scale
  
  switch (direction) {
    case "up":
      newScale = Math.min(state.scale + 0.1, 2.0) // Max 2x scale
      break
    case "down":
      newScale = Math.max(state.scale - 0.1, 0.3) // Min 0.3x scale
      break
    case "reset":
      newScale = 1.0
      break
  }

  // Only update if scale actually changed
  if (newScale !== state.scale) {
    state.scale = newScale
    
    // Calculate new dimensions based on scale
    const newWidth = Math.round(state.originalWidth * state.scale)
    const newHeight = Math.round(state.originalHeight * state.scale)
    
    // Ensure dimensions fit within screen bounds
    const maxWidth = Math.min(newWidth, workArea.width * 0.9)
    const maxHeight = Math.min(newHeight, workArea.height * 0.9)
    
    // Get current position and calculate new centered position
    const [currentX, currentY] = state.mainWindow.getPosition()
    const currentBounds = state.mainWindow.getBounds()
    
    // Calculate offset to keep window centered relative to its current position
    const deltaWidth = maxWidth - currentBounds.width
    const deltaHeight = maxHeight - currentBounds.height
    const newX = Math.round(currentX - deltaWidth / 2)
    const newY = Math.round(currentY - deltaHeight / 2)
    
    // Update bounds
    state.mainWindow.setBounds({
      x: newX,
      y: newY,
      width: maxWidth,
      height: maxHeight
    })
    
    // Update state
    state.windowSize = { width: maxWidth, height: maxHeight }
    state.currentX = newX
    state.currentY = newY
    
    console.log(`Window scaled to ${state.scale}x (${maxWidth}x${maxHeight})`)
  }

  // Reset zoom flag after a short delay
  setTimeout(() => {
    state.isZooming = false
  }, 100)
}