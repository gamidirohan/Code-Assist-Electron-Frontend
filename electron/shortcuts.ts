import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps
  private lastScaleTime = 0
  private scaleDebounceMs = 150 // Prevent scaling faster than every 150ms
  private windowSpecificShortcutsRegistered = false

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  private adjustOpacity(delta: number): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    let currentOpacity = mainWindow.getOpacity();
    let newOpacity = Math.max(0.3, Math.min(1.0, currentOpacity + delta)); // Increased minimum from 0.1 to 0.3
    console.log(`Adjusting opacity from ${currentOpacity} to ${newOpacity}`);
    
    // Add warning for low opacity
    if (newOpacity <= 0.5) {
      console.warn(`⚠️  Window opacity is getting low (${newOpacity.toFixed(1)}). Use Ctrl+] to restore full opacity.`);
    }
    
    mainWindow.setOpacity(newOpacity);

    // If we're making the window visible, also make sure it's shown and interaction is enabled
    // Only show the window if it was fully transparent and is now becoming visible
    if (currentOpacity <= 0.1 && newOpacity > 0.1 && !this.deps.isVisible()) {
      this.deps.toggleMainWindow();
    }
  }

  private setFullOpacity(): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    const startOpacity = mainWindow.getOpacity();
    console.log(`Setting full opacity from ${startOpacity} to 1.0 step by step`);
    
    // First ensure the window is visible and interaction is enabled
    if (!this.deps.isVisible()) {
      this.deps.toggleMainWindow();
      // After toggling, we need to wait a bit for the window to become visible
      setTimeout(() => this.animateOpacity(), 200);
      return; // Exit early as the toggleMainWindow already handles visibility
    }
    
    // If already visible, start the animation directly
    this.animateOpacity();
  }
  
  private animateOpacity(): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    // Make sure mouse events are enabled as we're making the window visible
    mainWindow.setIgnoreMouseEvents(false);
    
    // Get the current opacity as our starting point
    let currentOpacity = mainWindow.getOpacity();
    const targetOpacity = 1.0;
    const step = 0.1;
    const interval = 50; // milliseconds between steps
    
    console.log(`Starting opacity animation from ${currentOpacity} to ${targetOpacity}`);
    
    const opacityInterval = setInterval(() => {
      currentOpacity = Math.min(targetOpacity, currentOpacity + step);
      mainWindow.setOpacity(currentOpacity);
      console.log(`Opacity step: ${currentOpacity.toFixed(1)}`);
      
      if (currentOpacity >= targetOpacity) {
        clearInterval(opacityInterval);
        console.log('Full opacity reached (1.0)');
      }
    }, interval);
  }

  private lastScaleDirection: "up" | "down" | "reset" | null = null;

  private debouncedScale(direction: "up" | "down" | "reset"): void {
    const now = Date.now()
    if (now - this.lastScaleTime < this.scaleDebounceMs) {
      console.log(`Scale debounced (${now - this.lastScaleTime}ms since last)`)
      return
    }
    this.lastScaleTime = now
    this.lastScaleDirection = direction
    
    const mainWindow = this.deps.getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send("scale-window", { direction })
    }
  }

  public registerGlobalShortcuts(): void {
    // Always register the toggle shortcut - this should work regardless of window state
    globalShortcut.register("CommandOrControl+B", () => {
      console.log("Command/Ctrl + B pressed. Toggling window visibility.")
      const wasVisible = this.deps.isVisible()
      this.deps.toggleMainWindow()
      
      // Register or unregister window-specific shortcuts based on new state
      if (!wasVisible) {
        // Window was hidden, now showing - register shortcuts and focus window
        this.registerWindowSpecificShortcuts()
        this.focusWindow()
      } else {
        // Window was visible, now hiding - unregister shortcuts
        this.unregisterWindowSpecificShortcuts()
      }
    })

    // Always register the quit shortcut
    globalShortcut.register("CommandOrControl+Q", () => {
      console.log("Command/Ctrl + Q pressed. Quitting application.")
      app.quit()
    })
    
    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }

  private focusWindow(): void {
    setTimeout(() => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.focus()
        console.log('Window focused after toggle')
      }
    }, 100) // Small delay to ensure window is fully shown
  }

  public registerWindowSpecificShortcuts(): void {
    if (this.windowSpecificShortcutsRegistered) {
      console.log('Window-specific shortcuts already registered')
      return
    }

    console.log('Registering window-specific shortcuts...')
    
    globalShortcut.register("CommandOrControl+H", async () => {
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        console.log("Taking screenshot...")
        try {
          const screenshotPath = await this.deps.takeScreenshot()
          console.log("Screenshot saved to:", screenshotPath)
          
          const preview = await this.deps.getImagePreview(screenshotPath)
          console.log("Preview generated, length:", preview ? preview.length : 0)
          
          const eventData = {
            path: screenshotPath,
            preview
          }
          console.log("Sending screenshot-taken event to renderer")
          mainWindow.webContents.send("screenshot-taken", eventData)
          console.log("screenshot-taken event sent successfully")
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    globalShortcut.register("CommandOrControl+Enter", async () => {
      await this.deps.processingHelper?.processScreenshots()
    })

    globalShortcut.register("CommandOrControl+R", () => {
      console.log(
        "Command + R pressed. Canceling requests and resetting queues..."
      )

      // Cancel ongoing API requests
      this.deps.processingHelper?.cancelOngoingRequests()

      // Clear both screenshot queues
      this.deps.clearQueues()

      console.log("Cleared queues.")

      // Update the view state to 'queue'
      this.deps.setView("queue")

      // Notify renderer process to switch view to 'queue'
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("reset-view")
        mainWindow.webContents.send("reset")
      }
    })

    // Window movement shortcuts
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.deps.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.deps.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.deps.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.deps.moveWindowUp()
    })

    // Adjust opacity shortcuts
    globalShortcut.register("CommandOrControl+[", () => {
      console.log("Command/Ctrl + [ pressed. Decreasing opacity.")
      this.adjustOpacity(-0.1)
    })

    globalShortcut.register("CommandOrControl+]", () => {
      console.log("Command/Ctrl + ] pressed. Setting to full opacity.")
      this.setFullOpacity()
    })
    
    // Scale controls (resize the entire window, not zoom content)
    globalShortcut.register("CommandOrControl+-", () => {
      console.log("Command/Ctrl + - pressed. Scaling window down.")
      this.debouncedScale("down")
    })
    
    globalShortcut.register("CommandOrControl+0", () => {
      console.log("Command/Ctrl + 0 pressed. Resetting window scale.")
      this.debouncedScale("reset")
    })
    
    globalShortcut.register("CommandOrControl+=", () => {
      console.log("Command/Ctrl + = pressed. Scaling window up.")
      this.debouncedScale("up")
    })
    
    // Delete last screenshot shortcut
    globalShortcut.register("CommandOrControl+L", () => {
      console.log("Command/Ctrl + L pressed. Deleting last screenshot.")
      const mainWindow = this.deps.getMainWindow()
      if (mainWindow) {
        // Send an event to the renderer to delete the last screenshot
        mainWindow.webContents.send("delete-last-screenshot")
      }
    })

    this.windowSpecificShortcutsRegistered = true
    console.log('Window-specific shortcuts registered successfully')
  }

  public unregisterWindowSpecificShortcuts(): void {
    if (!this.windowSpecificShortcutsRegistered) {
      console.log('Window-specific shortcuts already unregistered')
      return
    }

    console.log('Unregistering window-specific shortcuts...')
    
    // Unregister all window-specific shortcuts while keeping B and Q
    const shortcutsToUnregister = [
      "CommandOrControl+H",
      "CommandOrControl+Enter", 
      "CommandOrControl+R",
      "CommandOrControl+Left",
      "CommandOrControl+Right",
      "CommandOrControl+Down", 
      "CommandOrControl+Up",
      "CommandOrControl+[",
      "CommandOrControl+]",
      "CommandOrControl+-",
      "CommandOrControl+0",
      "CommandOrControl+=",
      "CommandOrControl+L"
    ]

    shortcutsToUnregister.forEach(shortcut => {
      try {
        globalShortcut.unregister(shortcut)
      } catch (error) {
        console.error(`Error unregistering shortcut ${shortcut}:`, error)
      }
    })

    this.windowSpecificShortcutsRegistered = false
    console.log('Window-specific shortcuts unregistered successfully')
  }
}