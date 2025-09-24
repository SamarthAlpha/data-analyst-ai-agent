import pandas as pd
import google.generativeai as genai
import os
import json
import asyncio
import tempfile
import sys
from typing import Dict, Any, List, Optional
from models.schemas import ChatMessage


class AIService:
    def __init__(self):
        # Initialize Gemini client
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def generate_chart(
        self, 
        df: pd.DataFrame, 
        user_query: str, 
        conversation_history: List[ChatMessage]
    ) -> Optional[Dict[str, Any]]:
        """
        Intelligently determine if user wants a chart or text answer
        """
        try:
            print(f"Processing query: {user_query}")
            
            # First, determine if user wants a chart or text answer
            intent = await self._determine_user_intent(user_query)
            print(f"Detected intent: {intent}")
            
            if intent == "chart":
                # Generate a chart
                return await self._generate_chart_response(df, user_query, conversation_history)
            else:
                # Generate a text response
                return await self._generate_text_response(df, user_query, conversation_history)
            
        except Exception as e:
            print(f"Error in generate_chart: {str(e)}")
            return {"error": f"Failed to process query: {str(e)}"}
    
    async def _determine_user_intent(self, user_query: str) -> str:
        """Determine if user wants a chart or text answer"""
        
        # Keywords that indicate chart creation request
        chart_keywords = [
            "plot", "chart", "graph", "visualize", "visualization", "show me a",
            "create a", "create", "make a", "draw", "histogram", "bar chart", 
            "line chart", "scatter plot", "pie chart", "heatmap", "box plot", 
            "distribution chart", "survival chart"
        ]
        
        # Keywords that indicate text/analysis request
        text_keywords = [
            "how many", "what is", "tell me", "explain", "analyze", "summary",
            "count", "average", "mean", "median", "total", "percentage", "why",
            "who", "when", "where", "which", "describe", "compare without"
        ]
        
        query_lower = user_query.lower()
        
        # Check for explicit chart requests
        if any(keyword in query_lower for keyword in chart_keywords):
            return "chart"
        
        # Check for text analysis requests
        if any(keyword in query_lower for keyword in text_keywords):
            return "text"
        
        # Default to text for ambiguous queries
        return "text"
    
    async def _generate_text_response(
        self, 
        df: pd.DataFrame, 
        user_query: str, 
        conversation_history: List[ChatMessage]
    ) -> Dict[str, Any]:
        """Generate a text response to answer the user's question"""
        try:
            print("Generating text response...")
            df_info = self._get_dataframe_summary(df)
            
            # Build conversation context
            context = ""
            if conversation_history:
                context = "\n\nPrevious conversation:\n"
                for msg in conversation_history[-3:]:  # Last 3 messages for context
                    context += f"{msg.role.title()}: {msg.content}\n"
            
            prompt = f"""You are an expert data analyst. Answer the user's question about their dataset using the information provided.

DATASET INFORMATION:
{df_info}

USER QUESTION: {user_query}
{context}

INSTRUCTIONS:
1. Provide a clear, direct answer to the user's question
2. Use specific numbers and data from the dataset when possible
3. Be concise but informative
4. If you need to perform calculations, describe them clearly
5. Don't suggest creating charts - just answer the question directly
6. Format your response in plain text, not markdown

Analyze the data and provide a direct answer to: {user_query}"""
            
            response = self.model.generate_content(prompt)
            answer = response.text.strip()
            print(f"Generated text response: {answer[:100]}...")
            
            return {
                "text_response": answer,
                "type": "text"
            }
            
        except Exception as e:
            print(f"Error in _generate_text_response: {str(e)}")
            return {"error": f"Failed to generate text response: {str(e)}"}
    
    async def _generate_chart_response(
        self, 
        df: pd.DataFrame, 
        user_query: str, 
        conversation_history: List[ChatMessage]
    ) -> Dict[str, Any]:
        """Generate a chart based on user request - try direct methods first"""
        try:
            print("Generating chart response...")
            query_lower = user_query.lower()
            
            # Try direct chart creation first
            if "survival" in query_lower and ("chart" in query_lower or "plot" in query_lower):
                print("Creating survival chart directly...")
                return await self._create_survival_chart_direct(df)
            elif "age" in query_lower and ("distribution" in query_lower or "chart" in query_lower or "histogram" in query_lower):
                print("Creating age chart directly...")
                return await self._create_age_chart_direct(df)
            elif ("class" in query_lower or "pclass" in query_lower) and ("chart" in query_lower or "bar" in query_lower):
                print("Creating class chart directly...")
                return await self._create_class_chart_direct(df)
            elif "gender" in query_lower or "sex" in query_lower:
                print("Creating gender chart directly...")
                return await self._create_gender_chart_direct(df)
            else:
                print("Using AI to generate chart...")
                return await self._generate_ai_chart(df, user_query)
            
        except Exception as e:
            print(f"Error in _generate_chart_response: {str(e)}")
            return {"error": f"Failed to generate chart: {str(e)}"}
    
    async def _create_survival_chart_direct(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Create survival chart directly without AI code generation"""
        try:
            if 'Survived' not in df.columns:
                return {"error": "Survival data not found in this dataset"}
            
            print("Creating survival pie chart...")
            
            # Simple survival count
            survived_counts = df['Survived'].value_counts()
            
            chart_data = {
                "data": [
                    {
                        "type": "pie",
                        "labels": ["Did not survive", "Survived"],
                        "values": [int(survived_counts.get(0, 0)), int(survived_counts.get(1, 0))],
                        "hole": 0.3,
                        "marker": {
                            "colors": ["#ef4444", "#10b981"]
                        },
                        "textinfo": "label+percent+value"
                    }
                ],
                "layout": {
                    "title": "Passenger Survival Distribution",
                    "height": 500,
                    "font": {"size": 12}
                }
            }
            
            print("Survival chart created successfully!")
            return {
                "chart_json": chart_data,
                "type": "chart"
            }
            
        except Exception as e:
            print(f"Error creating survival chart: {str(e)}")
            return {"error": f"Failed to create survival chart: {str(e)}"}
    
    async def _create_age_chart_direct(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Create age distribution chart directly"""
        try:
            if 'Age' not in df.columns:
                return {"error": "Age data not found in this dataset"}
            
            print("Creating age histogram...")
            
            age_data = df['Age'].dropna()
            
            chart_data = {
                "data": [
                    {
                        "type": "histogram",
                        "x": age_data.tolist(),
                        "nbinsx": 30,
                        "marker": {
                            "color": "#3b82f6",
                            "opacity": 0.7
                        },
                        "name": "Age Distribution"
                    }
                ],
                "layout": {
                    "title": "Age Distribution",
                    "xaxis": {"title": "Age (years)"},
                    "yaxis": {"title": "Count"},
                    "height": 500,
                    "font": {"size": 12}
                }
            }
            
            print("Age chart created successfully!")
            return {
                "chart_json": chart_data,
                "type": "chart"
            }
            
        except Exception as e:
            print(f"Error creating age chart: {str(e)}")
            return {"error": f"Failed to create age chart: {str(e)}"}
    
    async def _create_class_chart_direct(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Create passenger class chart directly"""
        try:
            if 'Pclass' not in df.columns:
                return {"error": "Passenger class data not found in this dataset"}
            
            print("Creating class bar chart...")
            
            class_counts = df['Pclass'].value_counts().sort_index()
            
            chart_data = {
                "data": [
                    {
                        "type": "bar",
                        "x": [f"Class {i}" for i in class_counts.index],
                        "y": class_counts.values.tolist(),
                        "marker": {
                            "color": ["#3b82f6", "#10b981", "#f59e0b"]
                        },
                        "text": class_counts.values.tolist(),
                        "textposition": "auto"
                    }
                ],
                "layout": {
                    "title": "Passenger Class Distribution",
                    "xaxis": {"title": "Passenger Class"},
                    "yaxis": {"title": "Count"},
                    "height": 500,
                    "font": {"size": 12}
                }
            }
            
            print("Class chart created successfully!")
            return {
                "chart_json": chart_data,
                "type": "chart"
            }
            
        except Exception as e:
            print(f"Error creating class chart: {str(e)}")
            return {"error": f"Failed to create class chart: {str(e)}"}
    
    async def _create_gender_chart_direct(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Create gender distribution chart directly"""
        try:
            if 'Sex' not in df.columns:
                return {"error": "Gender data not found in this dataset"}
            
            print("Creating gender pie chart...")
            
            gender_counts = df['Sex'].value_counts()
            
            chart_data = {
                "data": [
                    {
                        "type": "pie",
                        "labels": gender_counts.index.tolist(),
                        "values": gender_counts.values.tolist(),
                        "hole": 0.3,
                        "marker": {
                            "colors": ["#ec4899", "#3b82f6"]
                        },
                        "textinfo": "label+percent+value"
                    }
                ],
                "layout": {
                    "title": "Gender Distribution",
                    "height": 500,
                    "font": {"size": 12}
                }
            }
            
            print("Gender chart created successfully!")
            return {
                "chart_json": chart_data,
                "type": "chart"
            }
            
        except Exception as e:
            print(f"Error creating gender chart: {str(e)}")
            return {"error": f"Failed to create gender chart: {str(e)}"}
    
    async def _generate_ai_chart(self, df: pd.DataFrame, user_query: str) -> Dict[str, Any]:
        """Generate chart using AI for generic requests"""
        try:
            print("Generating chart using AI...")
            
            # Get basic info about the dataset
            columns = df.columns.tolist()
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            
            # Simple template-based approach
            query_lower = user_query.lower()
            
            if "histogram" in query_lower or "distribution" in query_lower:
                # Find the first numeric column mentioned or use the first numeric column
                target_col = None
                for col in numeric_cols:
                    if col.lower() in query_lower:
                        target_col = col
                        break
                if not target_col and numeric_cols:
                    target_col = numeric_cols[0]
                
                if target_col:
                    data = df[target_col].dropna()
                    chart_data = {
                        "data": [{
                            "type": "histogram",
                            "x": data.tolist(),
                            "nbinsx": 25,
                            "marker": {"color": "#3b82f6", "opacity": 0.7}
                        }],
                        "layout": {
                            "title": f"Distribution of {target_col}",
                            "xaxis": {"title": target_col},
                            "yaxis": {"title": "Count"},
                            "height": 500
                        }
                    }
                    return {"chart_json": chart_data, "type": "chart"}
            
            elif "bar" in query_lower or "count" in query_lower:
                # Find the first categorical column mentioned or use the first one
                target_col = None
                for col in categorical_cols:
                    if col.lower() in query_lower:
                        target_col = col
                        break
                if not target_col and categorical_cols:
                    target_col = categorical_cols[0]
                
                if target_col:
                    value_counts = df[target_col].value_counts().head(10)
                    chart_data = {
                        "data": [{
                            "type": "bar",
                            "x": value_counts.index.tolist(),
                            "y": value_counts.values.tolist(),
                            "marker": {"color": "#10b981"}
                        }],
                        "layout": {
                            "title": f"Distribution of {target_col}",
                            "xaxis": {"title": target_col},
                            "yaxis": {"title": "Count"},
                            "height": 500
                        }
                    }
                    return {"chart_json": chart_data, "type": "chart"}
            
            # Default: create a simple bar chart of the first categorical column
            if categorical_cols:
                col = categorical_cols[0]
                value_counts = df[col].value_counts().head(10)
                chart_data = {
                    "data": [{
                        "type": "bar",
                        "x": value_counts.index.tolist(),
                        "y": value_counts.values.tolist(),
                        "marker": {"color": "#8b5cf6"}
                    }],
                    "layout": {
                        "title": f"Distribution of {col}",
                        "xaxis": {"title": col},
                        "yaxis": {"title": "Count"},
                        "height": 500
                    }
                }
                return {"chart_json": chart_data, "type": "chart"}
            
            return {"error": "Could not determine what chart to create from your request"}
            
        except Exception as e:
            print(f"Error in AI chart generation: {str(e)}")
            return {"error": f"Failed to generate chart: {str(e)}"}
    
    def _get_dataframe_summary(self, df: pd.DataFrame) -> str:
        """Get a summary of the DataFrame for the AI prompt"""
        try:
            summary_parts = [
                f"Shape: {df.shape[0]} rows, {df.shape[1]} columns",
                f"Columns: {', '.join(df.columns.tolist())}",
                "",
                "Column Details:"
            ]
            
            for col in df.columns[:15]:  # Limit to first 15 columns
                dtype = str(df[col].dtype)
                non_null_count = df[col].notna().sum()
                null_count = df[col].isnull().sum()
                
                # Get sample values
                sample_vals = df[col].dropna().head(3).tolist()
                sample_str = ', '.join([str(v)[:30] for v in sample_vals])  # Shorter sample
                
                summary_parts.append(f"- {col} ({dtype}): {non_null_count} non-null, {null_count} null. Sample: {sample_str}")
            
            return "\n".join(summary_parts)
        except Exception as e:
            return f"Error generating summary: {str(e)}"
