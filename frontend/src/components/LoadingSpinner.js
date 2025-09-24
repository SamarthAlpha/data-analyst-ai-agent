import { BarChart3 } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0">
          <div className="h-16 w-16 border-4 border-primary-200 rounded-full animate-pulse"></div>
        </div>
        <div className="relative">
          <div className="h-16 w-16 border-4 border-t-primary-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-primary-600 animate-pulse-slow" />
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
