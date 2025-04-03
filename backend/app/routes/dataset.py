
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.orm import Session
import uuid
from datetime import datetime
import pandas as pd
import csv
import json
import io

from app.database import get_db
from app.models.dataset import CsvDataset
from app.schemas.dataset import (
    CsvDatasetCreate,
    CsvDatasetResponse,
    ApiResponse
)

router = APIRouter()

@router.get("/csv", response_model=ApiResponse)
async def get_all_csv_datasets(db: Session = Depends(get_db)):
    """Get all CSV datasets"""
    datasets = db.query(CsvDataset).order_by(CsvDataset.uploaded_at.desc()).all()
    return {
        "success": True,
        "data": [dataset.to_dict() for dataset in datasets]
    }

@router.get("/csv/{dataset_id}", response_model=ApiResponse)
async def get_csv_dataset_by_id(dataset_id: str, db: Session = Depends(get_db)):
    """Get a CSV dataset by ID"""
    dataset = db.query(CsvDataset).filter(CsvDataset.id == dataset_id).first()
    if not dataset:
        return {
            "success": False,
            "error": "Dataset not found"
        }
    
    return {
        "success": True,
        "data": dataset.to_dict()
    }

@router.delete("/csv/{dataset_id}", response_model=ApiResponse)
async def delete_csv_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a CSV dataset by ID"""
    dataset = db.query(CsvDataset).filter(CsvDataset.id == dataset_id).first()
    if not dataset:
        return {
            "success": False,
            "error": "Dataset not found"
        }
    
    db.delete(dataset)
    db.commit()
    
    return {
        "success": True,
        "data": {"message": f"Dataset {dataset_id} deleted successfully"}
    }

@router.post("/csv/upload", response_model=ApiResponse)
async def upload_csv_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a CSV file and parse it"""
    try:
        if not file.filename.endswith('.csv'):
            return {
                "success": False,
                "error": "File must be a CSV"
            }
        
        # Read file content
        contents = await file.read()
        
        # Parse CSV using pandas
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Get column names
        columns = df.columns.tolist()
        
        # Get row count
        row_count = len(df)
        
        # Get preview data (first few rows)
        preview_data = df.head(3).to_dict(orient='records')
        
        # Create dataset object
        new_dataset = CsvDataset(
            id=f"csv_{uuid.uuid4()}",
            name=file.filename.replace('.csv', ''),
            file_name=file.filename,
            uploaded_at=datetime.now(),
            columns=columns,
            row_count=row_count,
            preview_data=preview_data
        )
        
        # Save to database
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)
        
        return {
            "success": True,
            "data": new_dataset.to_dict()
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing CSV file: {str(e)}"
        }
