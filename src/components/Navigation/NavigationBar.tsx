import { useState } from "react"
import { FloatingDock } from "@/components/ui/floating-dock"
import { motion, AnimatePresence } from "motion/react"
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

interface NavigationBarProps {
  isMobileView: boolean
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  onNavigate: (page: string) => void
  currentPage: string
}

export const NavigationBar = ({ 
  isMobileView, 
  isMuted, 
  setIsMuted, 
  onNavigate, 
  currentPage 
}: NavigationBarProps) => {
  const [isNavExpanded, setIsNavExpanded] = useState(false)
  const [navScrollIndex, setNavScrollIndex] = useState(0)

  const navItems = [
    { 
      title: "Home", 
      icon: <IconHome className="h-full w-full" />, 
      href: "#", 
      page: "home",
      onClick: () => onNavigate('home') 
    },
    { 
      title: "Microphone", 
      icon: isMuted ? <IconMicrophoneOff className="h-full w-full" /> : <IconMicrophone className="h-full w-full" />, 
      href: "#",
      page: "microphone",
      onClick: () => setIsMuted(!isMuted)
    },
    { 
      title: "Messages", 
      icon: <IconMessage className="h-full w-full" />, 
      href: "#", 
      page: "messages",
      onClick: () => onNavigate('messages') 
    },
    { 
      title: "Brain", 
      icon: <IconBrain className="h-full w-full" />, 
      href: "#", 
      page: "brain",
      onClick: () => onNavigate('brain') 
    },
    { 
      title: "Code", 
      icon: <IconCode className="h-full w-full" />, 
      href: "#", 
      page: "code",
      onClick: () => onNavigate('code')
    },
    { 
      title: "Ideas", 
      icon: <IconBulb className="h-full w-full" />, 
      href: "#", 
      page: "ideas",
      onClick: () => onNavigate('ideas') 
    },
    { 
      title: "Search", 
      icon: <IconSearch className="h-full w-full" />, 
      href: "#", 
      page: "search",
      onClick: () => onNavigate('search') 
    },
    { 
      title: "Favorites", 
      icon: <IconStar className="h-full w-full" />, 
      href: "#", 
      page: "favorites",
      onClick: () => onNavigate('favorites') 
    },
    { 
      title: "Profile", 
      icon: <IconUser className="h-full w-full" />, 
      href: "#", 
      page: "profile",
      onClick: () => onNavigate('profile') 
    },
    { 
      title: "Settings", 
      icon: <IconSettings className="h-full w-full" />, 
      href: "#", 
      page: "settings",
      onClick: () => onNavigate('settings') 
    },
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
  if (!isMobileView) {
    // Desktop FloatingDock
    return (
      <div className="flex justify-center">
        <FloatingDock
          items={navItems.map(item => ({
            title: item.title,
            icon: item.icon,
            href: item.href,
            onClick: item.onClick
          }))}
          desktopClassName="bg-black/50 backdrop-blur-md border border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 shadow-black/30 rounded-full"
        />
      </div>
    )
  }

  // Mobile Collapsible Nav
  return (
    <div className="flex justify-start">
      <div className="relative">
        {/* Collapsed Menu Button */}        <motion.button
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          className="flex items-center justify-center w-12 h-12 bg-black/50 backdrop-blur-md border border-gray-700/30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black/60"
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
              className="absolute left-0 bottom-full mb-2 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-gray-700/30 rounded-full px-4 py-2 shadow-lg shadow-black/30"
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
  )
}
