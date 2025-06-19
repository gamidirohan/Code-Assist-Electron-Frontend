import { IconHome, IconBrain } from "@tabler/icons-react"

interface HomePageProps {
  isMobileView: boolean
}

export const HomePage = ({ isMobileView }: HomePageProps) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-2">
          <IconHome className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-medium text-gray-200">Welcome Home</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-400 text-sm">Live Session</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <IconBrain className="w-8 h-8 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-200">AI Interview Assistant</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            Welcome to your intelligent coding interview companion! I'm here to help you analyze code, 
            debug issues, optimize algorithms, and prepare for technical interviews.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-400 mb-2">Code Analysis</h3>
              <p className="text-xs text-gray-400">
                Capture code screenshots and get instant analysis, optimization suggestions, and explanations.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-400 mb-2">Real-time Help</h3>
              <p className="text-xs text-gray-400">
                Get immediate assistance during coding sessions with intelligent suggestions and debugging.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 rounded-lg p-4 cursor-pointer group">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <IconHome className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Start Session</h3>
            <p className="text-xs text-gray-400">Begin a new coding session</p>
          </div>
          
          <div className="bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 rounded-lg p-4 cursor-pointer group">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <IconBrain className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">AI Help</h3>
            <p className="text-xs text-gray-400">Get intelligent assistance</p>
          </div>

          <div className="bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 rounded-lg p-4 cursor-pointer group">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Analytics</h3>
            <p className="text-xs text-gray-400">View performance stats</p>
          </div>

          <div className="bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 rounded-lg p-4 cursor-pointer group">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Settings</h3>
            <p className="text-xs text-gray-400">Configure preferences</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/40 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Code analysis completed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Algorithm optimization suggested</p>
                <p className="text-xs text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Debug session started</p>
                <p className="text-xs text-gray-500">10 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
