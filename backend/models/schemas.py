from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    type: Optional[str] = None  # "text", "chart", "error"
    textResponse: Optional[str] = None
    chartData: Optional[Dict[str, Any]] = None
    originalQuery: Optional[str] = None
    timestamp: Optional[str] = None

class ChatQueryRequest(BaseModel):
    session_id: str
    user_query: str
    conversation_history: List[ChatMessage]

class InitialAnalysisResponse(BaseModel):
    session_id: str
    summary: str
    charts: List[Dict[str, Any]]
    dataframe_info: Dict[str, Any]

class ChatResponse(BaseModel):
    response: Dict[str, Any]
