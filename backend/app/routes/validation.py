
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
import uuid
from datetime import datetime
import psycopg2
from typing import Dict, Any, List
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.validation import ValidationCheck, ValidationResult
from app.models.postgres import PostgresConnection
from app.models.dataset import CsvDataset
from app.schemas.validation import ValidationCheckCreate, ValidationCheckResponse, ValidationResultResponse, ApiResponse

# Create the router
router = APIRouter()

async def run_validation_task(db_session: Session, check: ValidationCheck):
    """Run a validation check in the background"""
    try:
        # Run the validation based on the check type and dataset type
        dataset = json.loads(check.dataset)
        if dataset["type"] == "postgres":
            validation_result = await run_postgres_validation(db_session, check)
        else:
            validation_result = await run_csv_validation(db_session, check)
        
        # Save the result to the database
        new_result = ValidationResult(
            id=validation_result["id"],
            check_id=validation_result["checkId"],
            check_name=validation_result["checkName"],
            dataset=json.dumps(validation_result["dataset"]),
            table=validation_result["table"],
            column=validation_result["column"],
            status=validation_result["status"],
            metrics=json.dumps(validation_result["metrics"]),
            failed_rows=json.dumps(validation_result["failedRows"]) if "failedRows" in validation_result and validation_result["failedRows"] else None,
            error_message=validation_result["errorMessage"] if "errorMessage" in validation_result else None,
            created_at=datetime.now()
        )
        
        db_session.add(new_result)
        db_session.commit()
        
    except Exception as e:
        # Create an error result
        dataset_str = check.dataset if isinstance(check.dataset, str) else json.dumps(check.dataset)
        error_result = ValidationResult(
            id=f"result_{uuid.uuid4()}",
            check_id=check.id,
            check_name=check.name,
            dataset=dataset_str,
            table=check.table,
            column=check.column,
            status="error",
            metrics=json.dumps({}),
            error_message=str(e),
            created_at=datetime.now()
        )
        
        db_session.add(error_result)
        db_session.commit()

async def run_postgres_validation(db_session: Session, check: ValidationCheck) -> Dict[str, Any]:
    """Run validation on a PostgreSQL dataset"""
    # Get the PostgreSQL connection
    dataset_dict = json.loads(check.dataset) if isinstance(check.dataset, str) else check.dataset
    connection = db_session.query(PostgresConnection).filter(PostgresConnection.id == dataset_dict["id"]).first()
    if not connection:
        raise ValueError("PostgreSQL connection not found")
    
    # Connect to the database
    conn = psycopg2.connect(
        host=connection.host,
        port=connection.port,
        database=connection.database,
        user=connection.username,
        password=connection.password
    )
    
    cursor = conn.cursor()
    
    # Initialize variables
    start_time = datetime.now()
    failed_rows = []
    status = "passed"
    
    try:
        # Parse parameters
        parameters = json.loads(check.parameters) if isinstance(check.parameters, str) else check.parameters
        
        # Run validation based on check type
        if check.type == "missing_values":
            # Count total rows and rows with missing values
            cursor.execute(f'SELECT COUNT(*) FROM "{check.table}"')
            total_rows = cursor.fetchone()[0]
            
            cursor.execute(f'SELECT COUNT(*) FROM "{check.table}" WHERE "{check.column}" IS NULL OR TRIM("{check.column}"::TEXT) = \'\'')
            missing_count = cursor.fetchone()[0]
            
            # Get threshold settings
            warning_threshold = parameters.get("warningThreshold", 5)  # Default 5%
            failure_threshold = parameters.get("threshold", 10)  # Default 10%
            
            # Calculate actual percentage
            missing_percentage = (missing_count * 100) / total_rows if total_rows > 0 else 0
            
            # Determine status based on thresholds
            if missing_percentage > failure_threshold:
                status = "failed"
            elif missing_percentage > warning_threshold:
                status = "warning"
            else:
                status = "passed"
            
            if status != "passed":
                # Get examples of rows with missing values
                cursor.execute(f'''
                    SELECT * FROM "{check.table}" 
                    WHERE NULLIF(TRIM("{check.column}"::TEXT), '') IS NULL 
                    LIMIT 10
                ''')
                columns = [desc[0] for desc in cursor.description]
                
                for row in cursor.fetchall():
                    row_dict = dict(zip(columns, row))
                    row_dict["_reason"] = f'Missing value in column "{check.column}"'
                    failed_rows.append(row_dict)
            
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                "id": f"result_{uuid.uuid4()}",
                "checkId": check.id,
                "checkName": check.name,
                "dataset": dataset_dict,
                "table": check.table,
                "column": check.column,
                "status": status,
                "metrics": {
                    "rowCount": total_rows,
                    "executionTimeMs": execution_time,
                    "passedCount": total_rows - missing_count,
                    "failedCount": missing_count
                },
                "failedRows": failed_rows if failed_rows else None
            }
            
        elif check.type == "unique_values":
            # Count total rows and find duplicates
            cursor.execute(f'SELECT COUNT(*) FROM "{check.table}"')
            total_rows = cursor.fetchone()[0]
            
            cursor.execute(f'SELECT "{check.column}", COUNT(*) FROM "{check.table}" GROUP BY "{check.column}" HAVING COUNT(*) > 1')
            duplicates = cursor.fetchall()
            
            duplicate_count = sum(count - 1 for _, count in duplicates)
            
            # Get threshold settings
            warning_threshold = parameters.get("warningThreshold", 1)  # Default 1%
            failure_threshold = parameters.get("threshold", 5)  # Default 5%
            
            # Calculate actual percentage
            duplicate_percentage = (duplicate_count * 100) / total_rows if total_rows > 0 else 0
            
            # Determine status based on thresholds
            if duplicate_percentage > failure_threshold:
                status = "failed"
            elif duplicate_percentage > warning_threshold:
                status = "warning"
            else:
                status = "passed"
            
            if status != "passed":
                # Get examples of duplicated values
                for dup_value, _ in duplicates[:5]:
                    cursor.execute(f'SELECT * FROM "{check.table}" WHERE "{check.column}" = %s LIMIT 10', (dup_value,))
                    columns = [desc[0] for desc in cursor.description]
                    
                    for row in cursor.fetchall():
                        row_dict = dict(zip(columns, row))
                        row_dict["_reason"] = f'Duplicate value in column "{check.column}": {dup_value}'
                        failed_rows.append(row_dict)
            
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                "id": f"result_{uuid.uuid4()}",
                "checkId": check.id,
                "checkName": check.name,
                "dataset": dataset_dict,
                "table": check.table,
                "column": check.column,
                "status": status,
                "metrics": {
                    "rowCount": total_rows,
                    "executionTimeMs": execution_time,
                    "passedCount": total_rows - duplicate_count,
                    "failedCount": duplicate_count
                },
                "failedRows": failed_rows if failed_rows else None
            }
            
        # Add more validation types as needed...
            
        else:
            raise ValueError(f"Unsupported validation type: {check.type}")
            
    finally:
        conn.close()

