import React, { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { IconBulb, IconBrain, IconCode } from "@tabler/icons-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import { ProblemStatementData } from "../types/solutions"
import { Screenshot } from "../types/screenshots"
import SolutionCommands from "../components/Solutions/SolutionCommands"
import { useToast } from "../contexts/toast"
import { CopyButton } from "../components/ui/copy-button"

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

interface SolutionsPageProps {
  isMobileView: boolean
  setView?: (view: "queue" | "solutions" | "debug") => void
  credits?: number
  currentLanguage: string
  setLanguage: (language: string) => void
}

export const SolutionsPage: React.FC<SolutionsPageProps> = ({
  isMobileView,
  setView = () => {},
  credits = 999,
  currentLanguage,
  setLanguage
}) => {
  const { showToast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)
  
  const [debugProcessing, setDebugProcessing] = useState(false)
  const [problemStatementData, setProblemStatementData] = useState<ProblemStatementData | null>(null)
  const [solutionData, setSolutionData] = useState<string | null>(null)
  const [thoughtsData, setThoughtsData] = useState<string | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(null)
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(null)
  const [timeComplexityExplanation, setTimeComplexityExplanation] = useState<string | null>(null)
  const [spaceComplexityExplanation, setSpaceComplexityExplanation] = useState<string | null>(null)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)

  const {
    data: screenshots = [],
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
      const imagePath = screenshots[index].path
      const result = await window.electronAPI.deleteScreenshot(imagePath)
      if (result.success) {
        showToast("Success", "Screenshot deleted successfully", "success")
        refetch()
      } else {
        showToast("Error", result.error || "Failed to delete screenshot", "error")
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
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-2">
          <IconBulb className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-medium text-gray-200">AI Solutions</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Credits: <span className="text-green-400 font-medium">{credits}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-gray-400 text-sm">Processing</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Screenshot Queue */}
        <div className="mb-4">
          <ScreenshotQueue
            screenshots={screenshots}
            onDeleteScreenshot={handleDeleteScreenshot}
            isLoading={false}
          />
        </div>

        {/* Solution Commands */}
        <SolutionCommands
          screenshots={screenshots}
          onTooltipVisibilityChange={handleTooltipVisibilityChange}
          isProcessing={debugProcessing}
          extraScreenshots={screenshots}
          credits={credits}
          currentLanguage={currentLanguage}
          setLanguage={setLanguage}
        />

        {/* Solutions Content */}
        <div className="flex-1 overflow-y-auto mt-4 bg-gray-800/40 rounded-lg border border-gray-700/50">
          <div className="p-6 space-y-6">
            {/* Problem Statement Section */}
            {problemStatementData && (
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-lg font-medium text-blue-200 mb-3 flex items-center gap-2">
                  <IconBrain className="w-5 h-5" />
                  Problem Statement
                </h3>                <div className="text-gray-300 text-sm leading-relaxed">
                  {problemStatementData.problem_statement}
                </div>
              </div>
            )}

            {/* Solution Section */}
            {solutionData && (
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-lg font-medium text-green-200 mb-3 flex items-center gap-2">
                  <IconCode className="w-5 h-5" />
                  Optimized Solution
                </h3>
                <div className="relative">
                  <CopyButton text={solutionData} />
                  <SyntaxHighlighter
                    showLineNumbers
                    language={currentLanguage === "golang" ? "go" : currentLanguage}
                    style={dracula}
                    customStyle={{
                      maxWidth: "100%",
                      margin: 0,
                      padding: "1rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      backgroundColor: "rgba(22, 27, 34, 0.5)",
                      fontSize: "12px",
                      lineHeight: "1.4"
                    }}
                    wrapLongLines={true}
                  >
                    {solutionData}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}

            {/* Thoughts Section */}
            {thoughtsData && (
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-lg font-medium text-purple-200 mb-3">
                  Algorithm Approach
                </h3>
                <div className="text-gray-300 text-sm leading-relaxed">
                  {thoughtsData}
                </div>
              </div>
            )}

            {/* Complexity Analysis */}
            {(timeComplexityData || spaceComplexityData) && (
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                <h3 className="text-lg font-medium text-orange-200 mb-3">
                  Complexity Analysis
                </h3>
                <div className="space-y-3">
                  {timeComplexityData && (
                    <div>
                      <span className="text-yellow-400 font-medium">Time Complexity:</span>
                      <span className="text-gray-300 ml-2">{timeComplexityData}</span>
                      {timeComplexityExplanation && (
                        <p className="text-gray-400 text-sm mt-1 ml-4">
                          {timeComplexityExplanation}
                        </p>
                      )}
                    </div>
                  )}
                  {spaceComplexityData && (
                    <div>
                      <span className="text-blue-400 font-medium">Space Complexity:</span>
                      <span className="text-gray-300 ml-2">{spaceComplexityData}</span>
                      {spaceComplexityExplanation && (
                        <p className="text-gray-400 text-sm mt-1 ml-4">
                          {spaceComplexityExplanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!problemStatementData && !solutionData && !thoughtsData && (
              <div className="flex flex-col items-center justify-center py-12">
                <IconBulb className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Solutions Yet</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Capture some code screenshots and generate a solution to see AI-powered analysis and optimization suggestions here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
