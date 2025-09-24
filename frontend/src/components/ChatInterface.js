'use client'

import { useState } from 'react'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { sendChatQuery } from '@/services/api'

export default function ChatInterface({ sessionId, conversationHistory, addToConversation, isAnalysisComplete }) {
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!query.trim() || !sessionId || isProcessing) return

    const userQuery = query.trim()
    setQuery('')
    setIsProcessing(true)

    try {
      // Add user message to conversation
      addToConversation({
        role: 'user',
        content: userQuery,
        timestamp: new Date().toISOString()
      })

      // Send query to backend
      const response = await sendChatQuery({
        session_id: sessionId,
        user_query: userQuery,
        conversation_history: conversationHistory
      })

      // Add AI response based on type
      if (response.response.type === 'text') {
        addToConversation({
          role: 'assistant',
          content: response.response.text_response,
          textResponse: response.response.text_response,
          originalQuery: userQuery,
          type: 'text',
          timestamp: new Date().toISOString()
        })
      } else if (response.response.type === 'chart') {
        addToConversation({
          role: 'assistant',
          content: 'Generated visualization',
          chartData: response.response.chart_json,
          originalQuery: userQuery,
          type: 'chart',
          timestamp: new Date().toISOString()
        })
      } else if (response.response.error) {
        addToConversation({
          role: 'assistant',
          content: response.response.error,
          originalQuery: userQuery,
          type: 'error',
          timestamp: new Date().toISOString()
        })
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message to conversation
      addToConversation({
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        originalQuery: userQuery,
        type: 'error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isAnalysisComplete) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ask Questions About Your Data
          </h3>
          <p className="text-sm text-gray-600">
            Ask questions or request custom charts and insights
          </p>
        </div>
      </div>

      {/* Chat Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'How many passengers survived?' or 'Create a bar chart of passenger classes'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isProcessing}
            className="btn-primary flex items-center space-x-2 px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </form>

        {/* Example Queries */}
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-sm text-gray-600 w-full mb-2">Try asking:</p>
          {[
            "How many passengers survived?",
            "What was the average age?",
            "Create a bar chart of passenger classes",
            "Show survival rate by gender"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              disabled={isProcessing}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-sm text-blue-800">
                Analyzing your request...
                <span className="loading-dots"></span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
