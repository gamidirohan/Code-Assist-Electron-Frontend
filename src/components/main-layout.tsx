import { useEffect, useState } from 'react';

export const MainLayout = () => {
  return (
    <>
      {/* Main Content Area */}
      <div className="flex-1 flex gap-6">
        {/* Left Side - Main Content Screen */}
        <div className="flex-1 bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-8 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-gray-200 text-xl font-medium">Current Discussion</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-gray-400 text-sm">Live Transcription</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400">A</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-300 mb-1">Assistant</div>
                <div className="text-gray-400">I understand you're trying to implement a new authentication flow. Let's break down the requirements and discuss the best approach for your needs.</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400">U</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-300 mb-1">You</div>
                <div className="text-gray-400">Yes, we need to implement OAuth2 with support for multiple providers. The main challenge is handling the token refresh...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Speech Areas */}
        <div className="w-80 flex flex-col gap-6">
          {/* My Speech */}
          <div className="flex-1 bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px]">
            <div className="h-full flex flex-col">
              <div className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                My Speech
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="relative h-24 mb-4">
                  {/* Audio Waveform Visualization */}
                  <div className="absolute inset-0 flex items-center justify-around">
                    {[...Array(32)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-blue-400/60 rounded-full animate-pulse"
                        style={{
                          height: `${Math.sin(i * 0.5) * 50 + 50}%`,
                          animationDelay: `${i * 50}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="text-gray-400 text-sm text-center">
                  Speaking for 2:45
                </div>
              </div>
            </div>
          </div>

          {/* Other Speech */}
          <div className="flex-1 bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px]">
            <div className="h-full flex flex-col">
              <div className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Assistant Speech
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="relative h-24 mb-4">
                  {/* Audio Waveform Visualization */}
                  <div className="absolute inset-0 flex items-center justify-around opacity-30">
                    {[...Array(32)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        style={{
                          height: `${Math.cos(i * 0.5) * 30 + 30}%`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="text-gray-400 text-sm text-center">
                  Idle - Waiting for response
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Recommendations Grid */}
      <div className="grid grid-cols-2 gap-6 h-24">
        <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="text-gray-300">Generate Code Documentation</span>
          </div>
          <span className="text-gray-500 text-sm">⌘+1</span>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </div>
            <span className="text-gray-300">Refactor Implementation</span>
          </div>
          <span className="text-gray-500 text-sm">⌘+2</span>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-gray-300">Generate Test Cases</span>
          </div>
          <span className="text-gray-500 text-sm">⌘+3</span>
        </div>
        <div className="bg-gray-900/40 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-lg transition-all duration-200 hover:shadow-2xl hover:translate-y-[-2px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-gray-300">Optimize Performance</span>
          </div>
          <span className="text-gray-500 text-sm">⌘+4</span>
        </div>
      </div>
    </>
  );
};
