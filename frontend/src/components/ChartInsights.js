'use client'

import { useState } from 'react'
import { 
  ChevronDown, ChevronUp, TrendingUp, BarChart3, 
  Target, Lightbulb, FlaskConical, ArrowRight,
  CheckCircle, AlertTriangle, Info
} from 'lucide-react'

export default function ChartInsights({ insights, chartTitle, isVisible = true }) {
  const [expandedSection, setExpandedSection] = useState('key_findings')
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!insights || !isVisible) {
    return null
  }

  const sections = [
    {
      id: 'key_findings',
      title: 'Key Findings',
      icon: Target,
      color: 'blue',
      data: insights.key_findings || []
    },
    {
      id: 'statistical_significance',
      title: 'Statistical Analysis',
      icon: FlaskConical,
      color: 'purple',
      data: insights.statistical_significance
    },
    {
      id: 'trends',
      title: 'Trend Analysis',
      icon: TrendingUp,
      color: 'emerald',
      data: insights.trends || []
    },
    {
      id: 'comparisons',
      title: 'Comparative Insights',
      icon: BarChart3,
      color: 'orange',
      data: insights.comparisons || []
    },
    {
      id: 'business_recommendations',
      title: 'Business Recommendations',
      icon: Lightbulb,
      color: 'yellow',
      data: insights.business_recommendations || []
    }
  ]

  const getColorClasses = (color) => ({
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  }[color])

  const getIconColorClasses = (color) => ({
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    orange: 'text-orange-600 bg-orange-100',
    yellow: 'text-yellow-600 bg-yellow-100'
  }[color])

  return (
    <div className="mt-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
            <p className="text-indigo-100 text-sm">Intelligent analysis of {chartTitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-6">
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = expandedSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setExpandedSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Section Content */}
          {sections.map((section) => {
            if (expandedSection !== section.id) return null
            
            const Icon = section.icon
            const colorClasses = getColorClasses(section.color)
            const iconColorClasses = getIconColorClasses(section.color)

            return (
              <div key={section.id} className="animate-fade-in">
                <div className={`rounded-xl border-2 p-6 ${colorClasses}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${iconColorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-semibold">{section.title}</h4>
                  </div>

                  {/* Key Findings */}
                  {section.id === 'key_findings' && (
                    <div className="space-y-3">
                      {section.data.map((finding, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          </div>
                          <p className="text-sm leading-relaxed">{finding}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Statistical Significance */}
                  {section.id === 'statistical_significance' && (
                    <div className="space-y-4">
                      {typeof section.data === 'object' && section.data !== null ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-white/60 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">Test Performed</h5>
                            <p className="text-sm">{section.data.test || 'N/A'}</p>
                          </div>
                          <div className="p-4 bg-white/60 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">P-Value</h5>
                            <p className="text-sm font-mono">{section.data.p_value || 'N/A'}</p>
                          </div>
                          <div className="p-4 bg-white/60 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">Result</h5>
                            <div className="flex items-center space-x-2">
                              {section.data.result?.includes('significant') ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              <p className="text-sm">{section.data.result || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-white/60 rounded-lg">
                            <h5 className="font-medium text-purple-800 mb-2">Interpretation</h5>
                            <p className="text-sm">{section.data.interpretation || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-white/60 rounded-lg">
                          <p className="text-sm">{section.data}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Trends, Comparisons */}
                  {(['trends', 'comparisons'].includes(section.id)) && (
                    <div className="space-y-3">
                      {section.data.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
                          <div className="flex-shrink-0 mt-0.5">
                            <ArrowRight className="h-4 w-4 text-emerald-500" />
                          </div>
                          <p className="text-sm leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business Recommendations */}
                  {section.id === 'business_recommendations' && (
                    <div className="space-y-3">
                      {section.data.map((recommendation, index) => (
                        <div key={index} className="p-4 bg-white/60 rounded-lg border-l-4 border-yellow-400">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
