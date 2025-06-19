import { useEffect, useRef, useState } from "react"
import { 
  ChatPage, 
  HomePage, 
  CodePage, 
  QueuePage, 
  SolutionsPage, 
  MessagesPage, 
  BrainPage 
} from "./pages"
import { ProblemStatementData } from "./types/solutions"
import { IconBulb, IconBrain, IconCode, IconMessage } from "@tabler/icons-react"
import { NavigationBar } from "./components/Navigation/NavigationBar"

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState<string>('home')
  
  // Screenshot queue state (only used in code mode)
  const [screenshotQueue, setScreenshotQueue] = useState<Array<{path: string, preview: string}>>([])
  const [chatInput, setChatInput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  
  // Conversation history
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'ai' | 'processing'
    content: string
    screenshots?: Array<{path: string, preview: string}>
    timestamp: number
    solutionData?: any
  }>>([])
  
  // Solution display state (for structured response handling)
  const [problemStatementData, setProblemStatementData] = useState<ProblemStatementData | null>(null)
  const [solutionData, setSolutionData] = useState<string | null>(null)
  const [thoughtsData, setThoughtsData] = useState<string | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(null)
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(null)
  const [timeComplexityExplanation, setTimeComplexityExplanation] = useState<string | null>(null)
  const [spaceComplexityExplanation, setSpaceComplexityExplanation] = useState<string | null>(null)
  const [isProcessingSolution, setIsProcessingSolution] = useState(false)
  const [processingStage, setProcessingStage] = useState<string>('')

  // Initialize global window properties for electron compatibility
  useEffect(() => {
    // Type assertion to bypass TypeScript error
    ;(window as any).__IS_INITIALIZED__ = true
    ;(window as any).__LANGUAGE__ = selectedLanguage
    ;(window as any).__CREDITS__ = 999
  }, [selectedLanguage])

  // Navigation handler
  const handleNavigate = (page: string) => {
    console.log('[DEBUG] Navigating to:', page)
    setCurrentPage(page)
    
    // Clear screenshot queue when leaving code page
    if (page !== 'code') {
      setScreenshotQueue([])
    }
    
    // Prevent dimension updates for a short period after navigation
    ;(window as any).__lastScaleTime = Date.now()
  }

  // Listen for aspect ratio changes from main process
  useEffect(() => {
    const handleAspectChange = (data: { isMobile: boolean, width: number, height: number }) => {
      setIsMobileView(data.isMobile)
    }

    if (window.electronAPI?.onWindowAspectChanged) {
      window.electronAPI.onWindowAspectChanged(handleAspectChange)
    }
    
    return () => {
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('window-aspect-changed')
      }
    }
  }, [])

  // Listen for scale window events from main process
  useEffect(() => {
    const handleScaleWindow = (data: { direction: "up" | "down" | "reset" }) => {
      console.log('Scale window event received:', data.direction)
      // Mark that a scale operation just happened
      ;(window as any).__lastScaleTime = Date.now()
      // The actual scaling is handled by the main process
      // This is just for any UI feedback we might want to add
    }

    // Add event listener if it exists
    if (window.electronAPI?.onScaleWindow) {
      const removeListener = window.electronAPI.onScaleWindow(handleScaleWindow)
      return removeListener
    }
  }, [])

  // Dynamic window sizing with constraints
  useEffect(() => {
    if (!containerRef.current) return

    let resizeObserver: ResizeObserver | null = null
    let isWindowFocused = true // Track focus state

    const updateDimensions = () => {
      if (!containerRef.current || !isWindowFocused) return // Only update when focused
      
      // Check if we're in manual scaling mode - if so, don't override
      const now = Date.now()
      const lastScaleTime = (window as any).__lastScaleTime || 0
      const isRecentlyScaled = (now - lastScaleTime) < 2000 // 2 seconds
      
      if (isRecentlyScaled) {
        console.log('Skipping dimension update - recent manual scaling detected')
        return
      }
      
      const height = Math.max(400, Math.min(containerRef.current.scrollHeight, 1000)) 
      const width = Math.max(600, Math.min(containerRef.current.scrollWidth, 1400))
      
      console.log(`[DEBUG] Updating dimensions: ${width}x${height}`)
      
      if (window.electronAPI?.updateContentDimensions) {
        window.electronAPI.updateContentDimensions({ width, height })
      }
    }

    const enableResizeObserver = () => {
      if (!containerRef.current || resizeObserver) return
      
      resizeObserver = new ResizeObserver(() => {
        // Debounce the dimension updates
        clearTimeout((window as any).__dimensionUpdateTimeout)
        ;(window as any).__dimensionUpdateTimeout = setTimeout(updateDimensions, 100)
      })
      
      resizeObserver.observe(containerRef.current)
    }

    const disableResizeObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
        clearTimeout((window as any).__dimensionUpdateTimeout)
      }
    }

    // Focus/blur event handlers
    const handleFocus = () => {
      isWindowFocused = true
      enableResizeObserver()
    }

    const handleBlur = () => {
      isWindowFocused = false
      disableResizeObserver()
    }

    // Listen to window focus/blur events
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    // Initialize based on current focus state
    if (document.hasFocus()) {
      enableResizeObserver()
    } else {
      isWindowFocused = false
    }

    // Initial dimension update (but only if focused)
    if (isWindowFocused) {
      setTimeout(updateDimensions, 500)
    }

    return () => {
      disableResizeObserver()
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Listen for screenshot events from main process (only in code mode)
  useEffect(() => {
    const handleScreenshotTaken = (data: { path: string, preview: string }) => {
      if (currentPage === 'code') {
        setScreenshotQueue((prev) => {
          const newQueue = [...prev, data]
          return newQueue
        })
      }
    }

    const handleClearQueue = () => {
      setScreenshotQueue([])
    }

    if (window.electronAPI?.onScreenshotTaken) {
      window.electronAPI.onScreenshotTaken(handleScreenshotTaken)
    }
    
    if (window.electronAPI?.onClearQueue) {
      window.electronAPI.onClearQueue(handleClearQueue)
    }    // Solution processing event listeners
    const handleProblemExtracted = (data: any) => {
      setProblemStatementData(data)
      setProcessingStage('Problem extracted! Generating solutions...')
    }

    const handleResetView = () => {
      setIsProcessingSolution(false)
      setProblemStatementData(null)
      setSolutionData(null)
      setThoughtsData(null)
      setTimeComplexityData(null)
      setSpaceComplexityData(null)
      setTimeComplexityExplanation(null)
      setSpaceComplexityExplanation(null)
      setConversationHistory([]) // Clear conversation history on reset
    }

    const handleSolutionStart = () => {
      setIsProcessingSolution(true)
      setProcessingStage('Analyzing your code screenshots...')
      
      // Only add processing message if there isn't already one
      setConversationHistory(prev => {
        const hasProcessingMessage = prev.some(msg => msg.type === 'processing');
        if (hasProcessingMessage) return prev; // Prevent duplicates
        
        return [...prev, {
          type: 'processing',
          content: 'Analyzing your code screenshots...',
          timestamp: Date.now()
        }];
      });
    }

    const handleSolutionSuccess = (data: any) => {
      setIsProcessingSolution(false)
      setProcessingStage('')
      
      if (!data) {
        return
      }

      // Parse the JSON response directly
      let parsedSolutionData;
      try {
        parsedSolutionData = JSON.parse(data.code);
      } catch (e) {
        parsedSolutionData = { Code: data.code }; // Fallback
      }

      // Remove processing message and add AI solution response (prevent duplicates)
      setConversationHistory(prev => {
        const filtered = prev.filter(msg => msg.type !== 'processing');
        
        // Check if we already have a similar AI response to prevent duplicates
        const hasRecentAIResponse = filtered.some(msg => 
          msg.type === 'ai' && 
          msg.solutionData && 
          Date.now() - msg.timestamp < 5000 // Within last 5 seconds
        );
        
        if (hasRecentAIResponse) return prev;
        
        return [...filtered, {
          type: 'ai',
          content: 'Here\'s your solution! 🚀',
          timestamp: Date.now(),
          solutionData: parsedSolutionData
        }];
      });
    }

    const handleSolutionError = (error: string) => {
      setIsProcessingSolution(false)
      setProcessingStage('')
      
      // Remove processing message and add error message
      setConversationHistory(prev => {
        const filtered = prev.filter(msg => msg.type !== 'processing');
        return [...filtered, {
          type: 'ai',
          content: `Sorry, there was an error processing your code: ${error}`,
          timestamp: Date.now()
        }];
      });
    }

    // Register solution processing listeners only for CodePage
    if (currentPage === 'code') {
      if (window.electronAPI?.onProblemExtracted) {
        window.electronAPI.onProblemExtracted(handleProblemExtracted)
      }

      if (window.electronAPI?.onResetView) {
        window.electronAPI.onResetView(handleResetView)
      }

      if (window.electronAPI?.onSolutionStart) {
        window.electronAPI.onSolutionStart(handleSolutionStart)
      }

      if (window.electronAPI?.onSolutionSuccess) {
        window.electronAPI.onSolutionSuccess(handleSolutionSuccess)
      }

      if (window.electronAPI?.onSolutionError) {
        window.electronAPI.onSolutionError(handleSolutionError)
      }
    }

    return () => {
      // Remove all listeners when component unmounts
      if (window.electronAPI?.removeAllListeners) {
        window.electronAPI.removeAllListeners('screenshot-taken')
        window.electronAPI.removeAllListeners('clear-queue')
        window.electronAPI.removeAllListeners('problem-extracted')
        window.electronAPI.removeAllListeners('reset-view')
        window.electronAPI.removeAllListeners('solution-start')
        window.electronAPI.removeAllListeners('solution-success')
        window.electronAPI.removeAllListeners('solution-error')
      }
    }
  }, [currentPage])

  // Handle sending a message in CodePage
  const handleSendMessage = () => {
    if (!chatInput.trim() && screenshotQueue.length === 0) return
    
    // Add user message to conversation history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: chatInput.trim(),
      screenshots: [...screenshotQueue],
      timestamp: Date.now()
    }])
    
    // Clear input and queue
    setChatInput('')
    setScreenshotQueue([])
      // Trigger AI processing
    // This would be an electron API call in the real implementation
    setIsProcessingSolution(true);
    console.log('Would process solution with:', {
      language: selectedLanguage,
      message: chatInput.trim()
    })
  }
  
  return (
    <div className="min-h-screen frosted-glass text-gray-100 flex flex-col overflow-hidden rounded-2xl" ref={containerRef}>      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col h-full max-w-7xl relative">
        {/* Navigation Bar - Positioned absolutely at the top */}
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <NavigationBar
              isMobileView={isMobileView}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              onNavigate={handleNavigate}
              currentPage={currentPage}
            />
          </div>
        </div>
          {/* Content - Add top padding to avoid overlap with nav */}
        <div className="flex-1 flex flex-col h-full pt-16">
          {/* Render the appropriate page based on current view */}{currentPage === 'home' && (
            <HomePage 
              isMobileView={isMobileView}
            />
          )}
          {currentPage === 'chat' && (
            <ChatPage 
              isMobileView={isMobileView}
            />
          )}
          {currentPage === 'code' && (
            <CodePage 
              isMobileView={isMobileView}
              screenshotQueue={screenshotQueue}
              setScreenshotQueue={setScreenshotQueue}
              chatInput={chatInput}
              setChatInput={setChatInput}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              conversationHistory={conversationHistory}
              onSendMessage={handleSendMessage}
            />
          )}          {currentPage === 'queue' && (
            <QueuePage 
              isMobileView={isMobileView}
              setView={handleNavigate}
              currentLanguage={selectedLanguage}
              setLanguage={setSelectedLanguage}
            />
          )}
          {currentPage === 'solutions' && (
            <SolutionsPage 
              isMobileView={isMobileView}
              setView={handleNavigate}
              credits={999}
              currentLanguage={selectedLanguage}
              setLanguage={setSelectedLanguage}
            />
          )}
          {currentPage === 'messages' && (
            <MessagesPage 
              isMobileView={isMobileView}
            />
          )}
          {currentPage === 'brain' && (
            <BrainPage 
              isMobileView={isMobileView}
            />
          )}        </div>
      </div>
    </div>
  )
}

export default App
