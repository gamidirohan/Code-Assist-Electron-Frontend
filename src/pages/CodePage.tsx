import { useState, useEffect } from "react"
import { IconCode, IconMicrophone, IconMicrophoneOff, IconUser, IconBrain } from "@tabler/icons-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CopyButton } from "../components/ui/copy-button"

interface CodePageProps {
  isMobileView: boolean
  screenshotQueue: Array<{path: string, preview: string}>
  setScreenshotQueue: (queue: Array<{path: string, preview: string}>) => void
  chatInput: string
  setChatInput: (input: string) => void
  selectedLanguage: string
  setSelectedLanguage: (language: string) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  conversationHistory: Array<{
    type: 'user' | 'ai' | 'processing'
    content: string
    screenshots?: Array<{path: string, preview: string}>
    timestamp: number
    solutionData?: any
  }>
  onSendMessage: () => void
}

export const CodePage = ({
  isMobileView,
  screenshotQueue,
  setScreenshotQueue,
  chatInput,
  setChatInput,
  selectedLanguage,
  setSelectedLanguage,
  isMuted,
  setIsMuted,
  conversationHistory,
  onSendMessage
}: CodePageProps) => {
  
  const handleSendMessage = async () => {
    if (!chatInput.trim() && screenshotQueue.length === 0) return
    onSendMessage()
  }

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
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2 conversation-scroll max-h-full"
           style={{
             scrollbarWidth: 'thin',
             scrollbarColor: '#4B5563 #1F2937'
           }}>
        <style>
          {`
          .conversation-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .conversation-scroll::-webkit-scrollbar-track {
            background: #1F2937;
            border-radius: 3px;
          }
          .conversation-scroll::-webkit-scrollbar-thumb {
            background: #4B5563;
            border-radius: 3px;
          }
          .conversation-scroll::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
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
                  Welcome to Code Analysis Mode! 🚀 I can help you analyze code screenshots, debug issues, optimize performance, and explain complex algorithms. Simply capture some code using <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+H</kbd> and describe what you'd like me to help with.
                </p>
              </div>
            </div>
            <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start justify-end`}>
              <div className="flex-1 max-w-[80%]">
                <p className={`text-gray-300 leading-relaxed bg-green-600/20 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm text-right`}>
                  Hey! I need help optimizing this algorithm. Let me capture the code first...
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
                /* AI Solution Response */
                <div className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm max-h-80 overflow-y-auto ai-response-scroll`}
                     style={{
                       scrollbarWidth: 'thin',
                       scrollbarColor: '#4B5563 #1F2937'
                     }}>
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
                                maxHeight: '300px',
                                overflow: 'auto'
                              }}
                              wrapLongLines={true}
                            >
                              {message.solutionData.Code.replace(/```python\n/g, '').replace(/```javascript\n/g, '').replace(/```java\n/g, '').replace(/```cpp\n/g, '').replace(/```\n?/g, '').trim()}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      )}

                      {/* Complexity Analysis */}
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
                          </div>
                        </div>
                      )}
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
                  />                  <button
                    onClick={() => {
                      const updatedQueue = screenshotQueue.filter((_, i) => i !== index);
                      setScreenshotQueue(updatedQueue);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-400 text-white text-xs rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Language Selector */}
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
}
