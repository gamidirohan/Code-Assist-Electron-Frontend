import { IconMessage, IconBrain, IconUser } from "@tabler/icons-react"

interface MessagesPageProps {
  isMobileView: boolean
}

export const MessagesPage = ({ isMobileView }: MessagesPageProps) => {
  const conversations = [
    {
      id: 1,
      name: "AI Assistant",
      lastMessage: "I've analyzed your algorithm and found some optimizations...",
      timestamp: "2 min ago",
      unread: true,
      avatar: <IconBrain className="w-full h-full text-blue-400" />
    },
    {
      id: 2,
      name: "Code Review Bot",
      lastMessage: "Your latest solution looks great! Time complexity is optimal.",
      timestamp: "1 hour ago",
      unread: false,
      avatar: <IconMessage className="w-full h-full text-green-400" />
    },
    {
      id: 3,
      name: "Interview Prep",
      lastMessage: "Ready for the next practice session?",
      timestamp: "3 hours ago",
      unread: false,
      avatar: <IconUser className="w-full h-full text-purple-400" />
    }
  ]

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-2">
          <IconMessage className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-medium text-gray-200">Messages</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-gray-400 text-sm">Online</span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-800/60 ${
              conversation.unread 
                ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50' 
                : 'bg-gray-800/40 border-gray-700/50 hover:border-gray-700/70'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                {conversation.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium ${conversation.unread ? 'text-white' : 'text-gray-300'}`}>
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                </div>
                <p className={`text-sm leading-relaxed ${conversation.unread ? 'text-gray-300' : 'text-gray-400'}`}>
                  {conversation.lastMessage}
                </p>
                {conversation.unread && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 mt-6 grid grid-cols-3 gap-3">
        <button className="p-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 transition-all duration-200 group">
          <IconBrain className="w-5 h-5 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-gray-300 block">New Chat</span>
        </button>
        <button className="p-3 bg-green-500/20 hover:bg-green-500/30 rounded-lg border border-green-500/30 transition-all duration-200 group">
          <IconMessage className="w-5 h-5 text-green-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-gray-300 block">Code Review</span>
        </button>
        <button className="p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 transition-all duration-200 group">
          <IconUser className="w-5 h-5 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs text-gray-300 block">Interview</span>
        </button>
      </div>
    </div>
  )
}
