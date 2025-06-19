import { IconBulb, IconCode, IconSearch, IconBrain } from "@tabler/icons-react"

interface BottomRecommendationsProps {
  isMobileView: boolean
}

export const BottomRecommendations = ({ isMobileView }: BottomRecommendationsProps) => {
  if (isMobileView) return null

  const recommendations = [
    {
      icon: IconBulb,
      text: "Suggest optimization approaches",
      color: "amber"
    },
    {
      icon: IconCode,
      text: "Show code examples", 
      color: "blue"
    },
    {
      icon: IconSearch,
      text: "Analyze time complexity",
      color: "green"
    },
    {
      icon: IconBrain,
      text: "Explain concepts",
      color: "purple"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      amber: "text-amber-400 group-hover:text-amber-300",
      blue: "text-blue-400 group-hover:text-blue-300", 
      green: "text-green-400 group-hover:text-green-300",
      purple: "text-purple-400 group-hover:text-purple-300"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="grid grid-cols-4 gap-6 h-24">
      {recommendations.map((item, index) => {
        const Icon = item.icon
        return (
          <div 
            key={index}
            className="bg-neutral-900/80 hover:bg-neutral-900/90 transition-all duration-300 backdrop-blur-md border border-neutral-800/50 rounded-xl shadow-lg hover:shadow-2xl p-4 flex items-center gap-3 cursor-pointer group"
          >
            <Icon className={`w-6 h-6 ${getColorClasses(item.color)} transition-colors`} />
            <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">
              {item.text}
            </span>
          </div>
        )
      })}
    </div>
  )
}
