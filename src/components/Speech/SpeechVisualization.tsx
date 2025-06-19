import { IconMicrophone, IconMessage } from "@tabler/icons-react"

interface SpeechVisualizationProps {
  isMobileView: boolean
}

export const SpeechVisualization = ({ isMobileView }: SpeechVisualizationProps) => {
  if (isMobileView) return null

  return (
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
  )
}
