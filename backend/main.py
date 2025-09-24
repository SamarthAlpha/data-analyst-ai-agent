from dotenv import load_dotenv
import os

# Load environment variables FIRST
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import uuid
import tempfile
import json
from typing import List, Dict, Any
import asyncio
from pathlib import Path

from services.data_analyzer import DataAnalyzer
from services.ai_service import AIService
from models.schemas import ChatQueryRequest, InitialAnalysisResponse, ChatResponse

app = FastAPI(title="CSV Data Analyst AI", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory if it doesn't exist
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

# Initialize services
data_analyzer = DataAnalyzer()
ai_service = AIService()

@app.get("/")
async def root():
    return {"message": "CSV Data Analyst AI Backend"}

@app.post("/api/initial-analysis", response_model=InitialAnalysisResponse)
async def initial_analysis(file: UploadFile = File(...)):
    """
    Handle CSV file upload and perform initial analysis
    """
    try:
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Validate file type
        if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported")
        
        # Save uploaded file
        file_path = TEMP_DIR / f"{session_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Load data into pandas DataFrame
        try:
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
        # Save DataFrame as pickle for later use
        df_path = TEMP_DIR / f"{session_id}.pkl"
        df.to_pickle(df_path)
        
        # Perform initial analysis
        analysis_result = await data_analyzer.analyze_dataframe(df)
        
        return InitialAnalysisResponse(
            session_id=session_id,
            summary=analysis_result["summary"],
            charts=analysis_result["charts"],
            dataframe_info=analysis_result["dataframe_info"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/chat-query")
async def chat_query(request: ChatQueryRequest):
    """Handle chat queries with intelligent text/chart responses"""
    try:
        # Load DataFrame from session
        df_path = TEMP_DIR / f"{request.session_id}.pkl"
        if not df_path.exists():
            raise HTTPException(status_code=404, detail="Session not found")
        
        df = pd.read_pickle(df_path)
        
        # Get AI response (could be text or chart)
        response = await ai_service.generate_chart(
            df=df,
            user_query=request.user_query,
            conversation_history=request.conversation_history
        )
        
        return {"response": response}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.delete("/api/cleanup/{session_id}")
async def cleanup_session(session_id: str):
    """
    Clean up session files
    """
    try:
        df_path = TEMP_DIR / f"{session_id}.pkl"
        if df_path.exists():
            df_path.unlink()
        
        # Remove uploaded file
        for file_path in TEMP_DIR.glob(f"{session_id}_*"):
            file_path.unlink()
        
        return {"message": "Session cleaned up successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
