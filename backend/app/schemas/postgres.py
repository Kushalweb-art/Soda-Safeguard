
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PostgresColumnSchema(BaseModel):
    name: str
    dataType: str

class PostgresTableSchema(BaseModel):
    name: str
    schema: str
    columns: List[PostgresColumnSchema]

class PostgresConnectionCreate(BaseModel):
    name: str
    host: str
    port: int
    database: str
    username: str
    password: str

class PostgresConnectionResponse(BaseModel):
    id: str
    name: str
    host: str
    port: int
    database: str
    username: str
    password: str
    createdAt: str
    tables: List[PostgresTableSchema] = []

class SchemaFetchParams(BaseModel):
    host: str
    port: int
    database: str
    username: str
    password: str

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    message: Optional[str] = None
    tables: Optional[List[PostgresTableSchema]] = None
