import React from 'react'
import { IconBrain, IconUser } from "@tabler/icons-react"

interface ChatPageProps {
  isMobileView: boolean
}

export const ChatPage: React.FC<ChatPageProps> = ({ isMobileView }) => {
  return (
    <div className={`flex-1 flex flex-col ${isMobileView ? 'gap-2' : 'gap-4'} overflow-y-auto`}>
      {/* AI Message */}
      <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start`}>
        <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-blue-500/20 flex items-center justify-center`}>
          <IconBrain className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
        </div>
        <div className="flex-1">
          <p className={`text-gray-300 leading-relaxed bg-gray-800/40 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm`}>
            I can help you with general questions, creative tasks, or anything you'd like to discuss. What's on your mind?
          </p>
        </div>
      </div>
      
      {/* User Message */}
      <div className={`flex ${isMobileView ? 'gap-2' : 'gap-3'} items-start justify-end`}>
        <div className="flex-1 max-w-[80%]">
          <p className={`text-gray-300 leading-relaxed bg-blue-600/20 rounded-xl ${isMobileView ? 'p-2 text-xs' : 'p-4 text-sm'} shadow-sm text-right`}>
            How do I improve my productivity when working from home?
          </p>
        </div>
        <div className={`${isMobileView ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-blue-600/20 flex items-center justify-center`}>
          <IconUser className={`${isMobileView ? 'w-4 h-4' : 'w-5 h-5'} text-blue-400`} />
        </div>
      </div>
    </div>
  )
}
