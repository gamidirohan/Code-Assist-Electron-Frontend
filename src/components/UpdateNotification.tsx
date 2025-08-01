import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { useToast } from "../contexts/toast"

export const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    console.log("UpdateNotification: Setting up event listeners")

    let unsubscribeAvailable = () => {}
    let unsubscribeDownloaded = () => {}

    try {
      if (window.electronAPI.onUpdateAvailable) {
        unsubscribeAvailable = window.electronAPI.onUpdateAvailable(
          (info) => {
            console.log("UpdateNotification: Update available received", info)
            setUpdateAvailable(true)
          }
        )
      }

      if (window.electronAPI.onUpdateDownloaded) {
        unsubscribeDownloaded = window.electronAPI.onUpdateDownloaded(
          (info) => {
            console.log("UpdateNotification: Update downloaded received", info)
            setUpdateDownloaded(true)
            setIsDownloading(false)
          }
        )
      }
    } catch (error) {
      console.error("Error setting up update listeners:", error)
    }

    return () => {
      console.log("UpdateNotification: Cleaning up event listeners")
      try {
        unsubscribeAvailable()
        unsubscribeDownloaded()
      } catch (error) {
        console.error("Error cleaning up update listeners:", error)
      }
    }
  }, [])

  const handleStartUpdate = async () => {
    console.log("UpdateNotification: Starting update download")
    setIsDownloading(true)
    try {
      const result = await window.electronAPI.startUpdate()
      console.log("UpdateNotification: Update download result", result)
      if (!result.success) {
        setIsDownloading(false)
        showToast("Error", "Failed to download update", "error")
      }
    } catch (error) {
      console.error("Error starting update:", error)
      setIsDownloading(false)
      showToast("Error", "Failed to download update", "error")
    }
  }

  const handleInstallUpdate = () => {
    console.log("UpdateNotification: Installing update")
    try {
      window.electronAPI.installUpdate()
    } catch (error) {
      console.error("Error installing update:", error)
      showToast("Error", "Failed to install update", "error")
    }
  }

  console.log("UpdateNotification: Render state", {
    updateAvailable,
    updateDownloaded,
    isDownloading
  })
  if (!updateAvailable && !updateDownloaded) return null

  return (
    <Dialog open={true}>
      <DialogContent
        className="bg-black/90 text-white border-white/20"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-lg font-semibold">
          {updateDownloaded
            ? "Update Ready to Install"
            : "A New Version is Available"}
        </DialogTitle>
        <DialogDescription className="text-sm text-white/70 mb-6">
          {updateDownloaded
            ? "The update has been downloaded and will be installed when you restart the app."
            : "A new version of Jiminy – The Second Conscience is available. Please update to continue using the app."}
        </DialogDescription>
        <div className="flex justify-end gap-2">
          {updateDownloaded ? (
            <Button
              variant="outline"
              onClick={handleInstallUpdate}
              className="border-white/20 hover:bg-white/10"
            >
              Restart and Install
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleStartUpdate}
              disabled={isDownloading}
              className="border-white/20 hover:bg-white/10"
            >
              {isDownloading ? "Downloading..." : "Download Update"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
