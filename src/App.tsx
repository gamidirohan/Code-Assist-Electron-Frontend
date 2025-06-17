import { useEffect, useRef, useState } from "react"
import { FloatingDock } from "@/components/ui/floating-dock"
import { MainLayout } from "@/components/main-layout"
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

  const navItems = [
    { title: "Home", icon: <IconHome className="h-full w-full" />, href: "#" },
    { 
      title: "Microphone", 
      icon: isMuted ? <IconMicrophoneOff className="h-full w-full" /> : <IconMicrophone className="h-full w-full" />, 
      href: "#",
      onClick: () => setIsMuted(!isMuted)
    },
    { title: "Messages", icon: <IconMessage className="h-full w-full" />, href: "#" },
    { title: "Brain", icon: <IconBrain className="h-full w-full" />, href: "#" },
    { title: "Code", icon: <IconCode className="h-full w-full" />, href: "#" },
    { title: "Ideas", icon: <IconBulb className="h-full w-full" />, href: "#" },
    { title: "Search", icon: <IconSearch className="h-full w-full" />, href: "#" },
    { title: "Favorites", icon: <IconStar className="h-full w-full" />, href: "#" },
    { title: "Profile", icon: <IconUser className="h-full w-full" />, href: "#" },
    { title: "Settings", icon: <IconSettings className="h-full w-full" />, href: "#" },
    { title: "Love", icon: <IconHeart className="h-full w-full" />, href: "#" },
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

    const updateDimensions = () => {
      if (!containerRef.current) return
      const height = Math.min(containerRef.current.scrollHeight, 1000) // Cap at 1000px
      const width = Math.min(containerRef.current.scrollWidth, 1400)   // Cap at 1400px
      window.electronAPI?.updateContentDimensions({ width, height })
    }

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    // Initial dimension update
    updateDimensions()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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
          {/* Left Side - Main Content Screen with Chat-like Interface */}
          <div className={`${isMobileView ? 'flex-1' : 'flex-1'} bg-gray-900/40 hover:bg-gray-900/50 transition-all duration-300 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-lg hover:shadow-2xl ${isMobileView ? 'p-4' : 'p-8'} flex flex-col`}>
            <div className={`flex-1 flex flex-col ${isMobileView ? 'gap-2' : 'gap-4'} overflow-y-auto`}>
              {/* AI Message */}
              <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start`}>
                <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-blue-500/20 flex items-center justify-center`}>
                  <IconBrain className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                </div>
                <div className="flex-1">
                  <p className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm`}>
                    I can help you optimize your code by analyzing its complexity and suggesting improvements. What would you like me to help you with?
                  </p>
                </div>
              </div>
              {/* User Message */}
              <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start justify-end`}>
                <div className="flex-1 max-w-[80%]">
                  <p className={`text-gray-300 leading-relaxed bg-blue-600/20 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm text-right`}>
                    Could you help me understand the big O notation of my sorting algorithm?
                  </p>
                </div>
                <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-blue-600/20 flex items-center justify-center`}>
                  <IconUser className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
                </div>
              </div>
            </div>
            
            {/* Input Area */}
            <div className={`${isMobileView ? 'mt-2' : 'mt-4'} relative`}>
              <input 
                type="text" 
                placeholder="Type your message..."
                className={`w-full bg-gray-800/40 hover:bg-gray-800/60 focus:bg-gray-800/80 transition-all duration-300 rounded-lg border border-gray-700/50 ${isMobileView ? 'py-2 px-3 text-xs' : 'py-3 px-4 text-sm'} text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              />
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center ${isMuted ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-blue-400'} transition-colors duration-200`}
              >
                {isMuted ? 
                  <IconMicrophoneOff className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'}`} /> :
                  <IconMicrophone className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'}`} />
                }
              </button>
            </div>
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
