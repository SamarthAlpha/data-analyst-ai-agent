import { create } from 'zustand'
import { cleanupSession } from '@/services/api'

export const useAnalysisStore = create((set, get) => ({
  // State
  sessionId: null,
  isLoading: false,
  error: null,
  summary: '',
  charts: [],
  conversationHistory: [],
  dataframeInfo: null,

  // Computed
  get isAnalysisComplete() {
    const state = get()
    return state.sessionId && !state.isLoading && state.summary
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setAnalysisData: (data) => set({
    sessionId: data.session_id,
    summary: data.summary,
    charts: data.charts || [],
    dataframeInfo: data.dataframe_info,
    conversationHistory: [],
    error: null,
    isLoading: false
  }),

  addToConversation: (message) => set((state) => ({
    conversationHistory: [...state.conversationHistory, message]
  })),

  clearConversation: () => set({ conversationHistory: [] }),

  reset: async () => {
    const state = get()
    if (state.sessionId) {
      await cleanupSession(state.sessionId).catch(console.warn)
    }
    
    set({
      sessionId: null,
      isLoading: false,
      error: null,
      summary: '',
      charts: [],
      conversationHistory: [],
      dataframeInfo: null
    })
  },
}))
