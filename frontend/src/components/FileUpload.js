'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'

export default function FileUpload({ setLoading, setAnalysisData, setError, error }) {

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Starting file upload...', file.name)
      
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)
      
      // Make the API call
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      console.log('Uploading to:', `${API_BASE_URL}/api/initial-analysis`)
      
      const response = await fetch(`${API_BASE_URL}/api/initial-analysis`, {
        method: 'POST',
        body: formData,
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Upload successful:', result)
      
      // Call the success handler
      setAnalysisData(result)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to analyze file')
    }
  }, [setLoading, setAnalysisData, setError])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer transition-all duration-300 ease-in-out
          border-2 border-dashed rounded-xl p-12
          ${isDragActive && !isDragReject
            ? 'border-primary-400 bg-primary-50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <div className="mx-auto mb-6">
            {isDragActive ? (
              <Upload className="h-12 w-12 text-primary-500 mx-auto animate-bounce" />
            ) : (
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            )}
          </div>
          
          <div className="space-y-2">
            {isDragActive ? (
              <p className="text-lg font-medium text-primary-700">
                Drop your file here
              </p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900">
                  Drop your CSV file here, or{' '}
                  <span className="text-primary-600 underline">browse</span>
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel files up to 50MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">Error</p>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* File Rejection Messages */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800">File rejected</p>
          </div>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.path} className="text-sm text-red-700">
              <p className="font-medium">{file.name}</p>
              <ul className="mt-1 space-y-1">
                {errors.map((error) => (
                  <li key={error.code} className="flex items-center space-x-1">
                    <span>•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Supported File Types */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Supported formats: CSV, XLS, XLSX • Maximum size: 50MB
        </p>
      </div>
    </div>
  )
}
