const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function performInitialAnalysis(file) {
  console.log('Uploading to:', API_BASE_URL + '/api/initial-analysis')
  
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/api/initial-analysis`, {
    method: 'POST',
    body: formData,
  })

  console.log('Response status:', response.status)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return await response.json()
}

export async function sendChatQuery({ session_id, user_query, conversation_history }) {
  const response = await fetch(`${API_BASE_URL}/api/chat-query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id,
      user_query,
      conversation_history: conversation_history.map(msg => ({
        role: msg.role,
        content: msg.content,
        type: msg.type || null,
        textResponse: msg.textResponse || null,
        chartData: msg.chartData || null,
        originalQuery: msg.originalQuery || null,
        timestamp: msg.timestamp || null
      }))
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return await response.json()
}

export async function cleanupSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/cleanup/${sessionId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    console.warn('Failed to cleanup session:', response.status)
  }

  return response.ok
}
