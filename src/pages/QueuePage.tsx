import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { IconFiles, IconBrain } from "@tabler/icons-react"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import QueueCommands from "../components/Queue/QueueCommands"
import { useToast } from "../contexts/toast"
import { Screenshot } from "../types/screenshots"

async function fetchScreenshots(): Promise<Screenshot[]> {
  try {
    const result = await window.electronAPI.getScreenshots()
    if (result.success && result.previews) {
      return result.previews.map(preview => ({
        path: preview.path,
        preview: preview.preview,
        id: preview.path,
        timestamp: Date.now(),
        name: preview.path.split('\\').pop() || preview.path.split('/').pop() || 'Screenshot'
      }))
    }
    return []
  } catch (error) {
    console.error("Error loading screenshots:", error)
    throw error
  }
}

interface QueuePageProps {
  isMobileView: boolean
  setView?: (view: "queue" | "solutions" | "debug") => void
  credits?: number
  currentLanguage: string
  setLanguage: (language: string) => void
}

export const QueuePage: React.FC<QueuePageProps> = ({
  isMobileView,
  setView = () => {},
  credits = 999,
  currentLanguage,
  setLanguage
}) => {
  const { showToast } = useToast()
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const {
    data: screenshots = [],
    isLoading,
    refetch
  } = useQuery<Screenshot[]>({
    queryKey: ["screenshots"],
    queryFn: fetchScreenshots,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false
  })
  const handleDeleteScreenshot = async (index: number) => {
    try {
      if (screenshots && screenshots[index]) {
        const imagePath = screenshots[index].path;
        const result = await window.electronAPI.deleteScreenshot(imagePath)
        if (result.success) {
          showToast("Success", "Screenshot deleted successfully", "success")
          refetch()
        } else {
          showToast("Error", result.error || "Failed to delete screenshot", "error")
        }
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error)
      showToast("Error", "Failed to delete screenshot", "error")
    }
  }

  const handleTooltipVisibilityChange = (visible: boolean, height = 0) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-2">
          <IconFiles className="w-6 h-6 text-orange-400" />
          <span className="text-lg font-medium text-gray-200">Screenshot Queue</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Credits: <span className="text-green-400 font-medium">{credits}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-gray-400 text-sm">Ready</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Screenshot Queue */}
        <div className="flex-1 mb-4">
          <ScreenshotQueue
            screenshots={screenshots}
            onDeleteScreenshot={handleDeleteScreenshot}
            isLoading={isLoading}
          />
        </div>        {/* Queue Commands */}
        <QueueCommands
          onTooltipVisibilityChange={handleTooltipVisibilityChange}
          screenshotCount={screenshots.length}
          credits={credits}
          currentLanguage={currentLanguage}
          setLanguage={setLanguage}
        />
      </div>

      {/* Instructions */}
      <div className="flex-shrink-0 mt-4 p-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
        <div className="flex items-start gap-3">
          <IconBrain className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-2">How to use the Queue</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+H</kbd> to capture code screenshots</p>
              <p>• Screenshots will appear in the queue above</p>
              <p>• Select your programming language and click "Generate Solution" to analyze</p>
              <p>• Use the delete button to remove unwanted screenshots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
