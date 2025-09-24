'use client'

import { useState, useEffect } from 'react'
import { Bot, X, Send, Loader2, MessageCircle } from 'lucide-react'
import { sendChatQuery } from '@/services/api'

export default function FloatingAIChat({ sessionId, conversationHistory, addToConversation, isAnalysisComplete, datasetInfo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  // Generate dynamic suggestions based on dataset
  useEffect(() => {
    if (isAnalysisComplete && datasetInfo) {
      const dynamicSuggestions = generateSuggestions(datasetInfo)
      setSuggestions(dynamicSuggestions)
    }
  }, [isAnalysisComplete, datasetInfo])

  const generateSuggestions = (datasetInfo) => {
    const suggestions = []
    const columns = datasetInfo.columns || []
    
    // Generic questions
    suggestions.push("Describe this dataset")
    
    // Column-specific suggestions
    if (columns.includes('Survived')) {
      suggestions.push("How many survived?", "Create survival chart")
    }
    if (columns.includes('Age')) {
      suggestions.push("Show age distribution", "What's the average age?")
    }
    if (columns.includes('Sex') || columns.includes('Gender')) {
      suggestions.push("Show gender distribution")
    }
    if (columns.includes('Pclass') || columns.includes('Class')) {
      suggestions.push("Create class chart")
    }
    if (columns.includes('Fare') || columns.includes('Price')) {
      suggestions.push("Show price distribution")
    }
    if (columns.includes('Salary') || columns.includes('Income')) {
      suggestions.push("Show salary distribution")
    }
    if (columns.includes('Category') || columns.includes('Type')) {
      suggestions.push("Show category breakdown")
    }
    
    // Generic data analysis
    suggestions.push("Show data summary")
    suggestions.push("Create a histogram")
    
    // Return first 6 suggestions
    return suggestions.slice(0, 6)
  }

  if (!isAnalysisComplete) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!query.trim() || !sessionId || isProcessing) return

    const userQuery = query.trim()
    setQuery('')
    setIsProcessing(true)

    try {
      addToConversation({
        role: 'user',
        content: userQuery,
        timestamp: new Date().toISOString()
      })

      console.log('Sending chat query:', userQuery)
      const response = await sendChatQuery({
        session_id: sessionId,
        user_query: userQuery,
        conversation_history: conversationHistory
      })

      console.log('Received response:', response)

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

  const handleSuggestionClick = (suggestion) => {
    if (!isProcessing) {
      setQuery(suggestion)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen ? (
        /* Floating Button */
        <div className="group relative">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center group-hover:scale-110 animate-float"
          >
            <Bot className="h-7 w-7 text-white" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Ask me about your data
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      ) : (
        /* Chat Interface */
        <div className="w-96 h-[32rem] bg-white/95 backdrop-blur-xl rounded-3xl shadow-premium border border-white/50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-500">Ask questions about your data</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
            {conversationHistory.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-gray-600 text-sm">Start by asking a question about your data!</p>
              </div>
            )}
            
            {conversationHistory.slice(-5).map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-br-md' 
                    : msg.type === 'error'
                    ? 'bg-red-50 text-red-800 rounded-bl-md border border-red-200'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  {msg.textResponse && msg.textResponse !== msg.content && (
                    <p className="text-sm mt-2 opacity-90">{msg.textResponse}</p>
                  )}
                  {msg.type === 'chart' && msg.chartData && !msg.chartData.error && (
                    <p className="text-sm mt-2 opacity-90">📊 Chart generated successfully!</p>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    <p className="text-sm">Analyzing your question...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200/50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your data..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 outline-none transition-all duration-300 text-sm"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white transition-all duration-300 disabled:opacity-50 hover:shadow-lg"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            
            {/* Dynamic Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isProcessing}
                  className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
