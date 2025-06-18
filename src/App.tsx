import { useEffect, useRef, useState } from "react"
import { FloatingDock } from "@/components/ui/floating-dock"
import { MainLayout } from "@/components/main-layout"
import { ChatPage } from "./pages/ChatPage"
import { ContentSection, SolutionSection, ComplexitySection } from "./components/Solutions/SolutionDisplay"
import { ProblemStatementData } from "./types/solutions"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyButton } from "./components/ui/copy-button"
import { 
  IconHome,
  IconMicrophone,
  IconMicrophoneOff,
  IconSettings,
  IconUser,
  IconMessage,
  IconBrain,
  IconCode,
  IconBulb,
  IconSearch,
  IconStar,
  IconHeart,
  IconMenu2,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react"
import { motion, AnimatePresence } from "motion/react"

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [navScrollIndex, setNavScrollIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  
  // App mode state
  const [currentMode, setCurrentMode] = useState<'chat' | 'code'>('chat')
  const [currentView, setCurrentView] = useState<'queue' | 'solutions' | 'debug'>('queue')
  console.log('[DEBUG] App component rendered, current mode:', currentMode, 'current view:', currentView)
  
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
  
  // Initialize global window properties for electron compatibility
  useEffect(() => {
    // Type assertion to bypass TypeScript error
    ;(window as any).__IS_INITIALIZED__ = true
    ;(window as any).__LANGUAGE__ = selectedLanguage
    ;(window as any).__CREDITS__ = 999
  }, [selectedLanguage])
  
  // Mode switching handler with dimension update delay
  const handleModeSwitch = (newMode: 'chat' | 'code') => {
    console.log('[DEBUG] Switching mode from', currentMode, 'to', newMode)
    setCurrentMode(newMode)
    
    // Prevent dimension updates for a short period after mode switch
    ;(window as any).__lastScaleTime = Date.now()
  }

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

  const navItems = [
    { title: "Home", icon: <IconHome className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { 
      title: "Microphone", 
      icon: isMuted ? <IconMicrophoneOff className="h-full w-full" /> : <IconMicrophone className="h-full w-full" />, 
      href: "#",
      onClick: () => setIsMuted(!isMuted)
    },
    { title: "Messages", icon: <IconMessage className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Brain", icon: <IconBrain className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Code", icon: <IconCode className="h-full w-full" />, href: "#", onClick: () => {
      console.log('[DEBUG] Code button clicked')
      handleModeSwitch('code')
    }},
    { title: "Ideas", icon: <IconBulb className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Search", icon: <IconSearch className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Favorites", icon: <IconStar className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Profile", icon: <IconUser className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Settings", icon: <IconSettings className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
    { title: "Love", icon: <IconHeart className="h-full w-full" />, href: "#", onClick: () => handleModeSwitch('chat') },
  ]

  const visibleItems = navItems.slice(navScrollIndex, navScrollIndex + 4)
  const canScrollLeft = navScrollIndex > 0
  const canScrollRight = navScrollIndex + 4 < navItems.length

  const scrollNavLeft = () => {
    if (canScrollLeft) {
      setNavScrollIndex(prev => Math.max(0, prev - 1))
    }
  }

  const scrollNavRight = () => {
    if (canScrollRight) {
      setNavScrollIndex(prev => Math.min(navItems.length - 4, prev + 1))
    }
  }

  // Listen for aspect ratio changes from main process
  useEffect(() => {
    const handleAspectChange = (data: { isMobile: boolean, width: number, height: number }) => {
      setIsMobileView(data.isMobile)
    }

    window.electronAPI?.onWindowAspectChanged?.(handleAspectChange)
    
    return () => {
      window.electronAPI?.removeAllListeners?.('window-aspect-changed')
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

  // Dynamic window sizing with constraints (but respect manual scaling and focus state)
  useEffect(() => {
    if (!containerRef.current) return

    let resizeObserver: ResizeObserver | null = null
    let isWindowFocused = true // Track focus state

    const updateDimensions = () => {
      if (!containerRef.current || !isWindowFocused) return // Only update when focused
      
      // Check if we're in manual scaling mode - if so, don't override
      // We can detect this by checking if a scale operation happened recently
      const now = Date.now()
      const lastScaleTime = (window as any).__lastScaleTime || 0
      const isRecentlyScaled = (now - lastScaleTime) < 2000 // 2 seconds
      
      if (isRecentlyScaled) {
        console.log('Skipping dimension update - recent manual scaling detected')
        return
      }
      
      const height = Math.max(400, Math.min(containerRef.current.scrollHeight, 1000)) // Minimum 400px, cap at 1000px
      const width = Math.max(600, Math.min(containerRef.current.scrollWidth, 1400))   // Minimum 600px, cap at 1400px
      
      console.log(`[DEBUG] Updating dimensions: ${width}x${height}, scrollHeight: ${containerRef.current.scrollHeight}, scrollWidth: ${containerRef.current.scrollWidth}`)
      window.electronAPI?.updateContentDimensions({ width, height })
    }

    const enableResizeObserver = () => {
      if (!containerRef.current || resizeObserver) return
      
      resizeObserver = new ResizeObserver(() => {
        // Debounce the dimension updates
        clearTimeout((window as any).__dimensionUpdateTimeout)
        ;(window as any).__dimensionUpdateTimeout = setTimeout(updateDimensions, 100)
      })
      
      resizeObserver.observe(containerRef.current)
      console.log('ResizeObserver enabled')
    }

    const disableResizeObserver = () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
        clearTimeout((window as any).__dimensionUpdateTimeout)
        console.log('ResizeObserver disabled')
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
    console.log('Setting up screenshot event listeners')
    
    const handleScreenshotTaken = (data: { path: string, preview: string }) => {
      console.log('Screenshot event received:', data)
      console.log('Current mode:', currentMode)
      if (currentMode === 'code') {
        console.log('Screenshot accepted in code mode:', data.path)
        console.log('Preview data length:', data.preview ? data.preview.length : 0)
        setScreenshotQueue(prev => {
          const newQueue = [...prev, data]
          console.log('Updated screenshot queue length:', newQueue.length)
          return newQueue
        })
      } else {
        console.log('Screenshot ignored - not in code mode')
      }
    }

    const handleClearQueue = () => {
      console.log('Clearing screenshot queue')
      setScreenshotQueue([])
    }

    // Add event listeners if they exist
    if (window.electronAPI?.onScreenshotTaken) {
      console.log('Registering onScreenshotTaken listener')
      window.electronAPI.onScreenshotTaken(handleScreenshotTaken)
    } else {
      console.log('onScreenshotTaken not available')
    }
    
    if (window.electronAPI?.onClearQueue) {
      console.log('Registering onClearQueue listener')
      window.electronAPI.onClearQueue(handleClearQueue)
    } else {
      console.log('onClearQueue not available')
    }

    // Solution processing event listeners
    const handleProblemExtracted = (data: any) => {
      console.log('Problem extracted:', data)
      setProblemStatementData(data)
      setProcessingStage('Problem extracted! Generating solutions...')
    }

    const handleResetView = () => {
      console.log('Reset view received')
      setCurrentView('queue')
      setIsProcessingSolution(false)
      setProblemStatementData(null)
      setSolutionData(null)
      setThoughtsData(null)
      setTimeComplexityData(null)
      setSpaceComplexityData(null)
      setTimeComplexityExplanation(null)
      setSpaceComplexityExplanation(null)
    }

    const handleSolutionStart = () => {
      console.log('Solution processing started')
      setIsProcessingSolution(true)
      setProcessingStage('Analyzing your code screenshots...')
      
      // Add processing message to conversation
      setConversationHistory(prev => [...prev, {
        type: 'processing',
        content: 'Analyzing your code screenshots...',
        timestamp: Date.now()
      }]);
    }

    const handleSolutionSuccess = (data: any) => {
      console.log('Solution success received:', data)
      console.log('Current conversation history length:', conversationHistory.length)
      setIsProcessingSolution(false)
      setProcessingStage('')
      
      if (!data) {
        console.warn("Received empty or invalid solution data")
        return
      }

      // Parse the JSON response directly
      let solutionData;
      try {
        solutionData = JSON.parse(data.code);
      } catch (e) {
        console.error("Failed to parse JSON solution data:", e);
        solutionData = { Code: data.code }; // Fallback
      }

      console.log('Parsed solution data:', solutionData);
      console.log('Explanation type:', typeof solutionData.Explanation);
      console.log('Explanation content:', solutionData.Explanation);

      // Format explanation properly
      let formattedExplanation = '';
      if (solutionData.Explanation && typeof solutionData.Explanation === 'object') {
        formattedExplanation = Object.entries(solutionData.Explanation)
          .map(([key, value]) => `**${key}**: ${value}`)
          .join('\n\n');
      } else if (solutionData.Explanation) {
        formattedExplanation = solutionData.Explanation;
      }

      // Remove processing message and add AI solution response
      setConversationHistory(prev => {
        const filtered = prev.filter(msg => msg.type !== 'processing');
        return [...filtered, {
          type: 'ai',
          content: 'Here\'s your solution! 🚀',
          timestamp: Date.now(),
          solutionData: solutionData
        }];
      });

      // No longer updating individual state - using conversation history only
    }

    const handleSolutionError = (error: string) => {
      console.error('Solution processing error:', error)
      setIsProcessingSolution(false)
      setProcessingStage('')
      setCurrentView('queue') // Reset to queue view on error
      // You can add toast notification here if needed
    }

    // Register solution processing listeners
    if (window.electronAPI?.onProblemExtracted) {
      window.electronAPI.onProblemExtracted(handleProblemExtracted)
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
    if (window.electronAPI?.onResetView) {
      window.electronAPI.onResetView(handleResetView)
    }

    return () => {
      // Cleanup listeners
      window.electronAPI?.removeAllListeners?.('screenshot-taken')
      window.electronAPI?.removeAllListeners?.('clear-queue')
      window.electronAPI?.removeAllListeners?.('problem-extracted')
      window.electronAPI?.removeAllListeners?.('solution-start')
      window.electronAPI?.removeAllListeners?.('solution-success')
      window.electronAPI?.removeAllListeners?.('solution-error')
      window.electronAPI?.removeAllListeners?.('reset-view')
    }
  }, [currentMode]) // Add currentMode dependency

  // Clear screenshot queue when switching away from code mode
  useEffect(() => {
    if (currentMode !== 'code') {
      setScreenshotQueue([])
    }
  }, [currentMode])

  const handleSendMessage = async () => {
    if (!chatInput.trim() && screenshotQueue.length === 0) return

    try {
      console.log('Sending message:', { 
        text: chatInput, 
        screenshots: screenshotQueue.length, 
        mode: currentMode,
        language: currentMode === 'code' ? selectedLanguage : undefined
      })
      
      if (currentMode === 'code' && screenshotQueue.length > 0) {
        // Add user message to conversation history
        setConversationHistory(prev => [...prev, {
          type: 'user',
          content: chatInput || "Could you help me analyze this code?",
          screenshots: [...screenshotQueue],
          timestamp: Date.now()
        }]);
        
        // Start solution processing
        setIsProcessingSolution(true)
        setProcessingStage('Preparing screenshots for analysis...')
        // Clear previous solution data
        setProblemStatementData(null)
        setSolutionData(null)
        setThoughtsData(null)
        setTimeComplexityData(null)
        setSpaceComplexityData(null)
        setTimeComplexityExplanation(null)
        setSpaceComplexityExplanation(null)
        
        // Send screenshots with message and language to backend for code analysis
        const result = await window.electronAPI?.processScreenshots?.()
        console.log('Code analysis processing result:', result)
        
        // Clear the queue and input after processing
        setScreenshotQueue([])
        setChatInput("")
      } else if (currentMode === 'code' && screenshotQueue.length === 0) {
        // Code mode without screenshots - just send the text query with language context
        console.log('Code mode text query:', { text: chatInput, language: selectedLanguage })
        // Here you would send to your code analysis API with language context
      } else {
        // Just a regular chat message without screenshots
        console.log('Regular chat message:', chatInput)
        // Here you would typically send to your general chat API
      }
      
      // Clear the input
      setChatInput("")
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div ref={containerRef} className={`w-full h-screen max-h-screen overflow-hidden bg-black/20 backdrop-blur-sm rounded-2xl border border-gray-700/30 shadow-2xl ${isMobileView ? 'p-3' : 'p-6'}`}>
      {/* Main Layout Grid */}
      <div className={`w-full h-full flex flex-col ${isMobileView ? 'gap-3' : 'gap-6'}`}>
        {/* Navigation Bar - Different for Desktop vs Mobile */}
        {!isMobileView ? (
          /* Desktop FloatingDock */
          <div className="flex justify-center">
            <FloatingDock
              items={navItems.map(item => ({
                title: item.title,
                icon: item.icon,
                href: item.href,
                onClick: item.onClick
              }))}
              desktopClassName="bg-gray-900/70 backdrop-blur-md border border-gray-700/50"
            />
          </div>
        ) : (
          /* Mobile Collapsible Nav */
          <div className="flex justify-start">
            <div className="relative">
              {/* Collapsed Menu Button */}
              <motion.button
                onClick={() => setIsNavExpanded(!isNavExpanded)}
                className="flex items-center justify-center w-12 h-12 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-900/80"
                animate={{ x: isNavExpanded ? 60 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <IconMenu2 className="w-6 h-6 text-gray-300" />
              </motion.button>

              {/* Expanded Navigation */}
              <AnimatePresence>
                {isNavExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute left-0 top-0 flex items-center gap-2 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-full px-4 py-2 shadow-lg"
                  >
                    {/* Left Scroll Arrow */}
                    <button
                      onClick={scrollNavLeft}
                      disabled={!canScrollLeft}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                        canScrollLeft 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Visible Nav Items */}
                    <div className="flex items-center gap-2">
                      {visibleItems.map((item, index) => (
                        <motion.button
                          key={`${item.title}-${navScrollIndex + index}`}
                          onClick={(e) => {
                            e.preventDefault()
                            if (item.onClick) {
                              item.onClick()
                            }
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-all duration-200 group"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors">
                            {item.icon}
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Right Scroll Arrow */}
                    <button
                      onClick={scrollNavRight}
                      disabled={!canScrollRight}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                        canScrollRight 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Main Content Area with Enhanced Effects */}
        <div className={`flex-1 flex ${isMobileView ? 'flex-col gap-3' : 'gap-6'}`}>
          {/* Left Side - Main Content Screen */}
          <div className={`${isMobileView ? 'flex-1' : 'flex-1'} bg-gray-900/40 hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-lg hover:shadow-2xl ${isMobileView ? 'p-4' : 'p-8'} flex flex-col`}>
            
            {/* Mode-specific Content */}
            {(() => {
              console.log('[DEBUG] Rendering mode:', currentMode)
              try {
                if (currentMode === 'chat') {
                  return <ChatPage isMobileView={isMobileView} />
                } else if (currentMode === 'code') {
                  return (
                    <div className="flex-1 flex flex-col h-full">
                      {/* Code Mode Header */}
                      <div className="flex items-center justify-between flex-shrink-0 mb-4">
                        <div className="flex items-center gap-2">
                          <IconCode className="w-5 h-5 text-green-400" />
                          <span className="text-sm font-medium text-green-400">Code Analysis Mode</span>
                        </div>
                        <div className="text-xs text-gray-400">Ctrl+H to capture code</div>
                      </div>

                      {/* Scrollable Conversation Messages */}
                      <div className="flex-1 overflow-y-scroll space-y-4 min-h-0 pr-2 conversation-scroll"
                           style={{
                             scrollbarWidth: 'none',
                             msOverflowStyle: 'none',
                             maxHeight: 'calc(100vh - 200px)'
                           }}>
                        <style>
                          {`
                          .conversation-scroll::-webkit-scrollbar {
                            display: none;
                          }
                          `}
                        </style>
                        {/* Initial AI Message */}
                        {conversationHistory.length === 0 && (
                          <>
                            <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start`}>
                              <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-green-500/20 flex items-center justify-center`}>
                                <IconBrain className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
                              </div>
                              <div className="flex-1">
                                <p className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm`}>
                                  I can help you analyze your code, suggest improvements, debug issues, and explain algorithms. Take a screenshot of your code (Ctrl+H) and let me know what you'd like help with!
                                </p>
                              </div>
                            </div>
                            <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start justify-end`}>
                              <div className="flex-1 max-w-[80%]">
                                <p className={`text-gray-300 leading-relaxed bg-green-600/20 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm text-right`}>
                                  Could you help me understand the big O notation of my sorting algorithm?
                                </p>
                              </div>
                              <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-green-600/20 flex items-center justify-center`}>
                                <IconUser className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Dynamic Conversation History */}
                        {conversationHistory.map((message, index) => (
                          <div key={index} className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start ${message.type === 'user' ? 'justify-end' : ''}`}>
                            {message.type !== 'user' && (
                              <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0`}>
                                <IconBrain className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-green-400 ${message.type === 'processing' ? 'animate-pulse' : ''}`} />
                              </div>
                            )}
                            
                            <div className={`flex-1 ${message.type === 'user' ? 'max-w-[80%]' : 'min-w-0'}`}>
                              {message.type === 'user' ? (
                                /* User Message with Screenshots */
                                <div className={`bg-green-600/20 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm`}>
                                  <p className="text-gray-300 leading-relaxed text-right mb-2">
                                    {message.content}
                                  </p>
                                  {message.screenshots && (
                                    <div className="flex gap-2 justify-end">
                                      {message.screenshots.map((screenshot, idx) => (
                                        <img
                                          key={idx}
                                          src={`data:image/png;base64,${screenshot.preview}`}
                                          alt={`Code Screenshot ${idx + 1}`}
                                          className="w-16 h-16 object-cover rounded border border-green-400/30"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : message.type === 'processing' ? (
                                /* Processing Message */
                                <div className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    <span className="ml-2">{message.content}</span>
                                  </div>
                                </div>
                              ) : (
                                /* AI Solution Response - Conversational Format */
                                <div className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm max-h-96 overflow-y-scroll ai-response`}
                                     style={{
                                       scrollbarWidth: 'none',
                                       msOverflowStyle: 'none'
                                     }}>
                                  <style>
                                    {`
                                    .ai-response::-webkit-scrollbar {
                                      display: none;
                                    }
                                    `}
                                  </style>
                                  {message.solutionData ? (
                                    <div className="space-y-4">
                                      {/* Conversational intro */}
                                      <p className="text-gray-300">
                                        I've analyzed your code screenshots! Here's what I found and how to solve it:
                                      </p>

                                      {/* Problem Information */}
                                      {message.solutionData["Problem Information"] && (
                                        <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                          <p className="text-blue-200 font-medium mb-1">🎯 Problem Identified:</p>
                                          <p className="text-gray-300 text-sm">
                                            {message.solutionData["Problem Information"]}
                                          </p>
                                        </div>
                                      )}

                                      {/* Approach explanations in conversational style */}
                                      {message.solutionData.Explanation && (
                                        <div>
                                          <p className="text-gray-300 mb-2">
                                            Let me walk you through different ways to approach this:
                                          </p>
                                          <div className="space-y-2 ml-4">
                                            {typeof message.solutionData.Explanation === 'object' && message.solutionData.Explanation !== null ? (
                                              Object.entries(message.solutionData.Explanation).map(([approach, explanation], idx) => (
                                                <div key={idx} className="text-sm">
                                                  <p className="text-yellow-300">
                                                    <strong>{approach.replace(/_/g, ' ')}:</strong> {explanation as string}
                                                  </p>
                                                </div>
                                              ))
                                            ) : (
                                              <div className="text-sm">
                                                <p className="text-yellow-300">{message.solutionData.Explanation}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Solution code with conversational intro */}
                                      {message.solutionData.Code && (
                                        <div>
                                          <p className="text-gray-300 mb-2">
                                            Here's the optimized solution in {selectedLanguage}:
                                          </p>
                                          <div className="relative">
                                            <CopyButton text={message.solutionData.Code.replace(/```python\n/g, '').replace(/```javascript\n/g, '').replace(/```java\n/g, '').replace(/```cpp\n/g, '').replace(/```\n?/g, '').trim()} />
                                            <SyntaxHighlighter
                                              showLineNumbers
                                              language={selectedLanguage === "golang" ? "go" : selectedLanguage}
                                              style={dracula}
                                              customStyle={{
                                                maxWidth: "100%",
                                                margin: 0,
                                                padding: "1rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                backgroundColor: "rgba(22, 27, 34, 0.5)",
                                                fontSize: isMobileView ? '10px' : '12px',
                                                maxHeight: '400px',
                                                overflow: 'hidden'
                                              }}
                                              wrapLongLines={true}
                                            >
                                              {message.solutionData.Code.replace(/```python\n/g, '').replace(/```javascript\n/g, '').replace(/```java\n/g, '').replace(/```cpp\n/g, '').replace(/```\n?/g, '').trim()}
                                            </SyntaxHighlighter>
                                          </div>
                                        </div>
                                      )}

                                      {/* Complexity in conversational style */}
                                      {(message.solutionData["Time Complexity"] || message.solutionData["Space Complexity"]) && (
                                        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                          <p className="text-green-200 font-medium mb-2">⚡ Performance Analysis:</p>
                                          <div className="text-sm space-y-1">
                                            {message.solutionData["Time Complexity"] && (
                                              <p className="text-gray-300">
                                                <span className="text-yellow-400">Time:</span> {message.solutionData["Time Complexity"]}
                                              </p>
                                            )}
                                            {message.solutionData["Space Complexity"] && (
                                              <p className="text-gray-300">
                                                <span className="text-blue-400">Space:</span> {message.solutionData["Space Complexity"]}
                                              </p>
                                            )}
                                            {message.solutionData.complexity_explanation && (
                                              <p className="text-gray-400 text-xs mt-2 italic">
                                                {message.solutionData.complexity_explanation}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Conversational closing */}
                                      <div className="text-gray-400 text-xs pt-2 border-t border-gray-700/30">
                                        💡 This solution should work well for your use case. Need me to explain any part in more detail or explore alternative approaches?
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-300">
                                      I've processed your request, but there seems to be an issue with the response format. Let me know if you'd like me to try again!
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {message.type === 'user' && (
                              <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-green-600/20 flex items-center justify-center`}>
                                <IconUser className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Fixed Input Section at Bottom */}
                      <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-700/30">
                        {/* Screenshot Queue - Only show in code mode */}
                        {screenshotQueue.length > 0 && (
                          <div className="mb-4 p-3 bg-gray-800/60 rounded-lg border border-gray-600/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400">Screenshots ({screenshotQueue.length})</span>
                              <button
                                onClick={() => setScreenshotQueue([])}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                              {screenshotQueue.map((screenshot, index) => (
                                <div key={index} className="relative flex-shrink-0 group">
                                  <img
                                    src={`data:image/png;base64,${screenshot.preview}`}
                                    alt={`Screenshot ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-gray-600/50 cursor-pointer group-hover:scale-105 group-hover:brightness-75 transition-transform duration-300"
                                  />
                                  <button
                                    onClick={() => setScreenshotQueue(prev => prev.filter((_, i) => i !== index))}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-400 text-white text-xs rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Language Selector - Only in Code Mode */}
                        <div className="mb-3">
                          <label className="block text-xs text-gray-400 mb-1">Programming Language</label>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-300 rounded-lg border border-gray-700/50 py-2 px-3 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="csharp">C#</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                            <option value="swift">Swift</option>
                            <option value="kotlin">Kotlin</option>
                            <option value="dart">Dart</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        {/* Text Input */}
                        <div className="relative">
                          <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleSendMessage()
                              } else if (e.key === 'Enter' && !e.shiftKey) {
                                handleSendMessage()
                              }
                            }}
                            placeholder="Describe what you'd like me to help with regarding your code..."
                            className={`w-full bg-gray-800/40 hover:bg-gray-800/60 focus:bg-gray-800/80 transition-all duration-300 rounded-lg border border-gray-700/50 ${isMobileView ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm'} text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 pr-12`}
                          />
                          <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 ${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center text-gray-400 hover:text-green-400 transition-colors duration-200`}
                          >
                            {isMuted ? 
                              <IconMicrophoneOff className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'}`} /> :
                              <IconMicrophone className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'}`} />
                            }
                          </button>
                        </div>

                        {/* Mode-specific Help Text */}
                        <div className="mt-2 text-xs text-gray-500">
                          <span>Press Ctrl+H to capture code screenshots • Ctrl+R to clear queue • Enter to analyze</span>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  // Fallback for unknown mode
                  console.warn('[WARN] Unknown mode:', currentMode)
                  return <ChatPage isMobileView={isMobileView} />
                }
              } catch (error) {
                console.error('[ERROR] Failed to render component:', error)
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-red-400 text-center">
                      <p>Error loading {currentMode} mode</p>
                      <p className="text-xs text-gray-400 mt-2">{error?.toString()}</p>
                      <button 
                        onClick={() => handleModeSwitch('chat')} 
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Switch to Chat Mode
                      </button>
                    </div>
                  </div>
                )
              }
            })()}
          </div>

          {/* Right Side - Speech Areas with Waveform Effects - Hidden in Mobile View */}
          {!isMobileView && (
            <div className="w-80 flex flex-col gap-6">
              {/* My Speech with Waveform */}
              <div className="flex-1 bg-gray-900/40 hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-lg hover:shadow-2xl p-6 flex flex-col">
                <div className="text-gray-300 font-medium mb-4 text-sm flex items-center gap-2">
                  <IconMicrophone className="w-5 h-5 text-blue-400" />
                  My Speech
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-full h-24 relative">
                    <div className="absolute inset-0 flex items-center justify-around">
                      {[...Array(32)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-blue-400/60 rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.sin(i * 0.4) * 30}%`,
                            animationDelay: `${i * 50}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Speech with Waveform */}
              <div className="flex-1 bg-gray-900/40 hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-lg hover:shadow-2xl p-6 flex flex-col">
                <div className="text-gray-300 font-medium mb-4 text-sm flex items-center gap-2">
                  <IconMessage className="w-5 h-5 text-purple-400" />
                  Other Speech
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-full h-24 relative">
                    <div className="absolute inset-0 flex items-center justify-around opacity-60">
                      {[...Array(32)].map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-purple-400/60 rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.cos(i * 0.4) * 20}%`,
                            animationDelay: `${i * 40}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Recommendations Grid with Enhanced Effects - Hidden in Mobile View */}
        {!isMobileView && (
          <div className="grid grid-cols-4 gap-6 h-24">
            <div className="bg-neutral-900/80 hover:bg-neutral-900/90 transition-all duration-300 backdrop-blur-md border border-neutral-800/50 rounded-xl shadow-lg hover:shadow-2xl p-4 flex items-center gap-3 cursor-pointer group">
              <IconBulb className="w-6 h-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">Suggest optimization approaches</span>
            </div>
            <div className="bg-neutral-900/80 hover:bg-neutral-900/90 transition-all duration-300 backdrop-blur-md border border-neutral-800/50 rounded-xl shadow-lg hover:shadow-2xl p-4 flex items-center gap-3 cursor-pointer group">
              <IconCode className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">Show code examples</span>
            </div>
            <div className="bg-neutral-900/80 hover:bg-neutral-900/90 transition-all duration-300 backdrop-blur-md border border-neutral-800/50 rounded-xl shadow-lg hover:shadow-2xl p-4 flex items-center gap-3 cursor-pointer group">
              <IconSearch className="w-6 h-6 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">Analyze time complexity</span>
            </div>
            <div className="bg-neutral-900/80 hover:bg-neutral-900/90 transition-all duration-300 backdrop-blur-md border border-neutral-800/50 rounded-xl shadow-lg hover:shadow-2xl p-4 flex items-center gap-3 cursor-pointer group">
              <IconBrain className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">Explain concepts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