async def run_csv_validation(db_session: Session, check: ValidationCheck) -> Dict[str, Any]:
    """Run validation on a CSV dataset"""
    # Get the CSV dataset
    dataset_dict = json.loads(check.dataset) if isinstance(check.dataset, str) else check.dataset
    dataset = db_session.query(CsvDataset).filter(CsvDataset.id == dataset_dict["id"]).first()
    if not dataset:
        raise ValueError("CSV dataset not found")
    
    # Parse CSV preview data and parameters
    preview_data = json.loads(dataset.preview_data) if isinstance(dataset.preview_data, str) else dataset.preview_data
    parameters = json.loads(check.parameters) if isinstance(check.parameters, str) else check.parameters
    
    # Initialize metrics
    start_time = datetime.now()
    failed_rows = []
    status = "passed"
    
    # Run validation based on check type
    if check.type == "missing_values":
        # Check for missing values in the preview data
        missing_in_preview = sum(1 for row in preview_data if not row.get(check.column))
        # Extrapolate to the full dataset
        estimated_missing = int((dataset.row_count * missing_in_preview) / len(preview_data)) if len(preview_data) > 0 else 0
        
        # Get threshold settings
        warning_threshold = parameters.get("warningThreshold", 5)  # Default 5%
        failure_threshold = parameters.get("threshold", 10)  # Default 10%
        
        # Calculate actual percentage
        missing_percentage = (estimated_missing * 100) / dataset.row_count if dataset.row_count > 0 else 0
        
        # Determine status based on thresholds
        if missing_percentage > failure_threshold:
            status = "failed"
        elif missing_percentage > warning_threshold:
            status = "warning"
        else:
            status = "passed"
        
        # Get examples of rows with missing values
        for row in preview_data:
            if not row.get(check.column):
                row_dict = row.copy()
                row_dict["_reason"] = f'Missing value in column "{check.column}"'
                failed_rows.append(row_dict)
        
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "id": f"result_{uuid.uuid4()}",
            "checkId": check.id,
            "checkName": check.name,
            "dataset": dataset_dict,
            "column": check.column,
            "status": status,
            "metrics": {
                "rowCount": dataset.row_count,
                "executionTimeMs": execution_time,
                "passedCount": dataset.row_count - estimated_missing,
                "failedCount": estimated_missing
            },
            "failedRows": failed_rows if failed_rows else None
        }
    
    # Add more validation types for CSV...
    
    else:
        raise ValueError(f"Unsupported validation type: {check.type}")

@router.post("/checks", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_validation_check(check: ValidationCheckCreate, db: Session = Depends(get_db)):
    """Create a new validation check"""
    try:
        # Create a new validation check
        new_check = ValidationCheck(
            id=f"check_{uuid.uuid4()}",
            name=check.name,
            type=check.type,
            dataset=json.dumps(check.dataset.dict()),
            table=check.table,
            column=check.column,
            parameters=json.dumps(check.parameters),
            created_at=datetime.now()
        )
        
        db.add(new_check)
        db.commit()
        db.refresh(new_check)
        
        return {
            "success": True,
            "data": new_check.to_dict()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ... keep existing code (API route handlers)
