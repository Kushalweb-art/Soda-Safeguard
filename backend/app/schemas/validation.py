
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum

class ValidationCheckType(str, Enum):
    missing_values = "missing_values"
    unique_values = "unique_values"
    valid_values = "valid_values"
    value_range = "value_range"
    regex_match = "regex_match"
    schema = "schema"
    custom_sql = "custom_sql"

class DatasetInfo(BaseModel):
    id: str
    name: str
    type: str

class ValidationCheckCreate(BaseModel):
    name: str
    type: ValidationCheckType
    dataset: DatasetInfo
    table: Optional[str] = None
    column: Optional[str] = None
    parameters: Dict[str, Any]

class ValidationCheckResponse(BaseModel):
    id: str
    name: str
    type: str
    dataset: DatasetInfo
    table: Optional[str] = None
    column: Optional[str] = None
    parameters: Dict[str, Any]
    createdAt: str

class ValidationMetrics(BaseModel):
    rowCount: Optional[int] = None
    passedCount: Optional[int] = None
    failedCount: Optional[int] = None
    erroredCount: Optional[int] = None
    executionTimeMs: Optional[int] = None

class ValidationStatus(str, Enum):
    passed = "passed"
    warning = "warning"
    failed = "failed"
    error = "error"

class ValidationResultResponse(BaseModel):
    id: str
    checkId: str
    checkName: str
    dataset: DatasetInfo
    table: Optional[str] = None
    column: Optional[str] = None
    status: ValidationStatus
    metrics: ValidationMetrics
    failedRows: Optional[List[Dict[str, Any]]] = None
    errorMessage: Optional[str] = None
    createdAt: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
