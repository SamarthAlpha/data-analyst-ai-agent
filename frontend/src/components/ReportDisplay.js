'use client'

import { useState } from 'react'
import ChartRenderer from './ChartRenderer'
import { 
  BarChart3, MessageSquare, TrendingUp, Users, Database, 
  CheckCircle, AlertTriangle, Info, Zap, Target, Award, 
  Activity, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react'

export default function ReportDisplay({ summary, charts, conversationHistory }) {
  const [visibleInsights, setVisibleInsights] = useState(new Set())

  const toggleInsights = (chartIndex) => {
    const newVisible = new Set(visibleInsights)
    if (newVisible.has(chartIndex)) {
      newVisible.delete(chartIndex)
    } else {
      newVisible.add(chartIndex)
    }
    setVisibleInsights(newVisible)
  }

  const toggleAllInsights = () => {
    if (visibleInsights.size === charts.length) {
      setVisibleInsights(new Set())
    } else {
      setVisibleInsights(new Set(charts.map((_, index) => index)))
    }
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Enhanced Summary Section */}
      <div className="premium-card relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-glow">
              <Database className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold gradient-text">Dataset Analysis Report</h2>
              <p className="text-gray-600 text-lg">Comprehensive overview of your data</p>
            </div>
            <div className="ml-auto">
              <div className="success-badge text-lg px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Analysis Complete
              </div>
            </div>
          </div>

          {/* Enhanced Summary Content */}
          <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
            <div 
              className="prose prose-blue max-w-none prose-lg"
              dangerouslySetInnerHTML={{ 
                __html: summary
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-600 font-semibold">$1</strong>')
                  .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center"><span class="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>$1</h3>')
                  .replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6 flex items-center"><span class="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></span>$1</h2>')
                  .replace(/\n/g, '<br>')
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      {charts && charts.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-glow">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold gradient-text">Interactive Visualizations</h2>
                <p className="text-gray-600 text-lg">AI-generated charts with intelligent insights</p>
              </div>
            </div>
            
            {/* Insights Toggle */}
            <div className="flex items-center space-x-4">
              <div className="premium-badge">
                <Zap className="h-4 w-4 mr-2" />
                {charts.length} Charts Generated
              </div>
              <button
                onClick={toggleAllInsights}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                {visibleInsights.size === charts.length ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{visibleInsights.size === charts.length ? 'Hide All Insights' : 'Show All Insights'}</span>
              </button>
            </div>
          </div>

          {/* Charts List - FIXED: Each chart as completely independent block */}
          <div className="space-y-12">
            {charts.map((chart, index) => (
              <div key={index} className="w-full">
                {/* Chart Container - FIXED: Proper isolation */}
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-premium overflow-hidden">
                  {/* Chart Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center space-x-3">
                      {getChartIcon(chart.type)}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{chart.title}</h3>
                        <p className="text-gray-600">Interactive visualization with AI insights</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                        {chart.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <button
                        onClick={() => toggleInsights(index)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors font-medium"
                      >
                        {visibleInsights.has(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span>{visibleInsights.has(index) ? 'Hide' : 'Show'} Insights</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Chart Visualization - FIXED: Stable container without interference */}
                  <div className="p-6 bg-white">
                    <div className="w-full" style={{ minHeight: '400px' }}>
                      <ChartRenderer chartData={chart.data} />
                    </div>
                  </div>
                </div>

                {/* FIXED: Completely separate insights section */}
                {visibleInsights.has(index) && chart.insights && (
                  <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-lg overflow-hidden animate-slide-down">
                    {/* Insights Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold">AI-Generated Insights</h4>
                          <p className="text-indigo-100">Comprehensive analysis of {chart.title}</p>
                        </div>
                      </div>
                    </div>

                    {/* Insights Content */}
                    <div className="p-8">
                      <SimpleInsightsDisplay insights={chart.insights} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Conversation History */}
      {conversationHistory && conversationHistory.length > 0 && (
        <div className="premium-card">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-glow">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold gradient-text">AI Conversation</h2>
              <p className="text-gray-600 text-lg">Your questions and AI-generated insights</p>
            </div>
            <div className="ml-auto">
              <div className="premium-badge">
                <Users className="h-4 w-4 mr-2" />
                {conversationHistory.length} Interactions
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {conversationHistory.map((msg, index) => (
              <div key={index} className="space-y-6 animate-slide-up">
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-glow">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 conversation-bubble-user">
                      <p className="font-semibold mb-2 text-blue-100">You asked:</p>
                      <p className="text-lg">{msg.content}</p>
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {msg.role === 'assistant' && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-glow">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 max-w-4xl">
                      {/* Text Response */}
                      {msg.type === 'text' && msg.textResponse && (
                        <div className="conversation-bubble-ai">
                          <div className="flex items-center space-x-2 mb-4">
                            <Info className="h-5 w-5 text-emerald-600" />
                            <p className="font-semibold text-emerald-700">AI Analysis</p>
                          </div>
                          <div className="text-gray-800 whitespace-pre-line leading-relaxed text-lg">
                            {msg.textResponse}
                          </div>
                        </div>
                      )}
                      
                      {/* Chart Response */}
                      {msg.type === 'chart' && msg.chartData && !msg.chartData.error && (
                        <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                          <div className="flex items-center space-x-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                            <p className="font-semibold text-purple-700">Generated Visualization</p>
                          </div>
                          <ChartRenderer chartData={msg.chartData} />
                        </div>
                      )}
                      
                      {/* Error Response */}
                      {(msg.chartData?.error || msg.type === 'error') && (
                        <div className="bg-red-50/90 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6">
                          <div className="flex items-center space-x-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <p className="font-semibold text-red-700">Error</p>
                          </div>
                          <p className="text-red-800 leading-relaxed">
                            {msg.chartData?.error || msg.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// FIXED: Simple inline insights component
function SimpleInsightsDisplay({ insights }) {
  const [activeTab, setActiveTab] = useState('key_findings')

  if (!insights) {
    return (
      <div className="text-center py-12">
        <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No insights available for this chart.</p>
      </div>
    )
  }

  const sections = [
    { id: 'key_findings', label: '🎯 Key Findings', data: insights.key_findings || [] },
    { id: 'trends', label: '📈 Trends', data: insights.trends || [] },
    { id: 'comparisons', label: '📊 Comparisons', data: insights.comparisons || [] },
    { id: 'business_recommendations', label: '💡 Recommendations', data: insights.business_recommendations || [] }
  ]

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-gray-300 pb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === section.id
                ? 'bg-white text-indigo-600 shadow-lg border-2 border-indigo-200'
                : 'bg-white/50 text-gray-600 hover:bg-white/80 border-2 border-transparent'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] bg-white rounded-2xl p-8 shadow-inner border border-gray-200/50">
        {sections.map((section) => {
          if (activeTab !== section.id) return null
          
          return (
            <div key={section.id} className="space-y-4">
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-3xl mr-3">{section.label.split(' ')[0]}</span>
                {section.label.substring(2)}
              </h4>
              
              {Array.isArray(section.data) && section.data.length > 0 ? (
                <div className="space-y-4">
                  {section.data.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border-l-4 border-indigo-400">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed text-lg">{item}</p>
                    </div>
                  ))}
                </div>
              ) : typeof section.data === 'object' && section.data !== null ? (
                <div className="bg-gray-50 rounded-xl p-6">
                  <pre className="text-gray-700 whitespace-pre-wrap">{JSON.stringify(section.data, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No {section.label.toLowerCase()} available.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Statistical Significance - Special handling */}
      {activeTab === 'statistical_significance' && insights.statistical_significance && (
        <div className="bg-purple-50 rounded-2xl p-8 border border-purple-200 shadow-inner">
          <h4 className="text-2xl font-bold text-purple-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span>
            Statistical Analysis
          </h4>
          
          {typeof insights.statistical_significance === 'object' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(insights.statistical_significance).map(([key, value], index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <h5 className="font-semibold text-purple-800 mb-2 capitalize">
                    {key.replace('_', ' ')}
                  </h5>
                  <p className="text-gray-700">{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6">
              <p className="text-gray-700 text-lg">{insights.statistical_significance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getChartIcon(chartType) {
  const icons = {
    overview: <Database className="h-6 w-6 text-blue-600" />,
    histogram: <BarChart3 className="h-6 w-6 text-emerald-600" />,
    categorical: <Target className="h-6 w-6 text-purple-600" />,
    correlation: <Activity className="h-6 w-6 text-orange-600" />,
    survival_analysis: <Users className="h-6 w-6 text-red-600" />,
    age_analysis: <TrendingUp className="h-6 w-6 text-blue-600" />,
    gender_analysis: <Award className="h-6 w-6 text-pink-600" />,
    class_analysis: <Target className="h-6 w-6 text-purple-600" />,
    fare_analysis: <BarChart3 className="h-6 w-6 text-green-600" />,
    embarkation_analysis: <Database className="h-6 w-6 text-blue-600" />,
    family_analysis: <Users className="h-6 w-6 text-orange-600" />,
    default: <BarChart3 className="h-6 w-6 text-gray-600" />
  }
  
  return (
    <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
      {icons[chartType] || icons.default}
    </div>
  )
}
