import { useEffect } from "react";
import { useRealtimeSTT } from "../hooks/useRealtimeSTT";
import { IconBrain, IconBulb, IconCode, IconSearch, IconMicrophone, IconUsers, IconWaveSquare } from "@tabler/icons-react"

interface BrainPageProps {
  isMobileView: boolean;
  isMuted: boolean;
}

export const BrainPage = ({ isMobileView, isMuted }: BrainPageProps) => {
  console.log(`[BrainPage] Rendering with isMuted: ${isMuted}`);

  const { 
    transcript,
    interimTranscript,
    isStreaming,
    isConnected,
    startStreaming,
    stopStreaming 
  } = useRealtimeSTT();

  // Control streaming based on the global mute state
  useEffect(() => {
    console.log(`[BrainPage] useEffect triggered. isMuted: ${isMuted}`);
    if (!isMuted) {
      console.log('[BrainPage] Calling startStreaming...');
      startStreaming();
    } else {
      console.log('[BrainPage] Calling stopStreaming...');
      stopStreaming();
    }

    // Cleanup on component unmount
    return () => {
      console.log('[BrainPage] Unmounting, calling stopStreaming for cleanup.');
      stopStreaming();
    }
  }, [isMuted, startStreaming, stopStreaming]);

  const recommendations = [
    {
      id: 1,
      title: "Optimize Algorithm",
      description: "Consider using binary search instead of linear search",
      icon: IconCode,
      color: "blue"
    },
    {
      id: 2,
      title: "Improve Explanation",
      description: "Explain your approach step by step",
      icon: IconBulb,
      color: "yellow"
    },
    {
      id: 3,
      title: "Consider Edge Cases",
      description: "Handle null inputs and empty arrays",
      icon: IconSearch,
      color: "green"
    },
    {
      id: 4,
      title: "Code Structure",
      description: "Add comments to clarify complex sections",
      icon: IconBrain,
      color: "purple"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-black/40 backdrop-blur-sm border-blue-500/30 text-blue-400 shadow-lg shadow-blue-900/20",
      yellow: "bg-black/40 backdrop-blur-sm border-yellow-500/30 text-yellow-400 shadow-lg shadow-yellow-900/20",
      green: "bg-black/40 backdrop-blur-sm border-green-500/30 text-green-400 shadow-lg shadow-green-900/20",
      purple: "bg-black/40 backdrop-blur-sm border-purple-500/30 text-purple-400 shadow-lg shadow-purple-900/20"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="flex-1 flex flex-col h-full gap-4">
      {/* Main Content Area */}
      <div className="flex-1 flex gap-4">
        {/* Main Content Screen (Left Side) */}
        <div className="flex-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 frosted-glass">
          <div className="flex items-center gap-3 mb-4">
            <IconBrain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-200">Main Content Screen</h2>
          </div>
          
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconBrain className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-200 mb-2">AI Brain Active</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Your conversational AI assistant is ready to help with coding interviews, 
                algorithm discussions, and technical problem-solving.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Panels */}
        <div className="w-80 flex flex-col gap-4">
          {/* My Speech Panel */}
          <div className="flex-1 bg-black/30 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 frosted-glass">
            <div className="flex items-center gap-2 mb-3">
              <IconMicrophone className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-medium text-gray-200">My Speech</h3>
              <div className={`w-2 h-2 ${isConnected && isStreaming ? 'bg-green-500' : 'bg-gray-500'} rounded-full ${isConnected && isStreaming ? 'animate-pulse' : ''} ml-auto`}></div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300 h-24 overflow-y-auto">
              <p>{transcript}</p>
              <p className="italic text-gray-500">{interimTranscript}</p>
            </div>
          </div>

          {/* Other Speech Panel */}
          <div className="flex-1 bg-black/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4 frosted-glass">
            <div className="flex items-center gap-2 mb-3">
              <IconUsers className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-200">Other Speech</h3>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-auto"></div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-300">
              <p className="italic">Recording text and visualization...</p>
              <div className="flex items-center gap-2 mt-4">
                <IconWaveSquare className="w-4 h-4 text-blue-400" />
                <div className="flex-1 bg-blue-500/20 h-1 rounded-full">
                  <div className="bg-blue-500 h-1 rounded-full w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Recommendations Row */}
      <div className="grid grid-cols-4 gap-4 h-32">
        {recommendations.map((recommendation) => {
          const Icon = recommendation.icon
          return (
            <div
              key={recommendation.id}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer frosted-glass ${getColorClasses(recommendation.color)}`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium text-gray-200 truncate">
                    {recommendation.title}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {recommendation.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
