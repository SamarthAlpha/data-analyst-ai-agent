'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
})

export default function ChartRenderer({ chartData }) {
  const [error, setError] = useState(null)

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available</p>
      </div>
    )
  }

  if (chartData.error) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-800">{chartData.error}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-800">Error rendering chart: {error}</p>
      </div>
    )
  }

  try {
    // Extract data, layout, and config from the chart data
    const { data, layout = {}, config = {} } = chartData

    // Default responsive config
    const defaultConfig = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      displaylogo: false,
      ...config
    }

    // Default layout settings
    const defaultLayout = {
      autosize: true,
      margin: { l: 50, r: 50, t: 60, b: 50 },
      font: { size: 12 },
      ...layout
    }

    return (
      <div className="w-full plotly-chart">
        <Plot
          data={data}
          layout={defaultLayout}
          config={defaultConfig}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
          onError={(err) => {
            console.error('Plotly error:', err)
            setError(err.message || 'Unknown plotting error')
          }}
        />
      </div>
    )
  } catch (err) {
    console.error('Chart rendering error:', err)
    return (
      <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-800">
          Failed to render chart. Please try a different visualization.
        </p>
      </div>
    )
  }
}
