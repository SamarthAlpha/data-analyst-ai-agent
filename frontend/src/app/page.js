'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ReportDisplay from '@/components/ReportDisplay'
import FloatingAIChat from '@/components/FloatingAIChat'
import LoadingSpinner from '@/components/LoadingSpinner'
import { BarChart3, Brain, FileText, MessageSquare, Sparkles, TrendingUp, Database, Zap } from 'lucide-react'

export default function Home() {
  // Simple state management
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [charts, setCharts] = useState([])
  const [conversationHistory, setConversationHistory] = useState([])
  const [error, setError] = useState(null)
  const [dataframeInfo, setDataframeInfo] = useState(null)

  // Computed property
  const isAnalysisComplete = sessionId && !isLoading && summary

  // Handle successful analysis
  const handleAnalysisSuccess = (data) => {
    console.log('Analysis data received in page:', data)
    
    setSessionId(data.session_id)
    setSummary(data.summary)
    setCharts(data.charts || [])
    setDataframeInfo(data.dataframe_info || null)
    setConversationHistory([])
    setError(null)
    setIsLoading(false)
    
    console.log('State updated successfully')
  }

  // Handle analysis error
  const handleAnalysisError = (errorMessage) => {
    console.log('Analysis error:', errorMessage)
    setError(errorMessage)
    setIsLoading(false)
  }

  // Extract dataset columns from summary or dataframe info
  const getDatasetColumns = () => {
    // Try to get columns from dataframe info first
    if (dataframeInfo && dataframeInfo.columns) {
      return dataframeInfo.columns;
    }
    
    // Fallback: extract from summary text
    if (summary) {
      // Look for different patterns in the summary
      let match = summary.match(/### 🔢 Numeric Features \(\d+\)\n\*\*(.*?)\*\*/);
      if (match) {
        const numericCols = match[1].split(', ').map(col => col.trim());
        
        // Also try to get categorical columns
        const catMatch = summary.match(/### 🏷️ Categorical Features \(\d+\)\n\*\*(.*?)\*\*/);
        if (catMatch) {
          const categoricalCols = catMatch[1].split(', ').map(col => col.trim());
          return [...numericCols, ...categoricalCols];
        }
        return numericCols;
      }
      
      // Try alternative pattern
      match = summary.match(/Columns: (.*?)\n/);
      if (match) {
        return match[1].split(', ').map(col => col.trim());
      }
    }
    return [];
  };

  // Get dataset info for AI chat
  const getDatasetInfo = () => {
    const columns = getDatasetColumns();
    
    return {
      columns: columns,
      shape: dataframeInfo?.shape || [0, 0],
      numRows: dataframeInfo?.shape?.[0] || 0,
      numCols: dataframeInfo?.shape?.[1] || 0,
      dtypes: dataframeInfo?.dtypes || {},
      healthScore: dataframeInfo?.data_health_score || 0
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-glow animate-float">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">
                  Data Analyst AI
                </h1>
                <p className="text-gray-600 font-medium">
                  ✨ Intelligent data analysis at your fingertips
                </p>
              </div>
            </div>
            
            {sessionId && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Session Active</span>
                </div>
                <div className="success-badge">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ready for Analysis
                </div>
                {dataframeInfo && (
                  <div className="premium-badge">
                    <Database className="h-3 w-3 mr-1" />
                    {dataframeInfo.shape?.[0]?.toLocaleString()} rows × {dataframeInfo.shape?.[1]} cols
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!sessionId && !isLoading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <div className="mb-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-glow animate-float">
                  <BarChart3 className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-5xl font-bold gradient-text mb-6">
                  Upload Your Dataset
                </h2>
                <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                  Transform your raw data into actionable insights with our advanced AI-powered analysis platform. 
                  Upload your CSV file and watch as we automatically generate comprehensive reports, 
                  beautiful visualizations, and intelligent recommendations.
                </p>
              </div>
              
              {/* Upload Component */}
              <div className="mb-16">
                <FileUpload 
                  setLoading={setIsLoading}
                  setAnalysisData={handleAnalysisSuccess}
                  setError={handleAnalysisError}
                  error={error}
                />
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="stat-card group cursor-pointer">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Smart Analysis</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Comprehensive overview with data quality metrics, statistical insights, and anomaly detection
                  </p>
                </div>
                
                <div className="stat-card group cursor-pointer">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Auto Visualizations</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Beautiful, interactive charts generated automatically based on your data patterns and relationships
                  </p>
                </div>
                
                <div className="stat-card group cursor-pointer">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">AI Assistant</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Ask questions in natural language and get instant answers with custom visualizations
                  </p>
                </div>
              </div>

              {/* Additional Features */}
              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Multiple Formats</h5>
                    <p className="text-sm text-gray-600">CSV, Excel files</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Zap className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Lightning Fast</h5>
                    <p className="text-sm text-gray-600">Instant analysis</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">AI Powered</h5>
                    <p className="text-sm text-gray-600">Smart insights</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Interactive Charts</h5>
                    <p className="text-sm text-gray-600">Rich visualizations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <LoadingSpinner />
            <div className="mt-12 text-center">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                🧠 Analyzing your data
                <span className="loading-dots"></span>
              </h3>
              <p className="text-gray-600 text-lg max-w-md">
                Our AI is processing your dataset, identifying patterns, and creating beautiful visualizations
              </p>
              
              {/* Progress Steps */}
              <div className="mt-8 flex justify-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Data Processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Pattern Recognition</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Visualization Creation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnalysisComplete && (
          <div className="space-y-12 animate-slide-up">
            {/* Dataset Overview Card */}
            <div className="premium-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">Dataset Loaded Successfully</h2>
                    <p className="text-gray-600">Analysis complete and ready for exploration</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {dataframeInfo && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{dataframeInfo.shape?.[0]?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Rows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{dataframeInfo.shape?.[1]}</div>
                        <div className="text-sm text-gray-500">Columns</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{dataframeInfo.data_health_score || 95}%</div>
                        <div className="text-sm text-gray-500">Quality</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Quick Dataset Info */}
              {dataframeInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Data Size</h4>
                    </div>
                    <p className="text-blue-800">
                      {dataframeInfo.shape?.[0]?.toLocaleString()} rows × {dataframeInfo.shape?.[1]} columns
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Memory: {((dataframeInfo.memory_usage || 0) / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-900">Data Quality</h4>
                    </div>
                    <p className="text-emerald-800">
                      {dataframeInfo.data_health_score || 95}% Complete
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">
                      {Object.values(dataframeInfo.null_counts || {}).reduce((sum, count) => sum + count, 0)} missing values
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Ready for AI</h4>
                    </div>
                    <p className="text-purple-800">
                      {charts.length} charts generated
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Ask questions below
                    </p>
                  </div>
                </div>
              )}
            </div>

            <ReportDisplay 
              summary={summary} 
              charts={charts}
              conversationHistory={conversationHistory}
            />
            
            {/* Floating AI Chat with Dynamic Dataset Info */}
            <FloatingAIChat 
              sessionId={sessionId}
              conversationHistory={conversationHistory}
              addToConversation={(message) => {
                setConversationHistory(prev => [...prev, message])
              }}
              isAnalysisComplete={isAnalysisComplete}
              datasetInfo={getDatasetInfo()}
            />
          </div>
        )}
      </main>
    </div>
  )
}
